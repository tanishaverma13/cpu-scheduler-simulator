/**
 * First Come First Serve (FCFS) Scheduling Algorithm
 * Non-preemptive: processes run in order of arrival
 */
export function fcfs(processes) {
  if (!processes.length) return { gantt: [], results: [] };

  // Sort by arrival time, then by PID for tie-breaking
  const sorted = [...processes].sort((a, b) =>
    a.arrivalTime !== b.arrivalTime
      ? a.arrivalTime - b.arrivalTime
      : a.pid.localeCompare(b.pid)
  );

  const gantt = [];
  const results = [];
  let currentTime = 0;

  for (const p of sorted) {
    // Handle idle CPU gap
    if (currentTime < p.arrivalTime) {
      gantt.push({ pid: 'IDLE', start: currentTime, end: p.arrivalTime });
      currentTime = p.arrivalTime;
    }

    const start = currentTime;
    const end = currentTime + p.burstTime;

    gantt.push({ pid: p.pid, start, end });

    results.push({
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      startTime: start,
      completionTime: end,
      responseTime: start - p.arrivalTime,   // first start - arrival (same as WT for non-preemptive)
      waitingTime: start - p.arrivalTime,
      turnaroundTime: end - p.arrivalTime,
    });

    currentTime = end;
  }

  return { gantt, results };
}
