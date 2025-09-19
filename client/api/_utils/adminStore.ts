export type AdminParticipant = {
  pid: number;
  clientId?: string | null;
  participated: boolean;
  win?: boolean;
  joinedAt: number;
  drawAt?: number;
};

let nextPid = 1;
let items: AdminParticipant[] = [];

export function getParticipants() {
  return items.slice().sort((a,b)=>a.pid-b.pid);
}

export function allocateParticipant(clientId?: string | null): AdminParticipant {
  const p: AdminParticipant = {
    pid: nextPid++,
    clientId: clientId || undefined,
    participated: false,
    joinedAt: Date.now(),
  };
  items.push(p);
  return p;
}

export function markDraw(pid: number, win: boolean) {
  const p = items.find(x=>x.pid===pid);
  if (!p) return;
  p.participated = true;
  p.win = win;
  p.drawAt = Date.now();
}

export function resetOne(pid: number) {
  const p = items.find(x=>x.pid===pid);
  if (!p) return;
  p.participated = false;
  p.win = undefined;
  p.drawAt = undefined;
}

export function resetAll() {
  items = [];
  nextPid = 1;
}

export function getStats() {
  return {
    totalParticipants: items.length,
    participated: items.filter(p=>p.participated).length,
    winners: items.filter(p=>p.win===true).length,
  };
}


