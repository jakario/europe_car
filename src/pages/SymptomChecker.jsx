import React, { useState } from 'react';
import db from '../data/db.json';

const severityColors = {
  critical: { bg: 'rgba(255, 51, 51, 0.15)', border: '#ff3333', text: '#ff5555', label: '⛔ วิกฤต' },
  high: { bg: 'rgba(255, 159, 0, 0.15)', border: '#ff9f00', text: '#ffb340', label: '⚠️ สูง' },
  medium: { bg: 'rgba(0, 243, 255, 0.15)', border: '#00f3ff', text: '#00f3ff', label: 'ℹ️ ปานกลาง' },
};

const categoryIcons = {
  Engine: '🔥',
  Transmission: '⚙️',
  Suspension: '🛞',
  Electrical: '⚡',
};

const SymptomChecker = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const categories = ['All', 'Engine', 'Transmission', 'Suspension', 'Electrical'];

  const filteredSymptoms = activeCategory === 'All'
    ? db.symptoms
    : db.symptoms.filter((s) => s.category === activeCategory);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="neon-text-blue" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Symptom Checker
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          เรียกดูอาการเสียทั้งหมดแยกตามหมวดหมู่ พร้อมรายละเอียดจากคู่มือรถยุโรป
        </p>
      </div>

      {/* Category Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '20px',
              border: activeCategory === cat ? 'none' : '1px solid var(--border-color)',
              backgroundColor: activeCategory === cat ? 'var(--accent-blue)' : 'transparent',
              color: activeCategory === cat ? '#0f0f13' : 'var(--text-primary)',
              fontWeight: activeCategory === cat ? '700' : '400',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.25s ease',
              fontSize: '0.95rem',
            }}
          >
            {categoryIcons[cat] || '📋'} {cat === 'All' ? 'ทั้งหมด' : cat}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'flex', gap: '1.5rem', marginBottom: '2rem', padding: '1rem 1.5rem',
        backgroundColor: 'rgba(0,243,255,0.05)', borderRadius: '10px', border: '1px solid rgba(0,243,255,0.1)',
      }}>
        <div>
          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-blue)' }}>{filteredSymptoms.length}</span>
          <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.9rem' }}>อาการที่พบ</span>
        </div>
        <div>
          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-amber)' }}>
            {filteredSymptoms.filter((s) => s.severity === 'critical').length}
          </span>
          <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.9rem' }}>ระดับวิกฤต</span>
        </div>
        <div>
          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{db.brands.length}</span>
          <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.9rem' }}>ยี่ห้อ</span>
        </div>
      </div>

      {/* Symptom Cards */}
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {filteredSymptoms.map((s, idx) => {
          const sev = severityColors[s.severity] || severityColors.medium;
          const isExpanded = expandedId === (s.id || idx);

          return (
            <div
              key={s.id || idx}
              className="glass-panel"
              style={{
                borderLeft: `4px solid ${sev.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onClick={() => setExpandedId(isExpanded ? null : (s.id || idx))}
            >
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{categoryIcons[s.category] || '📋'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {s.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{s.code}</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>{s.symptom}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '10px',
                    backgroundColor: sev.bg, color: sev.text, border: `1px solid ${sev.border}40`,
                  }}>
                    {sev.label}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.3s ease-in-out' }}>
                  {/* Solution */}
                  <div style={{
                    backgroundColor: 'rgba(255, 159, 0, 0.08)', padding: '1rem 1.25rem', borderRadius: '10px',
                    borderLeft: '3px solid var(--accent-amber)', marginBottom: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span>⚡</span>
                      <strong style={{ color: 'var(--accent-amber)', fontSize: '0.95rem' }}>การแก้ไข</strong>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.7' }}>{s.solution}</p>
                  </div>

                  {/* Brands */}
                  {s.brands && s.brands.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>พบในรถยี่ห้อ:</span>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {s.brands.map((b) => (
                          <span key={b} style={{
                            fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
                            backgroundColor: 'rgba(0, 243, 255, 0.08)', color: 'var(--accent-blue)',
                            border: '1px solid rgba(0, 243, 255, 0.2)',
                          }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related keywords */}
                  {s.keywords && s.keywords.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>คำค้นหาที่เกี่ยวข้อง:</span>
                      <div style={{ display: 'inline-flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                        {s.keywords.slice(0, 8).map((kw) => (
                          <span key={kw} style={{
                            fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                            backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}>
                            {kw}
                          </span>
                        ))}
                        {s.keywords.length > 8 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            +{s.keywords.length - 8} อื่นๆ
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SymptomChecker;
