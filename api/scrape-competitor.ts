import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      const { webScraper } = await import('../server/web-scraper');
      const { siteUrl, profileName } = req.body;
      const result = await webScraper.scrapeCompetitorCatalog(siteUrl, profileName);
      res.status(200).json(result);
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Scrape competitor API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}