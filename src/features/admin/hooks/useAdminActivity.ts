import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { supabase } from '../../../utils/supabase';
import { isAdminActivities, type AdminActivity } from './adminActivity.types';
import {
  createAdminRequestId,
  getAdminFlowId,
  logAdminTiming,
  markAdminDatasetReady,
  startAdminTimer,
} from '../auth/adminRequestTelemetry';
import toast from 'react-hot-toast';
import { ADMIN_STORAGE_KEYS } from '../constants/admin.constants';
import {
  readAdminSnapshot,
  writeAdminSnapshot,
} from '../utils/adminSnapshot';

export function useAdminActivity(
  isAdmin: boolean | null,
  userId: string | null
) {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  const adminRef = useRef(isAdmin);
  const userIdRef = useRef(userId);
  const generationRef = useRef(0);
  const previousScopeRef = useRef({ isAdmin, userId });

  if (
    previousScopeRef.current.isAdmin !== isAdmin ||
    previousScopeRef.current.userId !== userId
  ) {
    generationRef.current += 1;
    previousScopeRef.current = { isAdmin, userId };
  }

  adminRef.current = isAdmin;
  userIdRef.current = userId;

  const loadActivities = useCallback(async () => {
    if (isAdmin !== true || !userId) return;

    const requestGeneration = generationRef.current;
    const requestUserId = userId;

    const isCurrentRequest = () =>
      requestGeneration === generationRef.current &&
      adminRef.current === true &&
      userIdRef.current === requestUserId;

    const requestId = createAdminRequestId();
    const flowId = getAdminFlowId();
    const totalStartedAt = startAdminTimer();
    let totalTimingLogged = false;

    try {
      const sessionStartedAt = startAdminTimer();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      logAdminTiming('admin.activity.session_lookup', requestId, sessionStartedAt, {
        outcome: sessionError ? 'error' : session ? 'session_found' : 'missing_session',
      });

      if (
        sessionError ||
        !session?.access_token ||
        session.user.id !== requestUserId
      ) {
        throw new Error(
          'Your admin session has expired. Please sign in again.'
        );
      }

      const fetchStartedAt = startAdminTimer();
      const response = await fetch('/api/activity', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Accept: 'application/json',
          'X-Request-ID': requestId,
          'X-Admin-Flow-ID': flowId,
        },
      });
      logAdminTiming('admin.activity.fetch', requestId, fetchStartedAt, {
        httpStatus: response.status,
      });

      const parseStartedAt = startAdminTimer();
      const data = await response.json();
      logAdminTiming('admin.activity.parse', requestId, parseStartedAt, {
        rowCount: Array.isArray(data.activities) ? data.activities.length : null,
      });

      if (!response.ok) {
        logAdminTiming('admin.activity.total', requestId, totalStartedAt, {
          httpStatus: response.status,
          outcome: 'http_error',
        });
        totalTimingLogged = true;
        throw new Error(data.error || 'Unable to load activities.');
      }

      if (!isAdminActivities(data.activities)) {
        throw new Error('The activities response has an invalid format.');
      }

      if (!isCurrentRequest()) return;

      setActivities(data.activities);
      markAdminDatasetReady('activities', data.activities.length, 'network');
      logAdminTiming('admin.activity.total', requestId, totalStartedAt, {
        httpStatus: response.status,
        outcome: 'success',
      });
      totalTimingLogged = true;
      writeAdminSnapshot(
        ADMIN_STORAGE_KEYS.activitiesCache,
        requestUserId,
        data.activities
      );
    } catch (error) {
      if (!totalTimingLogged) {
        logAdminTiming('admin.activity.total', requestId, totalStartedAt, {
          outcome: 'error',
          errorName: error instanceof Error ? error.name : 'UnknownError',
        });
      }
      if (isCurrentRequest()) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Unable to load activities.'
        );
      }
    } finally {
      if (isCurrentRequest()) {
        setIsLoadingActivities(false);
      }
    }
  }, [isAdmin, userId]);

  useLayoutEffect(() => {
    if (isAdmin !== true || !userId) {
      setActivities([]);
      setIsLoadingActivities(false);
      return;
    }

    const cachedActivities = readAdminSnapshot(
      ADMIN_STORAGE_KEYS.activitiesCache,
      userId,
      isAdminActivities
    );

    if (cachedActivities) {
      setActivities(cachedActivities);
      markAdminDatasetReady('activities', cachedActivities.length, 'cache');
      setIsLoadingActivities(false);
      return;
    }

    setActivities([]);
    setIsLoadingActivities(true);
    void loadActivities();
  }, [isAdmin, userId, loadActivities]);

  return {
    activities,
    isLoadingActivities,
    loadActivities,
  };
}
