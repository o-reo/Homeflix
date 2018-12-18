import {CanActivate, Router} from '@angular/router';
import {HyperAuthService} from './auth.service';
import {Injectable} from '@angular/core';

@Injectable()
export class AuthguardService implements CanActivate {

  constructor(private authService: HyperAuthService,
              private router: Router) { }

  canActivate() {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/']);
    }
  }
}
