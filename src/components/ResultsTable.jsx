const STARVATION_THRESHOLD = 15;

export function ResultsTable({ results, processes, algoId }) {
  if (!results?.length) return null;

  const colorMap = {};
  processes.forEach(p => { colorMap[p.pid] = p.color; });

  const avg  = key => (results.reduce((s,r) => s+r[key], 0) / results.length).toFixed(2);
  const starved = results.filter(r => r.waitingTime > STARVATION_THRESHOLD);

  const exportCSV = () => {
    const headers = ['PID','Arrival','Burst','Start','Completion','Response Time','Waiting Time','Turnaround Time'];
    const rows    = results.map(r => [r.pid,r.arrivalTime,r.burstTime,r.startTime,r.completionTime,r.responseTime,r.waitingTime,r.turnaroundTime]);
    const csv     = [headers,...rows].map(r=>r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv],{type:'text/csv'})), download:`scheduler-${algoId}.csv` });
    a.click();
  };

  const summaryStats = [
    { label:'Avg Response Time', val:avg('responseTime'), color:'var(--indigo)',  bg:'#eef2ff' },
    { label:'Avg Waiting Time',  val:avg('waitingTime'),  color:'var(--amber)',   bg:'#fffbeb' },
    { label:'Avg Turnaround',    val:avg('turnaroundTime'),color:'var(--orange)', bg:'var(--orange-l)' },
  ];

  return (
    <div>
      {starved.length > 0 && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 16px', marginBottom:18, fontSize:13, color:'var(--red)', display:'flex', gap:10 }}>
          <span>⚠</span>
          <span><strong>Starvation detected</strong> — {starved.map(r=>r.pid).join(', ')} waited more than {STARVATION_THRESHOLD} units. Try Round Robin for fairness.</span>
        </div>
      )}

      {/* Summary stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {summaryStats.map(({ label, val, color, bg }) => (
          <div key={label} className="scale-in" style={{ background:bg, borderRadius:12, padding:'16px 20px', border:`1px solid ${color}22` }}>
            <div style={{ fontSize:28, fontWeight:700, color, fontFamily:'DM Mono', lineHeight:1 }}>{val}</div>
            <div style={{ fontSize:11, color, opacity:0.8, marginTop:6, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
        <button onClick={exportCSV} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:9, padding:'7px 16px', fontSize:13, fontWeight:600, color:'var(--text2)', cursor:'pointer', fontFamily:'DM Sans', transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--orange)'; e.currentTarget.style.color='var(--orange)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text2)'; }}
        >↓ Export CSV</button>
      </div>

      <div style={{ overflowX:'auto', borderRadius:12, border:'1px solid var(--border)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'var(--bg2)' }}>
              {['PID','Arrival','Burst','Start','Completion','Response ↓','Waiting ↓','Turnaround ↓'].map(c => (
                <th key={c} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--text3)', letterSpacing:'0.07em', textTransform:'uppercase', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r,i) => {
              const isStarved = r.waitingTime > STARVATION_THRESHOLD;
              const color     = colorMap[r.pid] || 'var(--orange)';
              return (
                <tr key={r.pid} className="fade-up" style={{ animationDelay:`${i*0.04}s`, transition:'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg2)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <td style={td}>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <div style={{ width:11, height:11, borderRadius:3, background:color, flexShrink:0 }} />
                      <span style={{ fontWeight:700 }}>{r.pid}</span>
                    </div>
                  </td>
                  <td style={{ ...td, color:'var(--text2)' }}>{r.arrivalTime}</td>
                  <td style={{ ...td, color:'var(--text2)' }}>{r.burstTime}</td>
                  <td style={{ ...td, color:'var(--text2)' }}>{r.startTime}</td>
                  <td style={{ ...td, color:'var(--text2)' }}>{r.completionTime}</td>
                  <td style={{ ...td, color:'var(--indigo)', fontWeight:600 }}>{r.responseTime}</td>
                  <td style={{ ...td, color: isStarved ? 'var(--red)' : r.waitingTime===0 ? 'var(--green)' : 'var(--amber)', fontWeight:600 }}>
                    {r.waitingTime}{isStarved ? ' ⚠' : ''}
                  </td>
                  <td style={{ ...td, color:'var(--orange)', fontWeight:600 }}>{r.turnaroundTime}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background:'var(--bg2)', borderTop:'2px solid var(--border)' }}>
              <td colSpan={5} style={{ ...td, fontSize:11, fontWeight:700, color:'var(--text3)', letterSpacing:'0.07em', textTransform:'uppercase' }}>Average</td>
              <td style={{ ...td, color:'var(--indigo)', fontWeight:700 }}>{avg('responseTime')}</td>
              <td style={{ ...td, color:'var(--amber)', fontWeight:700 }}>{avg('waitingTime')}</td>
              <td style={{ ...td, color:'var(--orange)', fontWeight:700 }}>{avg('turnaroundTime')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
const td = { padding:'12px 16px', borderBottom:'1px solid var(--border)', fontFamily:'DM Mono', fontSize:13 };
