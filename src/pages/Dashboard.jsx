import React, { useState, useMemo } from 'react';
import db from '../data/db.json';
import { searchSymptoms, searchParts } from '../utils/fuzzySearch';

const severityColors = {
  critical: { bg: 'rgba(255, 51, 51, 0.15)', border: '#ff3333', text: '#ff5555', label: '⛔ วิกฤต' },
  high: { bg: 'rgba(255, 159, 0, 0.15)', border: '#ff9f00', text: '#ffb340', label: '⚠️ สูง' },
  medium: { bg: 'rgba(0, 243, 255, 0.15)', border: '#00f3ff', text: '#00f3ff', label: 'ℹ️ ปานกลาง' },
};

const Dashboard = () => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { symptoms: [], parts: [] };

    const symptomResults = searchSymptoms(query, db.symptoms);
    const partResults = searchParts(query, db.parts);

    return {
      symptoms: symptomResults,
      parts: partResults,
    };
  }, [query]);

  const totalResults = results.symptoms.length + results.parts.length;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
        <h1 className="neon-text-blue" style={{ fontSize: '2.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '3px' }}>
          ตรวจสอบคู่มือรถยนต์ 7 แบรนด์ใหญ่
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          ค้นหาอาการเสีย, รหัสไฟเตือน, หรือชิ้นส่วนรถยนต์ยุโรป — พิมพ์ภาษาพูดได้เลย
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.3rem', opacity: 0.5 }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="พิมพ์อาการ เช่น เร่งไม่ได้, เครื่องร้อน, เบรกเสียงดัง ..."
            style={{
              width: '100%',
              padding: '1.5rem 2rem 1.5rem 3.5rem',
              fontSize: '1.15rem',
              backgroundColor: 'rgba(28, 28, 36, 0.8)',
              border: '2px solid var(--accent-blue)',
              borderRadius: '50px',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: '0 0 20px rgba(0, 243, 255, 0.2)',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => (e.target.style.boxShadow = '0 0 30px rgba(0, 243, 255, 0.5)')}
            onBlur={(e) => (e.target.style.boxShadow = '0 0 20px rgba(0, 243, 255, 0.2)')}
          />
        </div>

        {/* Quick Examples */}
        {!query && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
            {['เร่งไม่ได้', 'เครื่องร้อน', 'เบรกเสียงดัง', 'แบตหมด', 'Gearbox', 'ช่วงล่าง'].map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--accent-blue)';
                  e.target.style.color = 'var(--accent-blue)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {query.trim() && (
        <div style={{ marginTop: '2.5rem', animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>ผลการค้นหา</h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              พบ <span className="neon-text-blue">{totalResults}</span> รายการ
            </span>
          </div>

          {totalResults === 0 && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔧</p>
              <p style={{ color: 'var(--text-secondary)' }}>ไม่พบผลลัพธ์สำหรับ "{query}"</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ลองพิมพ์คำอื่น เช่น "เกียร์กระตุก", "เครื่องสั่น", "ไฟเตือน"</p>
            </div>
          )}

          {/* Symptom Results */}
          {results.symptoms.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 className="neon-text-amber" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                🚨 อาการเสียและการวินิจฉัย ({results.symptoms.length})
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {results.symptoms.map(({ item: s, score, coverage }, idx) => {
                  const sev = severityColors[s.severity] || severityColors.medium;
                  return (
                    <div
                      key={s.id || idx}
                      className="glass-panel"
                      style={{ borderLeft: `4px solid ${sev.border}`, position: 'relative' }}
                    >
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', margin: 0 }}>{s.code}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
                          {/* Match Score Badge */}
                          <span style={{
                            fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '10px',
                            backgroundColor: coverage >= 0.8 ? 'rgba(0,243,255,0.2)' : 'rgba(255,255,255,0.08)',
                            color: coverage >= 0.8 ? 'var(--accent-blue)' : 'var(--text-secondary)',
                            border: `1px solid ${coverage >= 0.8 ? 'rgba(0,243,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                          }}>
                            {Math.round(coverage * 100)}% match
                          </span>
                          {/* Severity Badge */}
                          <span style={{
                            fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '10px',
                            backgroundColor: sev.bg, color: sev.text,
                            border: `1px solid ${sev.border}40`,
                          }}>
                            {sev.label}
                          </span>
                          {/* Category Badge */}
                          <span style={{
                            fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '12px',
                            backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                            color: 'var(--text-secondary)',
                          }}>
                            {s.category}
                          </span>
                        </div>
                      </div>

                      {/* Symptom Description */}
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.7' }}>{s.symptom}</p>

                      {/* Solution Box */}
                      <div style={{
                        backgroundColor: 'rgba(255, 159, 0, 0.08)', padding: '1rem', borderRadius: '10px',
                        borderLeft: '3px solid var(--accent-amber)', marginBottom: '1rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span>⚡</span>
                          <strong style={{ color: 'var(--accent-amber)', fontSize: '0.9rem' }}>การแก้ไข</strong>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{s.solution}</p>
                      </div>

                      {/* Brand Tags */}
                      {s.brands && s.brands.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '0.3rem' }}>พบในรถ:</span>
                          {s.brands.map((b) => (
                            <span key={b} style={{
                              fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '4px',
                              backgroundColor: 'rgba(0, 243, 255, 0.08)', color: 'var(--accent-blue)',
                              border: '1px solid rgba(0, 243, 255, 0.2)',
                            }}>
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parts Results */}
          {results.parts.length > 0 && (
            <div>
              <h3 className="neon-text-blue" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                🔧 ชิ้นส่วนและตำแหน่ง ({results.parts.length})
              </h3>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {results.parts.map(({ item: p }, idx) => (
                  <div key={idx} className="glass-panel" style={{ borderLeft: '4px solid var(--accent-blue)', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>{p.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1, lineHeight: '1.6' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>ตำแหน่ง:</strong> {p.location}
                    </p>
                    {p.notes && (
                      <div style={{
                        fontSize: '0.85rem', color: 'var(--accent-amber)',
                        backgroundColor: 'rgba(255, 159, 0, 0.05)', padding: '0.6rem 0.8rem', borderRadius: '6px',
                        borderLeft: '2px solid var(--accent-amber)',
                      }}>
                        ⚠️ {p.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brand Showcase when no query */}
      {!query.trim() && (
        <div style={{ marginTop: '4rem' }}>
          <h3 style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>
            รองรับคู่มือรถยนต์ {db.brands.length} ยี่ห้อ
          </h3>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', maxWidth: '800px', margin: '0 auto' }}>
            {db.brands.map((brand) => (
              <div
                key={brand.name}
                className="glass-panel"
                style={{ textAlign: 'center', padding: '1.5rem 1rem', cursor: 'pointer' }}
                onClick={() => setQuery(brand.name)}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{brand.name}</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {brand.manuals.length} คู่มือ · {brand.models.length} รุ่น
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
