import jwt from 'jsonwebtoken';

// Get JWT_SECRET from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

// Create Access Token
export const createAccessToken = (userId: string | number, email: string): string => {
  return jwt.sign(
    { userId, email }, // Payload (user info)
    JWT_SECRET, // Secret key (make sure to define this in your .env file)
    { expiresIn: '1h' } // Token expiration time (1 hour in this case)
  );
};

// Create Refresh Token
export const createRefreshToken = (userId: number, email: string): string => {
  const payload = {
    userId,
    email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // Refresh token lasts 7 days
};

// Verify Access Token
export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET); // Verifies the access token
  } catch (err) {
    throw new Error('Invalid or expired access token');
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET); // Verifies the refresh token
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
};
