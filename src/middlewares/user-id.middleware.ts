import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { UserService } from 'src/events/user.service';

@Injectable()
export class UserIdMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = this._extractUserIdFromHeader(req);

      if (!userId) {
        throw new UnauthorizedException('user-id header is missing');
      }

      await this.userService.getUserById(Number(userId));
      // console.log(user);

      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: error.message });
    }
  }

  private _extractUserIdFromHeader(request: Request): string | string[] {
    const userId = request.headers['user-id'];
    return userId;
  }
}
