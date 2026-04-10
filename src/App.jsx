import { useState, useMemo } from 'react';
import './index.css';
import { ProcessTable }    from './components/ProcessTable';
import { GanttChart }      from './components/GanttChart';
import { ResultsTable }    from './components/ResultsTable';
import { ComparisonTable } from './components/ComparisonTable';
import { fcfs }            from './algorithms/fcfs';
import { sjf, srtf }       from './algorithms/sjf';
import { roundRobin }      from './algorithms/roundRobin';

const ALGOS = [
  { id:'fcfs', label:'FCFS',  tag:'Non-preemptive' },
  { id:'sjf',  label:'SJF',   tag:'Non-preemptive' },
  { id:'srtf', label:'SRTF',  tag:'Preemptive' },
  { id:'rr',   label:'Round Robin', tag:'Preemptive' },
];

export default function App() {
  const [processes,      setProcesses]      = useState([]);
  const [activeAlgo,     setActiveAlgo]     = useState('fcfs');
  const [quantum,        setQuantum]        = useState(2);
  const [showComparison, setShowComparison] = useState(false);

  const results = useMemo(() => {
    if (!processes.length) return {};
    return {
      fcfs: fcfs(processes),
      sjf:  sjf(processes),
      srtf: srtf(processes),
      rr:   roundRobin(processes, quantum),
    };
  }, [processes, quantum]);

  const current    = results[activeAlgo] || { gantt:[], results:[] };
  const allResults = useMemo(() => { const o={}; Object.entries(results).forEach(([k,v])=>{ o[k]=v.results; }); return o; }, [results]);
  const ganttMap   = useMemo(() => { const o={}; Object.entries(results).forEach(([k,v])=>{ o[k]=v.gantt; }); return o; }, [results]);

  const hasProcs   = processes.length > 0;

  // Metrics for header bar
  const metrics = useMemo(() => {
    const R = current.results;
    const G = current.gantt;
    if (!R?.length) return null;
    const n    = R.length;
    const avgWT  = (R.reduce((s,r)=>s+r.waitingTime,0)/n).toFixed(1);
    const avgTAT = (R.reduce((s,r)=>s+r.turnaroundTime,0)/n).toFixed(1);
    const tot  = G?.length ? G[G.length-1].end : 0;
    const busy = G?.filter(b=>b.pid!=='IDLE').reduce((s,b)=>s+(b.end-b.start),0)||0;
    const util = tot>0?(busy/tot*100).toFixed(0):100;
    return [
      { label:'CPU Utilization', val:`${util}%`,  color:'var(--orange)' },
      { label:'Avg Wait',        val:avgWT,         color:'var(--amber)' },
      { label:'Avg Turnaround',  val:avgTAT,        color:'var(--indigo)' },
      { label:'Processes',       val:n,             color:'var(--green)' },
    ];
  }, [current]);

  return (
    <div style={{ minHeight:'100vh' }}>

      {/* Header */}
      <header style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', boxShadow:'var(--shadow-sm)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:'var(--orange)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, boxShadow:'0 2px 8px rgba(232,93,38,0.4)' }}>⚙</div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.01em', lineHeight:1.1 }}>CPU Scheduler Simulator</div>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:500 }}>OS Process Scheduling Visualizer</div>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {metrics && metrics.map(m => (
              <div key={m.label} style={{ textAlign:'center', padding:'5px 14px', background:'var(--bg2)', borderRadius:9, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:15, fontWeight:700, color:m.color, fontFamily:'DM Mono', lineHeight:1 }}>{m.val}</div>
                <div style={{ fontSize:9, color:'var(--text3)', marginTop:2, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{m.label}</div>
              </div>
            ))}
            {hasProcs && (
              <button onClick={() => setShowComparison(v=>!v)}
                style={{ marginLeft:6, background:showComparison?'var(--orange)':'transparent', color:showComparison?'#fff':'var(--text2)', border:'1px solid', borderColor:showComparison?'var(--orange)':'var(--border)', borderRadius:10, padding:'8px 16px', fontFamily:'DM Sans', fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.15s' }}>
                {showComparison ? '× Compare' : '⇌ Compare'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1160, margin:'0 auto', padding:'28px 24px' }}>

        {/* Process input */}
        <div style={{ marginBottom:24 }}>
          <ProcessTable processes={processes} setProcesses={setProcesses} />
        </div>

        {/* Algorithm tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:24, alignItems:'center', background:'var(--surface)', padding:'6px', borderRadius:14, boxShadow:'var(--shadow-sm)', width:'fit-content', border:'1px solid var(--border)' }}>
          {ALGOS.map(algo => {
            const active = activeAlgo === algo.id;
            return (
              <button key={algo.id} onClick={() => setActiveAlgo(algo.id)} style={{
                background: active ? 'var(--orange)' : 'transparent',
                color:      active ? '#fff' : 'var(--text2)',
                border:     'none',
                borderRadius: 10,
                padding:    '9px 18px',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize:   14,
                cursor:     'pointer',
                transition: 'all 0.18s',
                display:    'flex', flexDirection:'column', alignItems:'flex-start', gap:1,
                boxShadow:  active ? '0 2px 8px rgba(232,93,38,0.3)' : 'none',
              }}
              onMouseEnter={e => { if(!active) e.currentTarget.style.background='var(--bg2)'; }}
              onMouseLeave={e => { if(!active) e.currentTarget.style.background='transparent'; }}
              >
                <span>{algo.label}</span>
                <span style={{ fontSize:9, opacity:active?0.8:0.5, fontWeight:500, letterSpacing:'0.04em' }}>{algo.tag}</span>
              </button>
            );
          })}

          {activeAlgo === 'rr' && (
            <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:4, paddingLeft:10, borderLeft:'1px solid var(--border)' }}>
              <span style={{ fontSize:12, color:'var(--text3)', fontWeight:600 }}>Quantum:</span>
              <input type="number" min="1" max="20" value={quantum}
                onChange={e => setQuantum(Math.max(1,+e.target.value))}
                style={{ width:50, border:'1px solid var(--border)', borderRadius:8, padding:'5px 8px', fontFamily:'DM Mono', fontSize:15, fontWeight:700, color:'var(--orange)', background:'transparent', outline:'none', textAlign:'center' }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        {hasProcs ? (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Gantt chart */}
            <div style={{background:'linear-gradient(180deg, var(--surface), var(--surface2))',
                borderRadius:16,
                padding:24,
                boxShadow:'var(--shadow)',
                border:'1px solid var(--border)'
                }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <div>
                  <h2 style={{ fontSize:16, fontWeight:700 }}>Gantt Chart</h2>
                  <p style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>
                    {ALGOS.find(a=>a.id===activeAlgo)?.label}
                    {activeAlgo==='rr'?` · Quantum = ${quantum}`:''}
                    {' · '}{current.gantt[current.gantt.length-1]?.end||0} total time units
                  </p>
                </div>
              </div>

              <div style={{fontSize: 13, color: 'var(--text2)', marginBottom: 10, fontFamily: 'DM Mono'}}>
                ⚡ LIVE: {
                   (() => {
                     const procs = current.gantt.filter(b => b.pid !== 'IDLE');
                 
                     if (procs.length <= 4) {
                       return procs.map((b, i) =>
                         `Running ${b.pid}${i < procs.length - 1 ? ' → ' : ''}`
                       );
                     }

                    return (
                      <>
                        {procs.slice(0, 3).map((b, i) =>
                         `Running ${b.pid} → `
                        )}
                        ... → Running {procs[procs.length - 1].pid}
                      </>
                    );
                  })()
                }
                
              </div>
              <GanttChart gantt={current.gantt} processes={processes} />
            </div>

            {/* Results */}
            <div style={{ background:'var(--surface)', borderRadius:16, padding:24, boxShadow:'var(--shadow)' }}>
              <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Process Results</h2>
              <ResultsTable results={current.results} processes={processes} algoId={activeAlgo} />
            </div>

            {/* Comparison */}
            {showComparison && (
              <div className="fade-up">
                <ComparisonTable allResults={allResults} ganttMap={ganttMap} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ background:'var(--surface)', borderRadius:16, padding:'72px 32px', textAlign:'center', boxShadow:'var(--shadow)', border:'1px dashed var(--border2)' }}>
            <div style={{ fontSize:52, marginBottom:16 }}>⚙️</div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Ready to Simulate</h2>
            <p style={{ color:'var(--text3)', fontSize:14, maxWidth:360, margin:'0 auto' }}>
              Add processes to the queue above, or click <strong>Load Example</strong> to instantly see all algorithms in action.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
