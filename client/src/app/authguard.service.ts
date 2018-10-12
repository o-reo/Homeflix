import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, observable} from 'rxjs';
import {AuthsimpleService} from './authsimple.service';
import {Injectable} from '@angular/core';

@Injectable()
export class AuthguardService implements CanActivate {

  constructor(private authService: AuthsimpleService,
              private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isLog) {
      return true;
    } else {
      this.router.navigate(['/auth']);
    }
  }
}
