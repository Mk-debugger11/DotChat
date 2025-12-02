import { verifyToken } from '../utils/jwt.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    const userId = verifyToken(token);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid or expired token' });
    }

    // Backwards-compatible and new-style access
    req.userId = userId;
    req.user = { id: userId };

    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, error: 'Authentication failed' });
  }
};


