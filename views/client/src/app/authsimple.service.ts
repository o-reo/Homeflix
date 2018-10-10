import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';
import {User} from './user';


@Injectable({
  providedIn: 'root'
})
export class AuthsimpleService {
  myUser: User;

  get isLog(): any {
    if ('isLog' in localStorage && localStorage.getItem('isLog') === 'true') {
      return true;
    } else {
      return false;
    }
  }

  constructor(private http: HttpClient, private router: Router) {}

  goAuth(auth) {
    return this.http.post<any>('http://localhost:3000/api/auth/sign_in', auth);
  }

  signIn42(code: string) {
    /*let token = '';
    const credentials = {
      grant_type: 'client_credentials',
      client_id: '5ce22ae173d5c328029ee542afc8fe162935f4698642f91afe77a747dac61523',
      client_secret: 'b82a3dbdec7522f57b01cfc3e17cee54ddbce81021555ddacb130a13a6ee8dbc'
    };
    this.http.post<any>('https://api.intra.42.fr/oauth/token', credentials)
      .subscribe(response => {
        token = response.access_token;
      })*/
    const auth = {
      grant_type: 'authorization_code',
      client_id: '5ce22ae173d5c328029ee542afc8fe162935f4698642f91afe77a747dac61523',
      client_secret: 'b82a3dbdec7522f57b01cfc3e17cee54ddbce81021555ddacb130a13a6ee8dbc',
      code: code,
      redirect_uri: 'http://localhost:4200/auth/'
    };
    console.log('CODE: ', code);
    this.http.post<any>('https://api.intra.42.fr/oauth/token', auth)
      .subscribe(response => {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', 'Bearer ' + response.access_token);
        console.log('TOKEN: ', response.access_token);
        return this.http.get<any>('https://api.intra.42.fr/v2/me', {headers: headers});
      });
  }

  goAuthWith42(user) {
    return this.http.post<any>('http://localhost:3000/api/auth/sign_in/42', user);
  }

  goAuthWithGoogle(user)  {
    return this.http.post<any>('http://localhost:3000/api/auth/sign_in/google', user);
  }


  getHeader_authBasic(application) {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic '
      + btoa(localStorage.getItem('mail') + ':' + localStorage.getItem('passwd')));
    headers = headers.append('Content-Type', application);
    return headers;
  }

  getHeader_token(application) {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'JWT ' + localStorage.getItem('token'));
    if (application != false)
      headers = headers.append('Content-Type', application);
    return headers;
  }

  logOut() {
    localStorage.removeItem('isLog');
    localStorage.removeItem('token');
  }
}
