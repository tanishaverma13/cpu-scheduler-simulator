import { useState } from 'react';

const COLORS = [
  '#e85d26','#4f46e5','#16a34a','#d97706',
  '#db2777','#0891b2','#7c3aed','#059669',
  '#dc2626','#2563eb',
];

export function ProcessTable({ processes, setProcesses }) {
  const [pid, setPid]         = useState('');
  const [arrival, setArrival] = useState('');
  const [burst, setBurst]     = useState('');
  const [error, setError]     = useState('');

  const add = () => {
    setError('');
    if (!pid.trim())                                         return setError('Process ID is required');
    if (processes.find(p => p.pid === pid.trim()))          return setError('This PID already exists');
    if (arrival === '' || isNaN(+arrival) || +arrival < 0) return setError('Arrival time must be ≥ 0');
    if (!burst || isNaN(+burst) || +burst <= 0)             return setError('Burst time must be > 0');
    setProcesses(prev => [...prev, {
      pid: pid.trim(), arrivalTime: +arrival, burstTime: +burst,
      color: COLORS[prev.length % COLORS.length],
    }]);
    setPid(''); setArrival(''); setBurst('');
  };

  const loadExample = () => setProcesses([
    { pid:'P1', arrivalTime:0, burstTime:6,  color:COLORS[0] },
    { pid:'P2', arrivalTime:2, burstTime:4,  color:COLORS[1] },
    { pid:'P3', arrivalTime:4, burstTime:2,  color:COLORS[2] },
    { pid:'P4', arrivalTime:6, burstTime:8,  color:COLORS[3] },
    { pid:'P5', arrivalTime:6, burstTime:3,  color:COLORS[4] },
  ]);

  return (
    <div style={{ background:'var(--surface)', borderRadius:16, padding:28, boxShadow:'var(--shadow)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
        <div>
          <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text)' }}>Process Queue</h2>
          <p style={{ fontSize:13, color:'var(--text3)', marginTop:2 }}>{processes.length} process{processes.length !== 1 ? 'es' : ''} ready</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={loadExample} style={ghostBtn}>Load Example</button>
          <button onClick={() => setProcesses([])} style={{ ...ghostBtn, color:'var(--red)', borderColor:'#fecaca' }}>Clear All</button>
        </div>
      </div>

      {/* Input row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:12, marginBottom:10 }}>
        {[
          { label:'Process ID', val:pid, set:setPid, ph:'P1', type:'text' },
          { label:'Arrival Time', val:arrival, set:setArrival, ph:'0', type:'number' },
          { label:'Burst Time', val:burst, set:setBurst, ph:'4', type:'number' },
        ].map(({ label, val, set, ph, type }) => (
          <div key={label}>
            <label style={labelStyle}>{label}</label>
            <input
              type={type} value={val} placeholder={ph}
              onChange={e => set(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              min={type==='number' ? 0 : undefined}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor='var(--orange)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'flex-end' }}>
          <button onClick={add} style={primaryBtn}>+ Add</button>
        </div>
      </div>

      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'9px 14px', fontSize:13, color:'var(--red)', marginBottom:12 }}>
          {error}
        </div>
      )}

      {/* Process list */}
      {processes.length > 0 && (
        <div style={{ marginTop:18, borderTop:'1px solid var(--border)', paddingTop:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'32px 1fr 1fr 1fr 36px', gap:12, padding:'0 4px 8px', marginBottom:4 }}>
            {['','PID','Arrival','Burst',''].map((h,i) => (
              <span key={i} style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</span>
            ))}
          </div>
          {processes.map((p,i) => (
            <div key={p.pid} className="fade-up" style={{
              display:'grid', gridTemplateColumns:'32px 1fr 1fr 1fr 36px',
              gap:12, padding:'9px 4px', alignItems:'center',
              borderRadius:8, marginBottom:2,
              animationDelay:`${i*0.04}s`,
              transition:'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background='var(--bg2)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <div style={{ width:22, height:22, borderRadius:6, background:p.color }} />
              <span style={{ fontWeight:600, fontSize:14 }}>{p.pid}</span>
              <span className="mono" style={{ fontSize:13, color:'var(--text2)' }}>{p.arrivalTime}</span>
              <span className="mono" style={{ fontSize:13, color:'var(--text2)' }}>{p.burstTime}</span>
              <button onClick={() => setProcesses(prev => prev.filter(x=>x.pid!==p.pid))}
                style={{ width:28, height:28, borderRadius:7, border:'1px solid var(--border)', background:'transparent', cursor:'pointer', color:'var(--text3)', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='#fecaca'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.borderColor='var(--border)'; }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {processes.length === 0 && (
        <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text3)', fontSize:14 }}>
          No processes yet — add one above or load the example
        </div>
      )}
    </div>
  );
}

const labelStyle = { display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, letterSpacing:'0.02em' };
const inputStyle = {
  width:'100%', background:'var(--surface2)', border:'1px solid var(--border)',
  borderRadius:10, padding:'10px 13px', color:'var(--text)', fontFamily:'DM Sans, sans-serif',
  fontSize:14, outline:'none', transition:'border-color 0.15s',
};
const primaryBtn = {
  background:'var(--orange)', color:'#fff', border:'none', borderRadius:10,
  padding:'10px 22px', fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:14,
  cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s',
  boxShadow:'0 2px 8px rgba(232,93,38,0.35)',
};
const ghostBtn = {
  background:'transparent', color:'var(--text2)', border:'1px solid var(--border)',
  borderRadius:10, padding:'8px 16px', fontFamily:'DM Sans, sans-serif',
  fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.15s',
};
