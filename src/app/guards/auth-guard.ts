import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserAuth } from '../services/user-auth';

export const authGuard: CanActivateFn = () => {
  let _UserAuth = inject(UserAuth)
  let router = inject(Router)
  if(_UserAuth.isAuthenticated()){
     return true;
  }else{
    router.navigateByUrl('/Login')
    return false;
  }

};
