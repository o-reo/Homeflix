import {Component, OnInit} from '@angular/core';
import {UserService} from '../user.service';
// import {User} from '../user';
import {FormControl, FormGroup} from '@angular/forms';
import {HyperAuthService} from '../auth.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  username: string;
  firstname: string;
  lastname: string;
  photo: string;
  language: string;
  email: string;
  id: string;

  constructor(private authService: HyperAuthService, private userService: UserService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    /* Gets id from url. */
    this.activatedRoute.queryParams.subscribe(params => {
      this.id = params['id'];
    });

    this.userService.getUser(this.id).subscribe(resp => {
      if (resp['photo'].includes('http://') || resp['photo'].includes('https://')) {
        this.photo = resp['photo'];
      } else {
        this.photo = 'http://localhost:3000/' + resp['photo'];
      }
      this.username = resp['username'];
      this.firstname = resp['first_name'];
      this.lastname = resp['last_name'];
      this.language = resp['language'];
      if (resp['email']) {
        this.email = resp['email'];
      }
    });
  }

  getImg() {
    if (!this.photo) {
      return 'none';
    }
    if (this.photo.includes('http://') || this.photo.includes('https://')) {
      return 'url(\'' + this.photo + '\')';
    }
    return 'url(\'' + this.photo + '\')';
  }
}
