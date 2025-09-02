import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

export interface SlotConfig {
  id?: string;
  slotNames: string[];
  maxCapacityPerSlot: number;
  isActive: boolean;
  lastUpdated?: string;
}

const DEFAULT_SLOT_CONFIG: SlotConfig = {
  slotNames: ['morning', 'afternoon', 'evening'],
  maxCapacityPerSlot: 2,
  isActive: true
};

export const useSlotConfig = () => {
  const [slotConfig, setSlotConfig] = useState<SlotConfig>(DEFAULT_SLOT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlotConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getSlotConfig();
      if (response && response.config) {
        setSlotConfig(response.config);
      } else {
        setSlotConfig(DEFAULT_SLOT_CONFIG);
      }
    } catch (err: any) {
      console.error('Error fetching slot config:', err);
      setError(err.message || 'Failed to fetch slot configuration');
      // Use default config on error
      setSlotConfig(DEFAULT_SLOT_CONFIG);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotConfig();
  }, []);

  return {
    slotConfig,
    loading,
    error,
    refetch: fetchSlotConfig
  };
};