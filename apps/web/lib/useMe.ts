'use client';

import { useEffect, useState } from 'react';
import api from './api';

export interface ManagedBrand {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
  sector?: string;
  monthlyBudget?: number;
  spentBudget?: number;
}

export interface Me {
  id: string;
  phone: string;
  name?: string;
  role: 'user' | 'brand_manager' | 'admin';
  brandManagers?: { brand: ManagedBrand }[];
}

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        setMe(data.data);
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isAdmin = me?.role === 'admin';
  const myBrands: ManagedBrand[] = (me?.brandManagers || []).map((m) => m.brand);

  return { me, loading, isAdmin, myBrands };
}
