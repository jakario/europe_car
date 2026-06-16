import React, { useState } from 'react';
import db from '../data/db.json';

const MaintenancePlanner = () => {
  const [mileage, setMileage] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [tasks, setTasks] = useState(null);

  const calculateMaintenance = (e) => {
    e.preventDefault();
    const currentKm = parseInt(mileage.replace(/,/g, ''));
    if (isNaN(currentKm) || currentKm < 0) return;

    // Determine which tasks are applicable
    const applicableTasks = db.maintenance.map((m) => {
      let status = 'upcoming'; // upcoming, due, overdue
      let urgency = 0;

      if (m.type === 'Basic') {
        status = 'always';
        urgency = 1;
      } else {
        // Calculate cycles: how many times this service should have been done
        const interval = m.maxKm - m.minKm > 0 ? m.maxKm : m.minKm;
        if (interval > 0) {
          const cyclesDone = Math.floor(currentKm / interval);
          const nextDueKm = (cyclesDone + 1) * interval;
          const kmUntilDue = nextDueKm - currentKm;

          if (kmUntilDue <= 0) {
            status = 'overdue';
            urgency = 3;
          } else if (kmUntilDue <= 3000) {
            status = 'due';
            urgency = 2;
          } else {
            status = 'upcoming';
            urgency = 1;
          }
        }
      }

      return { ...m, status, urgency };
    });

    // Sort: overdue first, then due, then upcoming, then always
    applicableTasks.sort((a, b) => b.urgency - a.urgency);
    setTasks(applicableTasks);
  };

  const statusStyles = {
    overdue: { color: '#ff5555', bg: 'rgba(255,51,51,0.1)', border: '#ff3333', label: '⛔ เลยกำหนด' },
    due: { color: '#ffb340', bg: 'rgba(255,159,0,0.1)', border: '#ff9f00', label: '⚠️ ใกล้ถึงกำหนด' },
    upcoming: { color: '#00f3ff', bg: 'rgba(0,243,255,0.1)', border: '#00f3ff', label: '🔵 ยังไม่ถึงกำหนด' },
    always: { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.05)', border: 'var(--border-color)', label: '🔄 ตรวจสอบเป็นประจำ' },
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="neon-text-amber" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Maintenance Planner
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          กรอกเลขไมล์ปัจจุบันของรถเพื่อดู Checklist บำรุงรักษาตามคู่มือ
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-panel" style={{ maxWidth: '700px', marginBottom: '3rem' }}>
        <form onSubmit={calculateMaintenance} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              ระยะทางปัจจุบัน (กม.)
            </label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="เช่น 45000"
              required
              min="0"
              style={{
                width: '100%', padding: '1rem', fontSize: '1.2rem',
                backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)',
                borderRadius: '8px', color: 'var(--text-primary)', outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-amber)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              ยี่ห้อรถ
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{
                width: '100%', padding: '1rem', fontSize: '1rem',
                backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)',
                borderRadius: '8px', color: 'var(--text-primary)', outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All">ทุกยี่ห้อ</option>
              {db.brands.map((b) => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-amber" style={{ padding: '1rem 2rem', height: 'fit-content' }}>
            คำนวณ
          </button>
        </form>
      </div>

      {/* Results */}
      {tasks && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          {/* Summary Banner */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem',
            marginBottom: '2rem',
          }}>
            <div className="glass-panel" style={{ textAlign: 'center', borderTop: '3px solid #ff3333' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ff5555' }}>
                {tasks.filter((t) => t.status === 'overdue').length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>เลยกำหนด</div>
            </div>
            <div className="glass-panel" style={{ textAlign: 'center', borderTop: '3px solid #ff9f00' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffb340' }}>
                {tasks.filter((t) => t.status === 'due').length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ใกล้ถึงกำหนด</div>
            </div>
            <div className="glass-panel" style={{ textAlign: 'center', borderTop: '3px solid #00f3ff' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#00f3ff' }}>
                {tasks.filter((t) => t.status === 'upcoming').length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ยังไม่ถึงกำหนด</div>
            </div>
            <div className="glass-panel" style={{ textAlign: 'center', borderTop: '3px solid var(--border-color)' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {tasks.filter((t) => t.status === 'always').length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ตรวจสอบเป็นประจำ</div>
            </div>
          </div>

          {/* Task List */}
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Checklist สำหรับ {parseInt(mileage).toLocaleString()} กม.
            {selectedBrand !== 'All' && <span style={{ color: 'var(--accent-blue)' }}> — {selectedBrand}</span>}
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {tasks.map((t, idx) => {
              const st = statusStyles[t.status];
              return (
                <div
                  key={idx}
                  className="glass-panel"
                  style={{
                    borderLeft: `4px solid ${st.border}`,
                    display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                  }}
                >
                  {/* Status Icon */}
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    border: `2px solid ${st.color}`,
                    flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    backgroundColor: t.status === 'overdue' ? 'rgba(255,51,51,0.2)' : 'transparent',
                    marginTop: '2px',
                  }}>
                    {t.status === 'overdue' && <span style={{ fontSize: '0.7rem' }}>!</span>}
                    {t.status === 'due' && <span style={{ fontSize: '0.9rem', color: st.color }}>•</span>}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{t.interval}</h4>
                      <span style={{
                        fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '10px',
                        backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}40`,
                      }}>
                        {st.label}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                      }}>
                        {t.type}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.6' }}>{t.items}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      <em>📌 {t.notes}</em>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        select option {
          background-color: #1c1c24;
          color: #e0e0e0;
        }
      `}</style>
    </div>
  );
};

export default MaintenancePlanner;
