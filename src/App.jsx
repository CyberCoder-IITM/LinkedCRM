import React, { useState, useEffect } from 'react';
import './index.css';
import { LayoutDashboard, Users, Target, Settings as SettingsIcon, Linkedin } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Connections from './components/Connections';
import ConnectionDetail from './components/ConnectionDetail';
import Targets from './components/Targets';
import Settings from './components/Settings';
import { saveToStorage, loadFromStorage, parseLinkedInCSV } from './utils/helpers';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'connections', label: 'Connections', icon: Users },
  { id: 'targets', label: 'Target Companies', icon: Target },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [connections, setConnections] = useState(() => loadFromStorage('lcrm_connections', []));
  const [targets, setTargets] = useState(() => loadFromStorage('lcrm_targets', []));
  const [settings, setSettings] = useState(() => loadFromStorage('lcrm_settings', { groqKey: '', myName: '', targetRole: '', bio: '' }));
  const [selected, setSelected] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  useEffect(() => { saveToStorage('lcrm_connections', connections); }, [connections]);
  useEffect(() => { saveToStorage('lcrm_targets', targets); }, [targets]);
  useEffect(() => { saveToStorage('lcrm_settings', settings); }, [settings]);

  const addConnection = (c) => setConnections(prev => [c, ...prev]);

  const updateConnection = (updated) => {
    setConnections(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (selected?.id === updated.id) setSelected(updated);
  };

  const handleImport = async (file) => {
    setImporting(true);
    setImportMsg('');
    try {
      const parsed = await parseLinkedInCSV(file);
      setConnections(prev => {
        const existingNames = new Set(prev.map(c => c.name.toLowerCase()));
        const fresh = parsed.filter(c => !existingNames.has(c.name.toLowerCase()));
        setImportMsg(`Imported ${fresh.length} new connections (${parsed.length - fresh.length} duplicates skipped)`);
        return [...fresh, ...prev];
      });
      setPage('connections');
    } catch (e) {
      setImportMsg('Import failed. Make sure it\'s a LinkedIn CSV export.');
    }
    setImporting(false);
    setTimeout(() => setImportMsg(''), 5000);
  };

  const PAGE_TITLES = { dashboard: 'Dashboard', connections: 'Connections', targets: 'Target Companies', settings: 'Settings' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
      <div style={{ width: 220, background: '#0d0d14', borderRight: '1px solid #1a1a2a', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1a1a2a', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Linkedin size={17} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, letterSpacing: '-0.3px' }}>LinkedCRM</div>
            <div style={{ fontSize: 10, color: '#444', marginTop: 1 }}>{connections.length} connections</div>
          </div>
        </div>
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPage(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', marginBottom: 2,
              background: page === id ? '#1e1e3a' : 'transparent',
              color: page === id ? '#4f6ef7' : '#666',
              fontSize: 13, fontFamily: 'Syne', fontWeight: page === id ? 600 : 400,
              textAlign: 'left', transition: 'all 0.15s', cursor: 'pointer',
            }}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1a1a2a' }}>
          <div style={{ fontSize: 10, color: '#333', lineHeight: 1.5 }}>
            Tip: Export LinkedIn data from Settings → Data Privacy → Get a copy of your data
          </div>
        </div>
      </div>

      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #1a1a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0d0d14', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>{PAGE_TITLES[page]}</div>
          {importing && <div style={{ fontSize: 13, color: '#f7a94f' }}>Importing...</div>}
          {importMsg && <div style={{ fontSize: 13, color: importMsg.includes('failed') ? '#ef4444' : '#22c55e', background: importMsg.includes('failed') ? '#ef444411' : '#22c55e11', padding: '6px 14px', borderRadius: 6 }}>{importMsg}</div>}
        </div>

        <div style={{ padding: '28px 32px', flex: 1 }}>
          {page === 'dashboard' && <Dashboard connections={connections} targetCompanies={targets} />}
          {page === 'connections' && (
            <Connections
              connections={connections}
              onAdd={addConnection}
              onUpdate={updateConnection}
              onImport={handleImport}
              onSelect={(c) => { setSelected(c); }}
            />
          )}
          {page === 'targets' && (
            <Targets
              targets={targets}
              connections={connections}
              onAdd={(t) => setTargets(prev => [t, ...prev])}
              onRemove={(id) => setTargets(prev => prev.filter(t => t.id !== id))}
            />
          )}
          {page === 'settings' && <Settings settings={settings} onSave={setSettings} />}
        </div>
      </div>

      {selected && (
        <ConnectionDetail
          connection={selected}
          onUpdate={updateConnection}
          onClose={() => setSelected(null)}
          groqKey={settings.groqKey}
          myRole={settings.targetRole}
          myBackground={{ name: settings.myName, bio: settings.bio }}
        />
      )}
    </div>
  );
}
