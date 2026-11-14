import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Persist administrator authentication across application restarts.
// Migrate an existing session from sessionStorage when available.
const customStorage = {
  getItem: (key: string) => {
    try {
      const persistentValue = localStorage.getItem(key);

      if (persistentValue) {
        return persistentValue;
      }

      const temporaryValue = sessionStorage.getItem(key);

      if (temporaryValue) {
        localStorage.setItem(key, temporaryValue);
        sessionStorage.removeItem(key);
      }

      return temporaryValue;
    } catch {
      return sessionStorage.getItem(key);
    }
  },

  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } catch {
      sessionStorage.setItem(key, value);
    }
  },

  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Continue with session storage cleanup.
    }

    try {
      sessionStorage.removeItem(key);
    } catch {
      // Storage may be unavailable.
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: customStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
