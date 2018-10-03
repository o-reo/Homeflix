import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';
import {User} from './user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  myUser: User;

  get isLog(): any {
    if ('isLog' in localStorage && localStorage.getItem('isLog') === 'true') {
      return true;
    } else {
      return false;
    }
  }

  constructor(private http: HttpClient, private router: Router) {
  }

  goAuth(auth) {
    return this.http.post<any>('http://localhost:3000/api/auth', auth);
  }


  getHeader_authBasic(application) {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic '
      + btoa(localStorage.getItem('mail') + ':' + localStorage.getItem('passwd')));
    headers = headers.append('Content-Type', application);
    return headers;
  }

  logOut() {
    localStorage.removeItem('isLog');
    localStorage.removeItem('mail');
    localStorage.removeItem('passwd');
  }
}
