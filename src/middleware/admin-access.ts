import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function enforceAdminAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let user = req.user;
  const cookie = req.cookies.presence;
  if (!user && cookie) {
    user = jwt.decode(cookie);
  }
  if (user && user.accessGroups && user.accessGroups.includes('admin')) {
    next();
  } else {
    res.status(401).send('Invalid access!');
  }
}
