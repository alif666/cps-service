import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthClaims } from '../auth/types';

declare global { namespace Express { interface Request { auth?: AuthClaims } } }

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) return next(Object.assign(new Error('Authentication required'), { statusCode: 401 }));
  try { req.auth = jwt.verify(header.slice(7), config.jwtSecret) as AuthClaims; next(); }
  catch { next(Object.assign(new Error('Invalid or expired token'), { statusCode: 401 })); }
};

export const requirePermission = (permission: string) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.auth?.permissions.includes(permission)) return next(Object.assign(new Error('Forbidden'), { statusCode: 403 }));
  next();
};
