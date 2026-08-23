import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { CustomDropdown } from '../common/CustomDropdown';
import { Zap, Play, RotateCcw } from 'lucide-react';

export const TrafficSimulator: React.FC = () => {
  const { runLiveSimulationBurst, resetEventData } = useEventContext();
  const [burstCount, setBurstCount] = useState<number>(20);
  const [injectFraud, setInjectFraud] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      runLiveSimulationBurst(burstCount, injectFraud);
      setIsSimulating(false);
    }, 300);
  };

  const burstOptions = [
    { value: '10', label: '10 Attendees' },
    { value: '25', label: '25 Attendees' },
    { value: '50', label: '50 Surge Burst' },
  ];

  return (
    <div className="vibe-card" style={{
      marginBottom: '20px',
      padding: '16px 20px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', borderRadius: 'var(--radius-xs)', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)' }}>
            <Zap size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
              Traffic & Fraud Simulation Engine
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Inject batch attendees & test duplicate pass sharing blocks in real-time
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <CustomDropdown
            options={burstOptions}
            value={burstCount.toString()}
            onChange={(val) => setBurstCount(parseInt(val) || 20)}
            width={160}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#fff', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={injectFraud}
              onChange={(e) => setInjectFraud(e.target.checked)}
            />
            <span>Include Fraud</span>
          </label>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="vibe-btn vibe-btn-primary vibe-btn-sm"
            style={{ height: '34px' }}
          >
            <Play size={12} />
            <span>{isSimulating ? 'Running...' : 'Run Simulation'}</span>
          </button>

          <button
            onClick={resetEventData}
            className="vibe-btn vibe-btn-secondary vibe-btn-sm"
            style={{ height: '34px' }}
            title="Reset to initial clean state"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
