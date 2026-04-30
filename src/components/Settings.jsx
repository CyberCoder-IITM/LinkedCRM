import React, { useState } from 'react';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';

export default function Settings({ settings, onSave }) {
  const [form, setForm] = useState(settings);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 28, marginBottom: 20 }}>
        <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Groq API Key</div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
          Get a free API key from{' '}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: '#4f6ef7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            console.groq.com <ExternalLink size={12} />
          </a>
          . The free tier gives you access to Llama 3.3 70B — completely free, fast, and powerful enough for message generation.
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type={showKey ? 'text' : 'password'}
            placeholder="gsk_..."
            value={form.groqKey || ''}
            onChange={e => setForm(f => ({ ...f, groqKey: e.target.value }))}
            style={{ width: '100%', paddingRight: 44, fontFamily: 'monospace', fontSize: 13 }}
          />
          <button onClick={() => setShowKey(!showKey)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#555', padding: 2 }}>
            {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 28, marginBottom: 20 }}>
        <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Your Profile</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Name</label>
            <input placeholder="e.g. Adnan" value={form.myName || ''} onChange={e => setForm(f => ({ ...f, myName: e.target.value }))} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Role</label>
            <input placeholder="e.g. Software Engineer, Full Stack Developer" value={form.targetRole || ''} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Brief Background (used in AI messages)</label>
            <textarea
              placeholder="e.g. 3 years experience in React and Node.js, worked at X, Y. Looking for senior roles in fintech or AI startups."
              value={form.bio || ''}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={4}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      <button onClick={handleSave} style={{ background: '#4f6ef7', border: 'none', borderRadius: 8, padding: '10px 28px', color: '#fff', fontSize: 14, fontFamily: 'Syne', fontWeight: 600 }}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
