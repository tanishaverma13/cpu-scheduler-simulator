export function ComparisonTable({ allResults, ganttMap }) {
  const algorithms = Object.keys(allResults);
  if (!algorithms.length) return null;

  const stats = {};
  algorithms.forEach(algo => {
    const R = allResults[algo];
    if (!R?.length) { stats[algo]=null; return; }
    const n      = R.length;
    const avgWT  = R.reduce((s,r)=>s+r.waitingTime,0)/n;
    const avgTAT = R.reduce((s,r)=>s+r.turnaroundTime,0)/n;
    const avgRT  = R.reduce((s,r)=>s+r.responseTime,0)/n;
    const maxWT  = Math.max(...R.map(r=>r.waitingTime));
    const G      = ganttMap?.[algo]||[];
    const tot    = G.length ? G[G.length-1].end : 0;
    const busy   = G.filter(b=>b.pid!=='IDLE').reduce((s,b)=>s+(b.end-b.start),0);
    stats[algo]  = {
      avgWT:+avgWT.toFixed(2), avgTAT:+avgTAT.toFixed(2), avgRT:+avgRT.toFixed(2), maxWT,
      cpuUtil:+(tot>0?(busy/tot*100):100).toFixed(1),
      throughput:+(tot>0?n/tot:0).toFixed(3),
    };
  });

  const valid  = algorithms.filter(a=>stats[a]);
  const best   = (k,lo=true) => { const v=valid.map(a=>stats[a][k]); return lo?Math.min(...v):Math.max(...v); };
  const bWT=best('avgWT'),bTAT=best('avgTAT'),bRT=best('avgRT'),bMax=best('maxWT'),bUtil=best('cpuUtil',false);
  const scores = {};
  valid.forEach(a=>{
    const s=stats[a];
    scores[a]=[s.avgWT===bWT,s.avgTAT===bTAT,s.avgRT===bRT,s.maxWT===bMax,s.cpuUtil===bUtil].filter(Boolean).length;
  });
  const top = valid.reduce((b,a)=>scores[a]>scores[b]?a:b, valid[0]);
  const labels   = { fcfs:'FCFS', sjf:'SJF', srtf:'SRTF', rr:'Round Robin' };
  const sublabel = { fcfs:'Non-preemptive', sjf:'Non-preemptive', srtf:'Preemptive', rr:'Preemptive' };
  const insights = {
    fcfs:'Simple & fair by arrival order. Good when burst times are similar.',
    sjf:'Optimal average wait when all jobs arrive together.',
    srtf:'Globally minimizes average waiting time. Watch for starvation.',
    rr:'Best for interactive/time-sharing systems. Tune your quantum.',
  };

  return (
    <div style={{ background:'var(--surface)', borderRadius:16, padding:28, boxShadow:'var(--shadow)' }}>

      {/* Best algorithm card */}
      <div style={{ background:'linear-gradient(135deg,var(--orange-l),#f0fdf4)', border:'1px solid #fed7aa', borderRadius:14, padding:'20px 24px', marginBottom:28, display:'flex', alignItems:'center', gap:20 }}>
        <div style={{ fontSize:42, lineHeight:1 }}>🏆</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--amber)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>
            Best Algorithm for This Workload
          </div>
          <div style={{ fontSize:24, fontWeight:700, color:'var(--orange-d)' }}>{labels[top]}</div>
          <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>{insights[top]}</div>
        </div>
        <div style={{ textAlign:'center', background:'#fff', borderRadius:12, padding:'12px 20px', border:'1px solid #fed7aa', minWidth:72 }}>
          <div style={{ fontSize:28, fontWeight:800, color:'var(--orange)', fontFamily:'DM Mono' }}>{scores[top]}</div>
          <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>/ 5 wins</div>
        </div>
      </div>

      <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16, color:'var(--text)' }}>Side-by-Side Comparison</h3>

      <div style={{ overflowX:'auto', borderRadius:12, border:'1px solid var(--border)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'var(--bg2)' }}>
              {['Algorithm','Type','Avg RT ↓','Avg WT ↓','Avg TAT ↓','Max WT ↓','CPU Util ↑','Score'].map(c=>(
                <th key={c} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--text3)', letterSpacing:'0.07em', textTransform:'uppercase', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {algorithms.map((algo,i) => {
              const s = stats[algo];
              if (!s) return null;
              const isBest = algo === top;
              const cell = (val, isBestCell, color) => (
                <span style={{ color:isBestCell?color:'var(--text2)', fontWeight:isBestCell?700:400 }}>
                  {val}{isBestCell?' ✓':''}
                </span>
              );
              return (
                <tr key={algo} className="fade-up" style={{
                  animationDelay:`${i*0.06}s`,
                  background:isBest?'#fff7ed':'transparent',
                  borderLeft:isBest?'3px solid var(--orange)':'3px solid transparent',
                  transition:'background 0.12s',
                }}
                onMouseEnter={e=>e.currentTarget.style.background=isBest?'#fff7ed':'var(--bg2)'}
                onMouseLeave={e=>e.currentTarget.style.background=isBest?'#fff7ed':'transparent'}
                >
                  <td style={{ ...ctd, fontWeight:700, color:isBest?'var(--orange-d)':'var(--text)' }}>
                    {labels[algo]}{isBest&&<span style={{ marginLeft:6, fontSize:12 }}>★</span>}
                  </td>
                  <td style={ctd}>
                    <span style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, padding:'2px 8px', fontSize:11, color:'var(--text2)', fontWeight:500 }}>
                      {sublabel[algo]}
                    </span>
                  </td>
                  <td style={ctd}>{cell(s.avgRT,  s.avgRT===bRT,  'var(--indigo)')}</td>
                  <td style={ctd}>{cell(s.avgWT,  s.avgWT===bWT,  'var(--amber)')}</td>
                  <td style={ctd}>{cell(s.avgTAT, s.avgTAT===bTAT,'var(--orange)')}</td>
                  <td style={ctd}>{cell(s.maxWT,  s.maxWT===bMax, 'var(--green)')}</td>
                  <td style={ctd}>{cell(s.cpuUtil+'%', s.cpuUtil===bUtil,'var(--orange)')}</td>
                  <td style={ctd}>
                    <div style={{ display:'flex', gap:3 }}>
                      {[...Array(5)].map((_,j)=>(
                        <div key={j} style={{ width:10, height:10, borderRadius:3, background:j<scores[algo]?'var(--orange)':'var(--border)', transition:'background 0.2s' }} />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginTop:20 }}>
        {[
          { label:'Response Time', desc:'First CPU time − Arrival. Measures how quickly a process first gets attention.' },
          { label:'CPU Utilization', desc:'Busy ÷ Total time. Higher means fewer idle CPU gaps.' },
          { label:'Throughput', desc:'Processes completed per time unit. Higher = more efficient scheduling.' },
          { label:'Starvation', desc:'SRTF/SJF can delay long jobs indefinitely. RR and FCFS prevent this.' },
        ].map(item=>(
          <div key={item.label} style={{ background:'var(--bg2)', borderRadius:10, padding:'14px 16px', border:'1px solid var(--border)' }}>
            <div style={{ fontWeight:700, fontSize:13, color:'var(--text)', marginBottom:4 }}>{item.label}</div>
            <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
const ctd = { padding:'12px 16px', borderBottom:'1px solid var(--border)', fontFamily:'DM Mono', fontSize:13 };
