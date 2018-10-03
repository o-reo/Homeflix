import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import {Router} from '@angular/router';
import { User} from '../user';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  get isLog(): any {
    return this.authService.isLog;
  }

  get myUser(): User {
    return this.authService.myUser;
  }

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
  }

  logOut() {
    this.authService.logOut();
    this.router.navigate(['auth']);
  }

}
