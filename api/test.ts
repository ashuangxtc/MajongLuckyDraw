import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Test API called:', req.method, req.url);
  return res.status(200).json({ 
    ok: true, 
    method: req.method, 
    url: req.url,
    timestamp: Date.now() 
  });
}
