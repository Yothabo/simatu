type TelemetryDetails = Record<string, string | number | boolean | null | undefined>;

let activeFlowId: string | null = null;
let activeFlowStartedAt = 0;
const readyDatasets = new Set<string>();
let dashboardReadyLogged = false;

function now(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function beginAdminFlow(): string {
  activeFlowId = createId();
  activeFlowStartedAt = now();
  readyDatasets.clear();
  dashboardReadyLogged = false;
  return activeFlowId;
}

export function getAdminFlowId(): string {
  if (!activeFlowId) beginAdminFlow();
  return activeFlowId as string;
}

export function clearAdminFlow(): void {
  activeFlowId = null;
  activeFlowStartedAt = 0;
  readyDatasets.clear();
  dashboardReadyLogged = false;
}

export function createAdminRequestId(): string {
  return createId();
}

export function startAdminTimer(): number {
  return now();
}

export function logAdminTiming(
  event: string,
  requestId: string,
  startedAt: number,
  details: TelemetryDetails = {},
): void {
  console.info('[admin-telemetry]', JSON.stringify({
    event,
    requestId,
    flowId: activeFlowId,
    durationMs: Math.max(0, Math.round(now() - startedAt)),
    ...details,
  }));
}

export function logAdminMilestone(
  event: string,
  details: TelemetryDetails = {},
): void {
  if (!activeFlowId) getAdminFlowId();
  console.info('[admin-telemetry]', JSON.stringify({
    event,
    flowId: activeFlowId,
    elapsedSinceFlowStartMs: Math.max(0, Math.round(now() - activeFlowStartedAt)),
    ...details,
  }));
}

export function markAdminDatasetReady(
  dataset: 'products' | 'orders' | 'activities',
  rowCount: number,
  source: 'network' | 'cache',
): void {
  readyDatasets.add(dataset);
  logAdminMilestone('admin.dataset.ready', { dataset, rowCount, source });

  if (
    !dashboardReadyLogged &&
    ['products', 'orders', 'activities'].every((name) => readyDatasets.has(name))
  ) {
    dashboardReadyLogged = true;
    logAdminMilestone('admin.dashboard.data_ready', {
      datasets: 'products,orders,activities',
    });
  }
}
