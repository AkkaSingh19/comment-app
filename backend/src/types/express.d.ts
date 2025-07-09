import { JwtPayload } from '../auth/jwt.strategy';

declare module 'express' {
  interface Request {
    user: JwtPayload;
  }
}
