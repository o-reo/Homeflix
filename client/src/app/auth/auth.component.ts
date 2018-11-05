import {Component, OnInit} from '@angular/core';
import {HyperAuthService} from '../auth.service';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {GOOGLE_API} from '../credentials';
import {AuthService, FacebookLoginProvider, GoogleLoginProvider, LinkedInLoginProvider} from 'angularx-social-login';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  username: string;
  password: string;

  constructor(private authService: HyperAuthService,
              public snackBar: MatSnackBar,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
  }

  login() {
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

  google_login() {

  }
}
