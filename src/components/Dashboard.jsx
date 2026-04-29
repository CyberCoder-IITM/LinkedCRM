import React, { useMemo } from 'react';
import { Users, MessageSquare, TrendingUp, Target, Star } from 'lucide-react';
import { PHASES, scoreConnection } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard({ connections, targetCompanies }) {
  const stats = useMemo(() => {
    const total = connections.length;
    const contacted = connections.filter(c => c.phase !== 'not_started').length;
    const replied = connections.filter(c => c.messages.some(m => m.direction === 'received')).length;
    const success = connections.filter(c => c.phase === 'success').length;
    const avgScore = total > 0 ? Math.round(connections.reduce((s, c) => s + scoreConnection(c), 0) / total) : 0;
    return { total, contacted, replied, success, avgScore };
  }, [connections]);

  const phaseData = useMemo(() => {
    const counts = {};
    connections.forEach(c => { counts[c.phase] = (counts[c.phase] || 0) + 1; });
    return Object.entries(counts).map(([phase, count]) => ({
      name: PHASES[phase]?.label || phase,
      value: count,
      color: PHASES[phase]?.color || '#555',
    }));
  }, [connections]);

  const roleData = useMemo(() => {
    const counts = {};
    connections.forEach(c => { counts[c.roleType || 'Other'] = (counts[c.roleType || 'Other'] || 0) + 1; });
    return Object.entries(counts).map(([role, count]) => ({ role, count }));
  }, [connections]);

  const topConnections = useMemo(() => {
    return [...connections]
      .sort((a, b) => scoreConnection(b) - scoreConnection(a))
      .slice(0, 5);
  }, [connections]);

  const COLORS = ['#4f6ef7', '#f7a94f', '#a855f7', '#22c55e', '#ef4444', '#555570'];

  return (
    <div style={{ padding: '0 0 40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Tracked', value: stats.total, icon: Users, color: '#4f6ef7' },
          { label: 'Contacted', value: stats.contacted, icon: MessageSquare, color: '#f7a94f' },
          { label: 'Got Replies', value: stats.replied, icon: TrendingUp, color: '#a855f7' },
          { label: 'Referrals Won', value: stats.success, icon: Target, color: '#22c55e' },
          { label: 'Avg Score', value: stats.avgScore, icon: Star, color: '#f7a94f' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: '20px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#888', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'Syne' }}>{label}</span>
              <Icon size={16} color={color} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'Syne', color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#e8e8f0' }}>Outreach Funnel</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={phaseData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {phaseData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a2a', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e8e8f0', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {phaseData.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#aaa' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                {p.name} ({p.value})
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#e8e8f0' }}>By Role Type</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roleData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="role" width={90} tick={{ fill: '#aaa', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a2a', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e8e8f0', fontSize: 13 }} />
              <Bar dataKey="count" fill="#4f6ef7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#e8e8f0' }}>Top Priority Connections</div>
          {topConnections.length === 0 && <div style={{ color: '#555', fontSize: 13 }}>No connections yet. Import your LinkedIn CSV to get started.</div>}
          {topConnections.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: i < topConnections.length - 1 ? '1px solid #1e1e2e' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e1e3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#4f6ef7', flexShrink: 0 }}>
                {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.company}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: scoreConnection(c) >= 70 ? '#22c55e' : scoreConnection(c) >= 40 ? '#f7a94f' : '#ef4444', fontFamily: 'Syne' }}>
                {scoreConnection(c)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {targetCompanies.length > 0 && (
        <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#e8e8f0' }}>Target Companies Coverage</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {targetCompanies.map(tc => {
              const matches = connections.filter(c => c.company?.toLowerCase().includes(tc.name?.toLowerCase()));
              return (
                <div key={tc.id} style={{ background: '#0d0d14', border: '1px solid #2a2a3a', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: '#e8e8f0' }}>{tc.name}</div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{tc.role}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: matches.length > 0 ? '#4f6ef7' : '#555', fontFamily: 'Syne' }}>
                    {matches.length} <span style={{ fontSize: 12, fontWeight: 400 }}>connections</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
