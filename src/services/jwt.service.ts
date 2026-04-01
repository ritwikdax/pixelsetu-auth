import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import { DOMAIN } from '../const.js';

class JWTService {
    private JWT_SECRET: string;

    constructor() {
        this.JWT_SECRET = env("JWT_SECRET");
    }

    sign(payload: Record<string, any>): string {
        return jwt.sign({ ...payload, iss: DOMAIN }, this.JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
    }

    verify<TClaims>(token: string, options?: jwt.VerifyOptions) {
        try {
            return jwt.verify(token, this.JWT_SECRET, options) as TClaims;
        } catch (err) {
            return null;
        }
    }
}

export const jwtService = new JWTService();