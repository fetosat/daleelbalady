import type { NextApiRequest, NextApiResponse } from 'next';
import { API_BASE } from '../../utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = `${API_BASE}/advanced-search/categories`;
    
    // Forward the request to the backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Forward auth header if present
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}),
      },
    });

    const data = await response.json();

    // Return the response with proper status
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Categories proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: error.message 
    });
  }
}
