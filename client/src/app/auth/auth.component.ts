import { Component, OnInit } from '@angular/core';

import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  username: string;
  password: string;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  goAuth() {
    const newAuth = {
        mail: this.username,
        password: this.password
    }
    this.authService.goAuth(newAuth)
      .subscribe(response => {
        if (response !== String) {
          localStorage.setItem('isLog', 'true');
          localStorage.setItem('mail', newAuth.mail);
          localStorage.setItem('passwd', newAuth.password);
          this.authService.myUser = response;
          this.router.navigate(['users']);
        } else {
          localStorage.removeItem('isLog');
        }
      });
  }

}
