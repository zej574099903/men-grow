import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ContentFilterMiddleware implements NestMiddleware {
  private readonly blockedKeywords = ['现役', '番号', 'XX军区', '部队位置', '军事机密'];

  use(req: Request, res: Response, next: NextFunction) {
    // 只检查POST和PUT请求的内容
    if (['POST', 'PUT'].includes(req.method) && req.body) {
      const bodyContent = JSON.stringify(req.body).toLowerCase();
      
      // 检查是否包含敏感关键词
      const foundKeyword = this.blockedKeywords.find(keyword => 
        bodyContent.includes(keyword.toLowerCase())
      );
      
      if (foundKeyword) {
        throw new BadRequestException('内容包含敏感军事信息，请遵守相关法规');
      }
    }
    
    next();
  }
}
