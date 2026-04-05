import React, { useState } from 'react'
import { riskColor, setAPI } from '../data'

// ── Timeline ─────────────────────────────────────────────────
export function Timeline({ prompts }) {
  return (
    <svg width="100%" viewBox="0 0 580 260" style={{ display: 'block' }}>
      <line x1="28" y1="20" x2="28" y2="240" stroke="#D3D1C7" strokeWidth="0.5"/>
      {prompts.map((p, i) => {
        const y = 34 + i * 42
        const c = riskColor(p.risk)
        return (
          <g key={p.id}>
            <circle cx="28" cy={y} r="5" fill={c}/>
            <line x1="33" y1={y} x2="55" y2={y} stroke={c} strokeWidth="0.5"/>
            <text x="60" y={y} dominantBaseline="central" fontSize="11" fill="#1a1a18">
              {p.text.slice(0, 48)}…
            </text>
            <text x="490" y={y} dominantBaseline="central" fontSize="10" fill="#9c9a92">{p.time}</text>
            <text x="570" y={y} textAnchor="end" dominantBaseline="central"
              fontSize="10" fill={c} fontWeight="500">{p.status.toUpperCase()}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Heatmap ──────────────────────────────────────────────────
const TOOLS = ['GitHub API', 'Terraform', 'GitHub Actions', 'Kubernetes', 'AWS CLI']
const ACTIONS = ['read_logs', 'list_prs', 'scale', 'delete_db', 'run_script', 'create_repo']
const HEATMAP_VALS = {
  'GitHub API':     [0.18, 0.09, 0,    0,    0,    0.3 ],
  'Terraform':      [0,    0,    0.6,  0.95, 0.7,  0   ],
  'GitHub Actions': [0.2,  0,    0,    0,    0.87, 0.4 ],
  'Kubernetes':     [0.2,  0,    0.65, 0.8,  0.7,  0   ],
  'AWS CLI':        [0.15, 0,    0.5,  0.9,  0.75, 0.3 ],
}

export function Heatmap() {
  const cw = 76, rh = 32, ox = 108, oy = 50
  return (
    <svg width="100%" viewBox="0 0 580 240" style={{ display: 'block' }}>
      {ACTIONS.map((a, j) => (
        <text key={a} x={ox + j * cw + 38} y={oy - 8} textAnchor="middle"
          fontSize="10" fill="#9c9a92">{a.replace('_', ' ')}</text>
      ))}
      {TOOLS.map((t, i) => (
        <g key={t}>
          <text x={ox - 6} y={oy + i * rh + 16} textAnchor="end"
            dominantBaseline="central" fontSize="11" fill="#1a1a18">{t}</text>
          {HEATMAP_VALS[t].map((v, j) => {
            const c = v === 0 ? '#B4B2A9' : riskColor(v)
            const alpha = v === 0 ? 0.12 : Math.max(0.18, v * 0.85)
            return (
              <g key={j}>
                <rect x={ox + j * cw + 2} y={oy + i * rh + 2}
                  width={cw - 4} height={rh - 4} rx="5" fill={c} opacity={alpha}/>
                {v > 0 && (
                  <text x={ox + j * cw + 38} y={oy + i * rh + 16}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="10" fontWeight="500" fill={c}>{Math.round(v * 100)}%</text>
                )}
              </g>
            )
          })}
        </g>
      ))}
    </svg>
  )
}

// ── ActionLog ────────────────────────────────────────────────
export function ActionLog({ logs }) {
  if (!logs.length) return (
    <div style={{ fontSize: 11, color: '#9c9a92' }}>No events yet — press Run demo or Simulate attack.</div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {[...logs].reverse().slice(0, 6).map((l, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 11,
          padding: '5px 0', borderBottom: '0.5px solid rgba(0,0,0,0.07)',
        }}>
          <span>{l.blocked ? '🛑' : '✅'}</span>
          <span style={{ flex: 1 }}>{l.text}</span>
          <span style={{ color: '#9c9a92' }}>{l.time}</span>
        </div>
      ))}
    </div>
  )
}

// ── APIConfig ────────────────────────────────────────────────
export function APIConfig({ onClose, onSave }) {
  const [endpoints, setEndpoints] = useState({ analyze: '', execute: '', graph: '', log: '' })

  const fields = [
    { key: 'analyze', label: 'Person 1 — POST /analyze_prompt', placeholder: 'http://localhost:8001/analyze_prompt' },
    { key: 'execute', label: 'Person 3 — POST /should_execute', placeholder: 'http://localhost:8003/should_execute' },
    { key: 'graph',   label: 'Person 3 — GET /graph_status',   placeholder: 'http://localhost:8003/graph_status' },
    { key: 'log',     label: 'Person 2 — POST /log_event',     placeholder: 'http://localhost:8002/log_event' },
  ]

  const handleSave = () => {
    setAPI(endpoints)
    onSave(endpoints)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 24, width: 380,
        border: '0.5px solid rgba(0,0,0,0.15)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>API endpoints</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9c9a92' }}>×</button>
        </div>
        <p style={{ fontSize: 12, color: '#5f5e5a', marginBottom: 16 }}>
          Connect to your teammates' real APIs. Leave blank to use mock data.
        </p>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: '#5f5e5a', display: 'block', marginBottom: 4 }}>{f.label}</label>
            <input
              value={endpoints[f.key]}
              placeholder={f.placeholder}
              onChange={e => setEndpoints(prev => ({ ...prev, [f.key]: e.target.value }))}
              style={{
                width: '100%', padding: '7px 10px',
                border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: 8,
                background: '#f5f5f4', fontSize: 12, outline: 'none',
              }}
            />
          </div>
        ))}
        <button onClick={handleSave} style={{
          width: '100%', padding: '8px 0', marginTop: 8,
          background: '#1a1a18', color: '#fff', border: 'none',
          borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
        }}>Save & connect</button>
      </div>
    </div>
  )
}
