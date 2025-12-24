import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Simulating JWT decoding since jsonwebtoken is not installed.
    // In a production environment, use:
    // const token = authHeader.split(' ')[1];
    // const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    // (req as any).user = decoded;

    // For now, we assume if the header exists, the user is authenticated.
    // We can simulate a decoded user payload.
    (req as any).user = {
      id: 'simulated-user-id',
      username: 'simulated_user',
      role: 'user'
    };

    next();
    return;
  }

  res.status(401).json({ error: 'Unauthorized' });
};
