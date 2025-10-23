/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message:
            'Access denied: You are not authorized to access this resource.',
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
