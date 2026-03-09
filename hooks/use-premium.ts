/**
 * usePremium — 프리미엄 상태 관리
 * expo-secure-store 사용, 없으면 AsyncStorage 폴백
 * 실제 결제 연동 시 이 hook만 수정하면 됨
 */
import { useCallback, useEffect, useState } from 'react';

// expo-secure-store optional
let SecureStore: typeof import('expo-secure-store') | null = null;
try {
  SecureStore = require('expo-secure-store');
} catch {
  SecureStore = null;
}

// AsyncStorage 폴백
let AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | null = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

const PREMIUM_KEY = 'ott_premium_status';
const PREMIUM_EXPIRY_KEY = 'ott_premium_expiry';

export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime' | null;

export type PremiumState = {
  isPremium: boolean;
  plan: PremiumPlan;
  expiresAt: string | null;
};

async function storeGet(key: string): Promise<string | null> {
  try {
    if (SecureStore) return await SecureStore.getItemAsync(key);
    if (AsyncStorage) return await AsyncStorage.getItem(key);
    return null;
  } catch {
    return null;
  }
}

async function storeSet(key: string, value: string): Promise<void> {
  try {
    if (SecureStore) { await SecureStore.setItemAsync(key, value); return; }
    if (AsyncStorage) await AsyncStorage.setItem(key, value);
  } catch {}
}

async function storeDel(key: string): Promise<void> {
  try {
    if (SecureStore) { await SecureStore.deleteItemAsync(key); return; }
    if (AsyncStorage) await AsyncStorage.removeItem(key);
  } catch {}
}

export function usePremium() {
  const [state, setState] = useState<PremiumState>({
    isPremium: false,
    plan: null,
    expiresAt: null,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const plan = (await storeGet(PREMIUM_KEY)) as PremiumPlan;
      const expiresAt = await storeGet(PREMIUM_EXPIRY_KEY);

      if (!plan) {
        setState({ isPremium: false, plan: null, expiresAt: null });
        return;
      }

      if (plan !== 'lifetime' && expiresAt) {
        const expired = new Date(expiresAt) < new Date();
        if (expired) {
          await storeDel(PREMIUM_KEY);
          await storeDel(PREMIUM_EXPIRY_KEY);
          setState({ isPremium: false, plan: null, expiresAt: null });
          return;
        }
      }

      setState({ isPremium: true, plan, expiresAt });
    } catch (e) {
      console.error('[usePremium] load 실패', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activate = useCallback(async (plan: PremiumPlan) => {
    if (!plan) return;
    let expiresAt: string | null = null;

    if (plan === 'monthly') {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      expiresAt = d.toISOString();
    } else if (plan === 'yearly') {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      expiresAt = d.toISOString();
    }

    await storeSet(PREMIUM_KEY, plan);
    if (expiresAt) await storeSet(PREMIUM_EXPIRY_KEY, expiresAt);
    setState({ isPremium: true, plan, expiresAt });
  }, []);

  const deactivate = useCallback(async () => {
    await storeDel(PREMIUM_KEY);
    await storeDel(PREMIUM_EXPIRY_KEY);
    setState({ isPremium: false, plan: null, expiresAt: null });
  }, []);

  return { ...state, loading, activate, deactivate };
}
