import {Component, OnInit} from '@angular/core';
import {HyperAuthService} from '../auth.service';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService, GoogleLoginProvider, SocialUser} from 'angularx-social-login';
import {API_42} from '../credentials';
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

  constructor(private authService: HyperAuthService,
              private googleAuthService: AuthService,
              public snackBar: MatSnackBar,
              private router: Router,
              private http: HttpClient,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.googleAuthService.authState.subscribe((user) => {
      this.user = user;
    });
    this.activatedRoute.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.Authorize42(code);
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

          } else {
            this.router.navigate(['/profile']);
          }
        });
      });
  }

  signInWith42(): void {
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
            console.log(resp);
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
                this.snackBar.open(err, 'X', {
                  duration: 2000
                });

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
}
