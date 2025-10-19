// API endpoint to fetch reminders for a specific inboxId from your devconnect-concierge agent's database
import { Pool } from 'pg';

// Database connection - requires DATABASE_URL environment variable in Vercel
// This should be the same DATABASE_URL your devconnect-concierge agent uses
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
}

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}) : null;

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { inboxId } = req.query;

  if (!inboxId) {
    return res.status(400).json({ error: 'inboxId is required' });
  }

  if (!pool) {
    return res.status(500).json({ 
      error: 'Database not configured',
      message: 'DATABASE_URL environment variable is required'
    });
  }

  try {
    // Use the same query as your agent's listAllPendingForInbox function
    const result = await pool.query(
      `SELECT id, inbox_id, conversation_id,
              to_char(target_time, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS target_time,
              message, sent,
              to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at
       FROM reminders
       WHERE inbox_id = $1 AND sent = FALSE
       ORDER BY target_time ASC`,
      [inboxId]
    );

    // Return the reminders in the same format your agent uses
    return res.json(result.rows);

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch reminders',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
