import { AccountService } from 'src/app/auth/account.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService implements CanLoad, CanActivate {

  constructor(
    private router: Router,
    private accountService: AccountService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.accountService.currentAccountValue;
    if (!currentUser) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }

  canLoad(route: Route) {
    const currentUser = this.accountService.currentAccountValue;
    if (!currentUser) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}
