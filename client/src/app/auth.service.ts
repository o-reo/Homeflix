import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Request} from '@angular/http'
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authToken: string;
  private user: any;
  constructor(private http: HttpClient, private router: Router) {
  }

  public login(user, callback) {
    this.http.post('http://localhost:3000/user/authenticate', user)
      .subscribe(res => {
          if (res['success']) {
            this.user = res['user'];
            this.authToken = res['token'];
            this.saveToken();
          }
          callback(res);
        }
      );
  }

  public register(user) {
    this.http.post('http://localhost:3000/user/register', user)
      .subscribe(resp => {
          if (resp['success']) {
            console.log(resp);
          } else {
            console.log(resp['msg']);
          }
        }
      );
  }

  public profile() {
    return this.http.get('http://localhost:3000/user/profile', { headers : { Authorization: this.getToken()}});
  }

  private saveToken() {
    localStorage.setItem('id_token', this.authToken);
    localStorage.setItem('user', this.user);
  }

  private getToken(): string {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('id_token');
    }
    return this.authToken;
  }

  public logout(): void {
    this.authToken = '';
    window.localStorage.removeItem('id_token');
    window.localStorage.removeItem('user');
    this.router.navigateByUrl('/');
  }

  public getUser(): {} {
    let user = this.user;
    if (!user) {
      user = localStorage.getItem('user');
      this.user = user;
    }
    return user;
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }
}
