// import express from 'express';
// import rateLimit from 'express-rate-limit';



// const WHITELIST = ['123.45.67.89']; // Add trusted IPs here

// // Define the rate limiting rules
// const apiLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute window
//   max: 5, // limit each IP to 5 requests per windowMs
//   message: 'Too many requests, please try again after a minute.',
//   headers: true, // Add headers to let users know how many requests they have left
//   handler: (req, res, next, options) => {
//     // Custom handler for rate-limited requests
//     res.status(429).json({
//       status: 'error',
//       message: options.message,
//       retryAfter: Math.ceil(options.windowMs / 1000), // Retry time in seconds
//     });
//   },
//   skip: (req) => WHITELIST.includes(req.ip), // Skip rate limiting for whitelisted IPs
// });

// // Apply the rate limiter to specific routes
// app.use('/api/login', apiLimiter);
// app.use('/api/signup', apiLimiter);

// // Example route
// app.get('/api/user-balance', (req, res) => {
//   res.json({ balance: 1000 });
// });

// // Graceful server shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM signal received: closing HTTP server');
//   app.close(() => {
//     console.log('HTTP server closed');
//   });
// });
