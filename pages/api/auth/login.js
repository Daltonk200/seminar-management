// pages/api/auth/login.js
export default function handler(req, res) {
    // Handle only POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    // Hardcoded credentials for simplicity
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'password123';
  
    const { username, password } = req.body;
  
    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        token: 'dummy-jwt-token' // In a real app, you'd generate a JWT
      });
    }
  
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }