import {Component, OnInit} from '@angular/core';
import {HyperAuthService} from '../auth.service';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService, GoogleLoginProvider, SocialUser} from 'angularx-social-login';
import {API_42, API_GITHUB, API_SLACK} from '../credentials';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  username: string;
  password: string;
  user: SocialUser;
  provider: string;

  constructor(private authService: HyperAuthService,
              private googleAuthService: AuthService,
              public snackBar: MatSnackBar,
              private router: Router,
              private http: HttpClient,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.provider = localStorage.getItem('provider');
    this.googleAuthService.authState.subscribe((user) => {
      this.user = user;
    });
    this.activatedRoute.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        if (this.provider === '42') {
          this.Authorize42(code);
        }
        if (this.provider === 'github') {
          this.AuthorizeGithub(code);
        }
        if (this.provider === 'slack') {
          this.AuthorizeSlack(code);
        }
        window.localStorage.removeItem('provider');
      }
    });
  }

  login() {
    console.log(this.user);
    this.authService.login({username: this.username, password: this.password}, (res) => {
      if (res['msg']) {
        this.snackBar.open(res['msg'], 'X', {
          duration: 2000
        });
      } else {
        this.router.navigate(['/profile']);
      }
    });
  }

  signInWithGoogle(): void {
    this.googleAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((resp) => {
        const user = {
          id: resp.id,
          firstname: resp.firstName,
          lastname: resp.lastName,
          username: resp.firstName,
          path_picture: resp.photoUrl,
          email: resp.email,
          provider: 'GOOGLE'
        };
        this.authService.oauth(user, (status, err) => {
          if (!status) {
            this.snackBar.open(err, 'X', {
              duration: 2000
            });
            this.router.navigate(['/register']);
          } else {
            this.router.navigate(['/profile']);
          }
        });
      });
  }

  signInWith42(): void {
    localStorage.setItem('provider', '42');
    const redirect_uri = 'http%3A%2F%2Flocalhost%3A4200%2Fauth%2F';
    window.location.href = `https://api.intra.42.fr/oauth/authorize` +
      `?client_id=${API_42.client_id}&redirect_uri=${redirect_uri}&response_type=code`;
  }

  Authorize42(code: string): void {
    const auth = {
      grant_type: 'authorization_code',
      client_id: API_42.client_id,
      client_secret: API_42.client_secret,
      code: code,
      redirect_uri: 'http://localhost:4200/auth/'
    };
    this.http.post<any>('https://api.intra.42.fr/oauth/token', auth)
      .subscribe(response => {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', 'Bearer ' + response.access_token);
        this.http.get<any>('https://api.intra.42.fr/v2/me', {headers: headers})
          .subscribe(resp => {
            const user = {
              id: resp.id,
              firstname: resp.first_name,
              lastname: resp.last_name,
              username: resp.login,
              path_picture: resp.image_url,
              email: resp.email,
              provider: '42'
            };
            this.authService.oauth(user, (status, err) => {
              if (!status) {
                this.snackBar.open(err.msg, 'X', {
                  duration: 2000
                });
                setTimeout(() => {
                  this.router.navigate(['/register'], {queryParams: err.user});
                }, 3000);
              } else {
                this.router.navigate(['/profile']);
              }
            });
          }, err => {
            console.log(err);
          });
      }, err => {
        console.log(err);
        this.snackBar.open(err.statusText, 'X', {
          duration: 2000
        });
      });
  }

  signInWithGithub(): void {
    localStorage.setItem('provider', 'github');
    window.location.href = `https://github.com/login/oauth/authorize` +
      `?client_id=${API_GITHUB.client_id}&scope=read:user`;
  }

  AuthorizeGithub(code: string): void {
    const auth = {
      client_id: API_GITHUB.client_id,
      client_secret: API_GITHUB.client_secret,
      code: code,
      responseType: 'text'
    };
    let access_token = null;
    this.http.post<string>('https://github.com/login/oauth/access_token', auth)
      .subscribe(response => {
      }, (err) => {
        if (err.status === 200) {
          access_token = err.error.text.split('&')[0].substring(13);
          if (access_token) {
            const headers = new HttpHeaders();
            this.http.get<any>(`https://api.github.com/user?access_token=${access_token}`, {headers: headers})
              .subscribe((resp) => {
                const name = resp.name.split(' ');
                const user = {
                  id: resp.id,
                  firstname: name[0],
                  lastname: name[name.length - 1],
                  username: resp.login,
                  path_picture: resp.avatar_url,
                  email: resp.email,
                  provider: 'github'
                };
                this.authService.oauth(user, (status, err) => {
                  if (!status) {
                    this.snackBar.open(err.msg, 'X', {
                      duration: 2000
                    });
                    setTimeout(() => {
                      this.router.navigate(['/register'], {queryParams: err.user});
                    }, 3000);
                  } else {
                    this.router.navigate(['/profile']);
                  }
                });
              }, (error) => {
                console.log(error);
              });
          }
        }
      });
  }

  signInWithSlack(): void {
    localStorage.setItem('provider', 'slack');
    window.location.href = `https://slack.com/oauth/authorize` +
      `?client_id=${API_SLACK.client_id}&scope=users.profile:read&state=thisisasecret`;
  }

  AuthorizeSlack(code: string): void {
    const auth = `client_id=${API_SLACK.client_id}&client_secret=${API_SLACK.client_secret}&code=${code}&state=thisisasecret`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
    this.http.post<any>('https://slack.com/api/oauth.access', auth, {headers})
      .subscribe(response => {
        const access_token = response.access_token;
        this.http.get<any>(`https://slack.com/api/users.profile.get?token=${access_token}`, {headers: headers})
          .subscribe((resp => {
            const name = resp.profile.real_name.split(' ');
            const user = {
              id: resp.profile.avatar_hash,
              firstname: name[0],
              lastname: name[name.length - 1],
              username: resp.profile.display_name,
              path_picture: resp.profile.image_192,
              email: resp.profile.email,
              provider: 'slack'
            };
            this.authService.oauth(user, (status, err) => {
              if (!status) {
                this.snackBar.open(err.msg, 'X', {
                  duration: 2000
                });
                setTimeout(() => {
                  this.router.navigate(['/register'], {queryParams: err.user});
                }, 3000);
              } else {
                this.router.navigate(['/profile']);
              }
            });
          }));
      });
  }
}
