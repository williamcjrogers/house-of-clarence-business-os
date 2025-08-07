import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { storage } = await import('../server/storage');
    
    if (req.method === 'GET') {
      const suppliers = await storage.getSuppliers();
      res.status(200).json(suppliers);
    } else if (req.method === 'POST') {
      const supplier = await storage.createSupplier(req.body);
      res.status(201).json(supplier);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Suppliers API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}