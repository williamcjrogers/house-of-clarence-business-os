import type { VercelRequest, VercelResponse } from '@vercel/node';
import { preloadData } from '../server/preload-data';

// Initialize data on cold start
let dataInitialized = false;

async function initializeData() {
  if (!dataInitialized) {
    try {
      await preloadData();
      dataInitialized = true;
      console.log('Data initialized successfully');
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize data if not already done
    await initializeData();
    
    // Import storage after initialization
    const { storage } = await import('../server/storage');
    
    if (req.method === 'GET') {
      const products = await storage.getProducts();
      res.status(200).json(products);
    } else if (req.method === 'POST') {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}