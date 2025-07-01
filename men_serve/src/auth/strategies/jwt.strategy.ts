import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'men-grow-secret-key', // 在实际生产环境中，请使用环境变量存储此密钥
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
