// Backend API endpoint for Base Mini App authentication verification
// This should be deployed with your mini-app backend

// For Vercel deployment, this would go in /api/auth.js
// For other platforms, adapt as needed

export default async function handler(req, res) {
  // Handle CORS for mini-app requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // NOTE: You'll need to install @farcaster/quick-auth in your backend
    // npm install @farcaster/quick-auth
    
    const { createClient, Errors } = await import('@farcaster/quick-auth');
    const client = createClient();
    
    const token = authorization.split(' ')[1];
    const domain = req.headers.host || 'www.craycray.xyz';

    // Verify the JWT token from Base Quick Auth as recommended
    const payload = await client.verifyJwt({ 
      token, 
      domain 
    });
    
    // Get additional user info from the JWT payload
    // The payload contains: { iat, iss, exp, sub (FID), aud }
    
    // For Base Mini Apps, we can get the address from the JWT token or context
    // The subject (sub) is the FID, but we need the wallet address for inboxId
    // Since this is called from the mini-app, the context should already have the address
    
    return res.json({
      fid: payload.sub,
      authenticated: true,
      // The address will be available from the mini-app context
      // This API just verifies the JWT token is valid
    });
    
  } catch (error) {
    console.error('Authentication verification failed:', error);
    
    if (error instanceof Errors.InvalidTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
