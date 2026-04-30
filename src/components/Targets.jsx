import React, { useState } from 'react';
import { Plus, Trash2, Building } from 'lucide-react';

export default function Targets({ targets, connections, onAdd, onRemove }) {
  const [form, setForm] = useState({ name: '', role: '', notes: '' });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onAdd({ ...form, id: `tc_${Date.now()}` });
    setForm({ name: '', role: '', notes: '' });
  };

  return (
    <div>
      <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Add Target Company</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <input placeholder="Company name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input placeholder="Target role there" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
        </div>
        <input placeholder="Notes (why this company?)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ width: '100%', marginBottom: 12 }} />
        <button onClick={handleAdd} disabled={!form.name.trim()} style={{ background: '#4f6ef7', border: 'none', borderRadius: 8, padding: '8px 20px', color: '#fff', fontSize: 14, opacity: form.name.trim() ? 1 : 0.5 }}>
          <Plus size={14} style={{ display: 'inline', marginRight: 6 }} />Add Company
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {targets.map(tc => {
          const matched = connections.filter(c => c.company?.toLowerCase().includes(tc.name.toLowerCase()));
          const recruiters = matched.filter(c => c.roleType === 'Recruiter' || c.roleType === 'Hiring Manager');
          const engineers = matched.filter(c => c.roleType === 'Engineer');
          return (
            <div key={tc.id} style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1e1e3a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={16} color="#4f6ef7" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 14 }}>{tc.name}</div>
                    {tc.role && <div style={{ fontSize: 12, color: '#666' }}>{tc.role}</div>}
                  </div>
                </div>
                <button onClick={() => onRemove(tc.id)} style={{ background: 'transparent', border: 'none', color: '#444' }}><Trash2 size={13} /></button>
              </div>
              {tc.notes && <div style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.5 }}>{tc.notes}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, borderTop: '1px solid #1e1e2e', paddingTop: 12 }}>
                {[
                  { label: 'Total Connections', val: matched.length, color: '#4f6ef7' },
                  { label: 'Recruiters / HM', val: recruiters.length, color: '#f7a94f' },
                  { label: 'Engineers', val: engineers.length, color: '#22c55e' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Syne', color }}>{val}</div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
              {matched.length > 0 && (
                <div style={{ marginTop: 12, borderTop: '1px solid #1e1e2e', paddingTop: 10 }}>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Connections</div>
                  {matched.slice(0, 3).map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginBottom: 4 }}>
                      <span>{c.name}</span>
                      <span style={{ color: '#555' }}>{c.position || c.roleType}</span>
                    </div>
                  ))}
                  {matched.length > 3 && <div style={{ fontSize: 11, color: '#444' }}>+{matched.length - 3} more</div>}
                </div>
              )}
              {matched.length === 0 && <div style={{ fontSize: 12, color: '#444', marginTop: 8, textAlign: 'center' }}>No connections at this company yet</div>}
            </div>
          );
        })}
        {targets.length === 0 && <div style={{ color: '#444', fontSize: 14, gridColumn: '1/-1' }}>No target companies yet. Add the companies you want to work at!</div>}
      </div>
    </div>
  );
}
