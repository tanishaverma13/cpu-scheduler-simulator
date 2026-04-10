/**
 * Shortest Job First (SJF) - Non-Preemptive
 * At each decision point, picks the process with smallest burst time
 * among those that have already arrived.
 */
export function sjf(processes) {
  if (!processes.length) return { gantt: [], results: [] };

  const procs = processes.map(p => ({ ...p, remaining: p.burstTime }));
  const gantt = [];
  const results = [];
  let currentTime = 0;
  const completed = new Set();

  while (completed.size < procs.length) {
    const available = procs.filter(
      p => p.arrivalTime <= currentTime && !completed.has(p.pid)
    );

    if (!available.length) {
      const nextArrival = Math.min(
        ...procs.filter(p => !completed.has(p.pid)).map(p => p.arrivalTime)
      );
      gantt.push({ pid: 'IDLE', start: currentTime, end: nextArrival });
      currentTime = nextArrival;
      continue;
    }

    // Pick shortest job; tie-break by arrival time, then PID
    available.sort((a, b) => {
      if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.pid.localeCompare(b.pid);
    });

    const p = available[0];
    const start = currentTime;
    const end = currentTime + p.burstTime;

    gantt.push({ pid: p.pid, start, end });

    results.push({
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      startTime: start,
      completionTime: end,
      responseTime: start - p.arrivalTime,  // first start - arrival (= WT for non-preemptive)
      waitingTime: start - p.arrivalTime,
      turnaroundTime: end - p.arrivalTime,
    });

    currentTime = end;
    completed.add(p.pid);
  }

  return { gantt, results };
}

/**
 * Shortest Remaining Time First (SRTF) - Preemptive SJF
 * At every new arrival, checks if the new process has less remaining time
 * than the current process and preempts if so.
 * Uses event-driven simulation (jumps between arrivals/completions).
 */
export function srtf(processes) {
  if (!processes.length) return { gantt: [], results: [] };

  const procs = processes.map(p => ({
    ...p,
    remaining: p.burstTime,
    startTime: null,       // first time CPU was assigned
    completionTime: null,
  }));

  const gantt = [];
  const results = [];
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;

  while (completed < n) {
    const available = procs.filter(
      p => p.arrivalTime <= currentTime && p.remaining > 0
    );

    if (!available.length) {
      // CPU idle - jump to next arrival
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
      continue;
    }

    // Pick process with least remaining time; tie-break by arrival then PID
    available.sort((a, b) => {
      if (a.remaining !== b.remaining) return a.remaining - b.remaining;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.pid.localeCompare(b.pid);
    });

    const current = available[0];

    // Record first time this process gets CPU (for response time)
    if (current.startTime === null) current.startTime = currentTime;

    // Next event: next process arrival OR current process completing
    const nextArrival = procs
      .filter(p => p.arrivalTime > currentTime && p.remaining > 0)
      .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);

    const runUntil = Math.min(currentTime + current.remaining, nextArrival);

    // Merge consecutive gantt blocks of same process
    const last = gantt[gantt.length - 1];
    if (last && last.pid === current.pid) {
      last.end = runUntil;
    } else {
      gantt.push({ pid: current.pid, start: currentTime, end: runUntil });
    }

    current.remaining -= runUntil - currentTime;
    currentTime = runUntil;

    if (current.remaining === 0) {
      current.completionTime = currentTime;
      results.push({
        pid: current.pid,
        arrivalTime: current.arrivalTime,
        burstTime: current.burstTime,
        startTime: current.startTime,
        completionTime: current.completionTime,
        responseTime: current.startTime - current.arrivalTime,  // KEY: first CPU - arrival
        turnaroundTime: current.completionTime - current.arrivalTime,
        waitingTime: current.completionTime - current.arrivalTime - current.burstTime,
      });
      completed++;
    }
  }

  results.sort((a, b) => a.pid.localeCompare(b.pid));
  return { gantt, results };
}
