import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getParticipants } from '../_utils/adminStore';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const items = getParticipants();
  res.status(200).json({ total: items.length, items, state: 'waiting', config: { hongzhongPercent: 33 } });
}


