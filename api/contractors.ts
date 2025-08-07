import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { storage } = await import('../server/storage');
    
    if (req.method === 'GET') {
      const contractors = await storage.getContractors();
      res.status(200).json(contractors);
    } else if (req.method === 'POST') {
      const contractor = await storage.createContractor(req.body);
      res.status(201).json(contractor);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Contractors API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}