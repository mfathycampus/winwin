import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../middleware/errorHandler';
import type { JwtPayload, UserRole } from '@winwin/shared';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('غير مصرح لك بالوصول', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new AppError('الجلسة منتهية، يرجى تسجيل الدخول مجدداً', 401, 'TOKEN_EXPIRED');
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError('غير مصرح لك بالوصول', 401);
    if (!roles.includes(req.user.role)) {
      throw new AppError('ليس لديك صلاحية لهذا الإجراء', 403, 'FORBIDDEN');
    }
    next();
  };
}
