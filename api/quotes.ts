import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { storage } = await import('../server/storage');
    
    if (req.method === 'GET') {
      const quotes = await storage.getQuotes();
      res.status(200).json(quotes);
    } else if (req.method === 'POST') {
      const quote = await storage.createQuote(req.body);
      res.status(201).json(quote);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Quotes API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}