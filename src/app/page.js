'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const refreshStats = async () => {
    try {
      const response = await fetch('/api/shorten');
      const data = await response.json();
      
      const updatedList = Object.keys(data).map((key) => ({
        id: key,
        original: data[key].longUrl,
        shortened: `http://localhost:3000/${key}`,
        clicks: data[key].clicks,
      }));
      
      setHistoryList(updatedList.reverse());
    } catch (err) {
      console.error('Failed to update stats log');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl }),
      });

      if (response.ok) {
        setLongUrl('');
        await refreshStats();
      }
    } catch (err) {
      alert('Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  // ASYNCHRONOUS DELETE CONTROLLER TRIGGER: Sends a delete request payload
  const handleDelete = async (shortId) => {
    if (!confirm('Are you sure you want to delete this shortened link?')) return;

    try {
      const response = await fetch('/api/shorten', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortId }),
      });

      if (response.ok) {
        await refreshStats(); // Instantly update view dashboards dynamically
      } else {
        alert('Failed to wipe layout link from database');
      }
    } catch (err) {
      console.error('Delete request mapping transmission error:', err);
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eef' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px', marginTop: 0 }}>⚡ Link Shortener</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="url"
            required
            placeholder="Paste a long URL here (e.g., https://github.com)"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '12px 24px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Creating...' : 'Shorten'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          📋 History Dashboard
          <button onClick={refreshStats} style={{ fontSize: '12px', background: '#eaeaea', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>
            🔄 Force Update
          </button>
        </h2>

        {historyList.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>No links generated in this session yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historyList.map((item) => (
              <div key={item.id} style={{ display: 'flex', position: 'relative', flexDirection: 'column', padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', paddingRight: '40px' }}>
                  <a href={item.shortened} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold', color: '#0070f3', textDecoration: 'none' }}>
                    {item.shortened}
                  </a>
                  <span style={{ fontSize: '12px', background: '#e2f9e1', color: '#1e7e34', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                    🔥 {item.clicks} {item.clicks === 1 ? 'click' : 'clicks'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#666', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingRight: '40px' }}>
                  Target: <span style={{ color: '#444', fontFamily: 'monospace' }}>{item.original}</span>
                </div>

                {/* VISUAL TRASH BUTTON COMPONENT */}
                <button 
                  onClick={() => handleDelete(item.id)}
                  title="Delete this link mapping"
                  style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '5px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


