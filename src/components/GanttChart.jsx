import { useState } from 'react';

export function GanttChart({ gantt, processes }) {
  const [hovered, setHovered] = useState(null);
  if (!gantt?.length) return null;

  const totalTime = gantt[gantt.length-1].end;
  const colorMap  = {};
  processes.forEach(p => { colorMap[p.pid] = p.color; });

  return (
    <div>
      
       <div style={{
      fontSize: 12,
      color: 'var(--text2)',
      marginBottom: 6,
      letterSpacing: '0.05em'
    }}>
      EXECUTION TIMELINE
    </div>

      {/* Bar track */}
      <div style={{ display:'flex', height:52, borderRadius:12, overflow:'hidden', background:'linear-gradient(180deg, var(--surface), var(--surface2))', border:'1px solid var(--border)', marginBottom:6, boxShadow:'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
        {gantt.map((block, i) => {
          const pct    = ((block.end - block.start) / totalTime) * 100;
          const isIdle = block.pid === 'IDLE';
          const color  = isIdle ? null : (colorMap[block.pid] || '#e85d26');
          const isHov  = hovered === i;

          return (
            <div key={`${block.pid}-${block.start}-${block.end}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width:`${pct}%`, height:'100%', position:'relative',
                animation: 'grow 0.4s ease forwards',
                animationDelay: `${i * 0.1}s`,
                transformOrigin: 'left',
                background: isIdle
                  ? 'repeating-linear-gradient(45deg,#e8e4dd,#e8e4dd 3px,#eceae4 3px,#eceae4 8px)'
                  : `linear-gradient(135deg, ${color}, ${color}cc)`,
                borderRight:'1px solid rgba(255,255,255,0.3)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                cursor:'default', transition:'filter 0.15s, transform 0.15s',
                filter: isHov && !isIdle ? 'brightness(1.15)' : 'none',
                transform: isHov ? 'scale(1.02)' : 'scale(1)',
                overflow:'hidden',
              }}
            >
              {pct > 3 && !isIdle && (
                <span style={{ fontSize:12, fontWeight:600, color:'#fff', fontFamily:'DM Sans', textShadow:'0 1px 2px rgba(0,0,0,0.3)' }}>
                  {block.pid}
                </span>
              )}
              {pct > 6 && !isIdle && (
                <span style={{ fontSize:9, color:'rgba(255,255,255,0.75)', fontFamily:'DM Mono' }}>
                  {block.end - block.start}u
                </span>
              )}

              {/* Hover tooltip */}
              {isHov && (
                <div style={{
                  position:'absolute', bottom:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)',
                  background:'var(--surface2)', color:'var(--text)', borderRadius:9, padding:'8px 13px',
                  fontSize:12, whiteSpace:'nowrap', zIndex:50, pointerEvents:'none',
                  
                  boxShadow: isHov && !isIdle ? '0 0 0 1px rgba(255,255,255,0.08)' : 'none',
                }}>
                  <div style={{ fontWeight:700, marginBottom:3 }}>{block.pid}</div>
                  <div style={{ opacity:0.75, fontFamily:'DM Mono', fontSize:11 }}>
                    {block.start} → {block.end} · {block.end - block.start} units
                  </div>
                  {/* Arrow */}
                  <div style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:'6px solid var(--text)' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time axis */}
      <div style={{ position:'relative', height:16, marginBottom:16 }}>
        {gantt.map((block,i) => (
          <span key={i} className="mono" style={{ position:'absolute', left:`${(block.start/totalTime)*100}%`, transform:'translateX(-50%)', fontSize:10, color:'var(--text3)' }}>
            {block.start}
          </span>
        ))}
        <span className="mono" style={{ position:'absolute', right:0, fontSize:10, color:'var(--text3)' }}>{totalTime}</span>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
        {processes.map(p => (
          <div key={p.pid} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:12, height:12, borderRadius:4, background:p.color }} />
            <span style={{ fontSize:12, color:'var(--text2)', fontWeight:500 }}>{p.pid}</span>
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:12, height:12, borderRadius:4, background:'var(--border)', border:'1px solid var(--border2)' }} />
          <span style={{ fontSize:12, color:'var(--text3)' }}>Idle</span>
        </div>
      </div>
    </div>
  );
}
