import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { PrincipalParserService } from './principal-parser.service'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly principalParser: PrincipalParserService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const user = this.principalParser.parseFromRequest(req)
    if (user) {
      ;(req as any).user = user
    }
    next()
  }
}
