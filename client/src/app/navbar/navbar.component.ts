import { Component, OnInit } from '@angular/core';
import { AuthsimpleService } from '../authsimple.service';
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

  constructor(private authService: AuthsimpleService, private router: Router) {
  }

  ngOnInit() {
    console.log('2: ', this.myUser);
  }

  logOut() {
    this.authService.logOut();
    this.router.navigate(['auth']);
  }

}
