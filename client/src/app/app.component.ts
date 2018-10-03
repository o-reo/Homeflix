import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'client';
    loaded: Promise<boolean>;

  constructor(private authService: AuthService, private userService: UserService) {

  }

  ngOnInit() {
    if (this.authService.isLog === true) {
      this.userService.getMyUser()
        .subscribe(user => {
          this.authService.myUser = user;
          this.loaded = Promise.resolve(true);
        });
    } else {
      this.loaded = Promise.resolve(true);
    }
  }
}
