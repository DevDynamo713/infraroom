"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [resources, setResources] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('vm');
  const [desired, setDesired] = useState('');
  const [actual, setActual] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://infraroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'resource') {
        setResources(prev => [...prev, data.data]);
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://infraroom.devdynamo713.com/room/${params.id}/resources`);
      if (res.ok) setResources(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addResource = async () => {
    const data = { id: Date.now().toString(), name, type, desired, actual: actual || desired };
    await fetch(`https://infraroom.devdynamo713.com/room/${params.id}/resource`, { method: 'POST', body: JSON.stringify(data) });
    setName(''); setType('vm'); setDesired(''); setActual('');
  };
  const colorMap: Record<string, string> = { in_sync: '#4ade80', drifted: '#f87171', missing: '#fbbf24', pending: '#a1a1aa' };
  const syncScore = resources.length > 0 ? Math.round((resources.filter(r => r.state === 'in_sync').length / resources.length) * 100) : 100;
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>InfraRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, padding: 16, border: `1px solid ${syncScore >= 80 ? '#4ade80' : syncScore >= 50 ? '#fbbf24' : '#f87171'}`, borderRadius: 12, background: '#09090b' }}>
        <strong style={{ fontSize: 20 }}>Sync Score: {syncScore}%</strong>
        <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>{resources.filter(r => r.state === 'in_sync').length}/{resources.length} resources in sync</div>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="resource name" className="name-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <select value={type} onChange={(e) => setType(e.target.value)} className="type-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }}>
          <option value="vm">vm</option>
          <option value="db">db</option>
          <option value="network">network</option>
          <option value="storage">storage</option>
          <option value="container">container</option>
        </select>
        <input value={desired} onChange={(e) => setDesired(e.target.value)} placeholder="desired state" className="desired-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <input value={actual} onChange={(e) => setActual(e.target.value)} placeholder="actual state (optional)" className="actual-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <button className="add-btn" onClick={addResource} disabled={!name.trim() || !desired.trim()} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add Resource</button>
      </div>
      <div className="resource-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {resources.map(r => (
          <div key={r.id} style={{ padding: 16, border: `1px solid ${colorMap[r.state] || '#27272a'}`, borderRadius: 12, background: '#09090b' }}>
            <strong style={{ fontSize: 18, color: colorMap[r.state] }}>{r.name}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Type: {r.type}</div>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Desired: {r.desired}</div>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Actual: {r.actual}</div>
            <div style={{ marginTop: 4, fontWeight: 'bold', color: colorMap[r.state], textTransform: 'uppercase' }}>{r.state.replace('_', ' ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}