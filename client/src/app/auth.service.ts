import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HyperAuthService {
  private authToken: string;

  constructor(private http: HttpClient, private router: Router) {
  }

  public login(user, callback) {
    this.http.post('http://localhost:3000/user/login', user)
      .subscribe(res => {
          if (res['success']) {
            this.authToken = res['token'];
            this.saveToken();
          } else {
            console.log(res['msg']);
          }
          callback(res);
        }
      );
  }

  public oauth(user, callback) {
    this.http.post('http://localhost:3000/user/oauth', user)
      .subscribe((resp) => {
        console.log(resp);
        if (resp['success']) {
          this.authToken = resp['token'];
          this.saveToken();
        } else {
          console.log(resp['msg']);
        }
        callback();
      });
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

  public setToken(token) {
    this.authToken = token;
    localStorage.setItem('id_token', token);
  }

  private saveToken() {
    localStorage.setItem('id_token', this.authToken);
  }

  public getToken(): string {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('id_token');
    }
    return this.authToken;
  }

  public getUser(id?: string) {
    id = id || '';
    return this.http.get('http://localhost:3000/user/' + id, {headers: {Authorization: 'Bearer ' + this.getToken()}});
  }

  public logout(): void {
    this.authToken = '';
    window.localStorage.removeItem('id_token');
    this.router.navigateByUrl('/');
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    // Should check token locally
    return !!token;
  }
}
