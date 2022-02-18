import Role from './role.enum';
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import RequestWithUser from '../authentication/requestWithUser.interface';

const RoleGuard = (roles: Role[]): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      // return user?.role.includes(roles);
      return roles.includes(user?.role);
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
