import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }
    
    const { passwordHash, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      userId: user._id,
      username: user.username,
      access_token: this.jwtService.sign(payload),
    };
  }
  
  async register(username: string, password: string, nickname: string, soldierType: string) {
    // 检查用户名是否存在
    const existingUser = await this.userModel.findOne({ username }).exec();
    if (existingUser) {
      throw new UnauthorizedException('用户名已被占用');
    }
    
    // 对密码进行加密
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 创建新用户
    const newUser = new this.userModel({
      username,
      passwordHash,
      nickname,
      soldierType,
    });
    
    await newUser.save();
    
    // 移除密码哈希后返回用户信息
    const { passwordHash: _, ...result } = newUser.toObject();
    return result;
  }
}
