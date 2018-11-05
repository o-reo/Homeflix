import {Component, OnInit} from '@angular/core';
import {HyperAuthService} from '../auth.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {AuthService, GoogleLoginProvider, SocialUser} from 'angularx-social-login';

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
              private router: Router) {
  }

  ngOnInit() {
    this.googleAuthService.authState.subscribe((user) => {
      this.user = user;
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
    console.log('Trying to login with Google...');
    this.googleAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((resp) => {
          console.log('response:', resp);
          const user = {
            id: resp.id,
            firstname: resp.firstName,
            lastname: resp.lastName,
            username: resp.firstName,
            path_picture: resp.photoUrl,
            email: resp.email,
            provider: 'GOOGLE'
          };
          this.authService.oauth(user, (resp) => {
            console.log('oauth:', resp);
          });
        }, (err) => {
          console.log('error', err);
        }
      );
    // this.authService.goAuthWithGoogle(this.user)
    //   .subscribe(response => {
    //     if (response.success == true) {
    //       localStorage.setItem('isLog', 'true');
    //       localStorage.setItem('token', response.token);
    //       this.authSimpleService.myUser = response.user;
    //       console.log('rresp: ', response.user);
    //       this.router.navigate(['torrents']);
    //     } else {
    //       localStorage.removeItem('isLog');
    //     }
    //   });
  }
}
