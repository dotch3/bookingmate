import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '../services/apiClient';

interface SlotConfig {
  slotNames: string[];
  maxCapacityPerSlot: number;
  isActive: boolean;
  lastUpdated?: string;
}

const SlotConfigManagement: React.FC = () => {
  const [config, setConfig] = useState<SlotConfig>({
    slotNames: ['Morning', 'Afternoon', 'Evening'],
    maxCapacityPerSlot: 2,
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSlotName, setNewSlotName] = useState('');

  useEffect(() => {
    fetchSlotConfig();
  }, []);

  const fetchSlotConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/slots/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error fetching slot config:', error);
      toast.error('Failed to load slot configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveSlotConfig = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/slots/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast.success('Slot configuration updated successfully');
        await fetchSlotConfig();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update slot configuration');
      }
    } catch (error) {
      console.error('Error saving slot config:', error);
      toast.error('Failed to save slot configuration');
    } finally {
      setSaving(false);
    }
  };

  const addSlot = () => {
    if (newSlotName.trim() && !config.slotNames.includes(newSlotName.trim())) {
      setConfig(prev => ({
        ...prev,
        slotNames: [...prev.slotNames, newSlotName.trim()]
      }));
      setNewSlotName('');
    } else {
      toast.error('Slot name is empty or already exists');
    }
  };

  const removeSlot = (index: number) => {
    if (config.slotNames.length > 1) {
      setConfig(prev => ({
        ...prev,
        slotNames: prev.slotNames.filter((_, i) => i !== index)
      }));
    } else {
      toast.error('At least one slot is required');
    }
  };

  const updateSlotName = (index: number, newName: string) => {
    const updatedSlots = [...config.slotNames];
    updatedSlots[index] = newName;
    setConfig(prev => ({
      ...prev,
      slotNames: updatedSlots
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-white">Loading slot configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div 
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2rem'
        }}
      >
        {/* Header */}
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '2rem'
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">Slot Configuration</h2>
          <p className="text-slate-300">Manage time slots and capacity settings for reservations</p>
        </div>

        {/* Capacity Settings */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Capacity Settings</h3>
          <div 
            style={{
              background: 'rgba(51, 65, 85, 0.4)',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Maximum Reservations Per Slot
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={config.maxCapacityPerSlot}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                maxCapacityPerSlot: parseInt(e.target.value) || 1
              }))}
              style={{
                width: '200px',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(30, 41, 59, 0.8)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            <p className="text-sm text-slate-400 mt-2">
              Current setting: {config.maxCapacityPerSlot} reservation{config.maxCapacityPerSlot !== 1 ? 's' : ''} per slot
            </p>
          </div>
        </div>

        {/* Slot Names Management */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Time Slots</h3>
          
          {/* Current Slots */}
          <div className="space-y-3 mb-6">
            {config.slotNames.map((slotName, index) => (
              <div 
                key={index}
                style={{
                  background: 'rgba(51, 65, 85, 0.4)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <input
                  type="text"
                  value={slotName}
                  onChange={(e) => updateSlotName(index, e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white'
                  }}
                />
                <button
                  onClick={() => removeSlot(index)}
                  disabled={config.slotNames.length <= 1}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: config.slotNames.length <= 1 
                      ? 'rgba(107, 114, 128, 0.5)' 
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.6) 100%)',
                    color: 'white',
                    cursor: config.slotNames.length <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add New Slot */}
          <div 
            style={{
              background: 'rgba(51, 65, 85, 0.4)',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <h4 className="text-lg font-medium text-white mb-3">Add New Slot</h4>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter slot name (e.g., Morning, Group 1)"
                value={newSlotName}
                onChange={(e) => setNewSlotName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSlot()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: 'white'
                }}
              />
              <button
                onClick={addSlot}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.6) 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSlotConfig}
            disabled={saving}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: saving 
                ? 'rgba(107, 114, 128, 0.5)' 
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.8) 100%)',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

        {/* Configuration Summary */}
        {config.lastUpdated && (
          <div 
            style={{
              marginTop: '2rem',
              padding: '1rem',
              background: 'rgba(51, 65, 85, 0.3)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <p className="text-sm text-slate-400">
              Last updated: {new Date(config.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotConfigManagement;