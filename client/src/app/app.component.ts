import { Component, OnInit } from '@angular/core';
import { AuthsimpleService } from './authsimple.service';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Hypertube';
  loaded: Promise<boolean>;
  logged = false;

  constructor(private authService: AuthsimpleService, private userService: UserService) {}

  ngOnInit() {
    if ('isLog' in localStorage && localStorage.getItem('isLog') === 'true') {
      this.logged = true;
      this.userService.getMyUser()
        .subscribe(user => {
          console.log('3: ', user);
          this.authService.myUser = user;
          this.loaded = Promise.resolve(true);
          console.log('IsLog');
        });
    } else {
      this.logged = false;
      this.loaded = Promise.resolve(true);
    }
   /* if (this.authService.isLog === true) {
      this.userService.getMyUser()
        .subscribe(user => {
          this.authService.myUser = user;
          this.loaded = Promise.resolve(true);
        });
    } else {
      this.loaded = Promise.resolve(true);
    } */
  }
}
