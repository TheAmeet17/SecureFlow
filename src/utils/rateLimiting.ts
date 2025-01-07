import rateLimit from 'express-rate-limit';

// Define the whitelist IP addresses
const WHITELIST = ['192.168.1.1', '203.0.113.42']; 

// Rate limiter configuration
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10, 
  message: 'Too many requests, please try again after a minute.',
  headers: true, // Include rate-limiting headers in the response
  skip: (req) => {
    // Check if req.ip exists and if it's in the whitelist
    if (req.ip) {
      return WHITELIST.includes(req.ip); // Return true or false (not undefined or "" )
    }
    return false; // If req.ip is undefined, return false to apply rate limiting
  },
});
