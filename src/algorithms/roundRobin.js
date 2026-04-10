/**
 * Round Robin (RR) Scheduling Algorithm
 * Each process gets a fixed time quantum. If not done, goes back to queue.
 * Handles: same arrival time, idle CPU gaps, varying quantum sizes.
 */
export function roundRobin(processes, quantum = 2) {
  if (!processes.length) return { gantt: [], results: [] };

  const procs = processes.map(p => ({
    ...p,
    remaining: p.burstTime,
    startTime: null,
    completionTime: null,
    firstRun: false,
  }));

  const gantt = [];
  const results = [];
  let currentTime = 0;
  const queue = []; // ready queue (stores PIDs)
  const inQueue = new Set();
  let completed = 0;
  const n = procs.length;

  // Sort by arrival time initially
  const sorted = [...procs].sort((a, b) =>
    a.arrivalTime !== b.arrivalTime
      ? a.arrivalTime - b.arrivalTime
      : a.pid.localeCompare(b.pid)
  );

  // Helper: enqueue all processes that have arrived by time t (not yet queued, not completed)
  const enqueueArrivals = (time, excludePid = null) => {
    for (const p of sorted) {
      if (
        p.arrivalTime <= time &&
        p.remaining > 0 &&
        !inQueue.has(p.pid) &&
        p.pid !== excludePid
      ) {
        queue.push(p.pid);
        inQueue.add(p.pid);
      }
    }
  };

  // Seed initial queue
  enqueueArrivals(currentTime);

  // If nothing arrived at time 0, jump to first arrival
  if (queue.length === 0) {
    currentTime = sorted[0].arrivalTime;
    enqueueArrivals(currentTime);
  }

  while (completed < n) {
    if (queue.length === 0) {
      // CPU idle
      const nextArrival = Math.min(
        ...procs.filter(p => p.remaining > 0).map(p => p.arrivalTime)
      );
      const last = gantt[gantt.length - 1];
      if (last && last.pid === 'IDLE') {
        last.end = nextArrival;
      } else {
        gantt.push({ pid: 'IDLE', start: currentTime, end: nextArrival });
      }
      currentTime = nextArrival;
      enqueueArrivals(currentTime);
      continue;
    }

    const pid = queue.shift();
    inQueue.delete(pid);
    const p = procs.find(x => x.pid === pid);

    if (p.startTime === null) p.startTime = currentTime;

    const runTime = Math.min(quantum, p.remaining);
    const start = currentTime;
    const end = currentTime + runTime;

    gantt.push({ pid: p.pid, start, end });

    p.remaining -= runTime;
    currentTime = end;

    // Enqueue processes that arrived during this slice (before re-adding current)
    enqueueArrivals(currentTime, p.pid);

    if (p.remaining === 0) {
      p.completionTime = currentTime;
      results.push({
        pid: p.pid,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        startTime: p.startTime,
        completionTime: p.completionTime,
        responseTime: p.startTime - p.arrivalTime,  // first CPU assignment - arrival
        turnaroundTime: p.completionTime - p.arrivalTime,
        waitingTime: p.completionTime - p.arrivalTime - p.burstTime,
      });
      completed++;
    } else {
      // Re-add to back of queue
      queue.push(p.pid);
      inQueue.add(p.pid);
    }
  }

  results.sort((a, b) => a.pid.localeCompare(b.pid));
  return { gantt, results };
}
