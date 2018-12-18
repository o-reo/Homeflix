import {Component, OnInit} from '@angular/core';
import {UserService} from '../user.service';
// import {User} from '../user';
import {HyperAuthService} from '../auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';

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
  grant: boolean;
  amount: number;

  constructor(private authService: HyperAuthService, public snackBar: MatSnackBar, private userService: UserService,
              private activatedRoute: ActivatedRoute, private http: HttpClient, private router: Router) {
  }

  ngOnInit() {
    /* Gets id from url. */
    this.activatedRoute.queryParams.subscribe(params => {
      this.id = params['id'];
    });

    this.userService.getUser(this.id).subscribe(resp => {
      if (typeof resp['success'] !== 'undefined' && resp['success'] === false) {
        this.router.navigate(['watch']);
      } else {
        this.photo = resp['photo'];
        this.username = resp['username'];
        this.firstname = resp['first_name'];
        this.lastname = resp['last_name'];
        this.language = resp['language'];
        if (resp['email']) {
          this.email = resp['email'];
        }
        this.grant = resp['grant'];
        this.userService.switchLanguage(this.language);
      }
    });
  }

  getImg() {
    if (!this.photo) {
      return 'none';
    }
    if (!this.photo.includes('http://') && !this.photo.includes('https://')) {
      this.photo = `http://${window.location.hostname}:3000/${this.photo}`;
    }
    return 'url(\'' + this.photo + '\')';
  }

  populate() {
    const params = {};
    if (this.amount) {
      params['amount'] = this.amount;
    }
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    headers['Content-Type'] = 'application/json';
    this.http.post(`http://${window.location.hostname}:3000/setup/populate`, params, {headers: headers})
      .subscribe((err) => {
        this.snackBar.open('Database is populating in background...', 'X', {
          duration: 2000
        });
      });
  }

  getInfos() {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    headers['Content-Type'] = 'application/json';
    this.http.get(`http://${window.location.hostname}:3000/setup/informations`, {headers: headers})
      .subscribe();
    this.snackBar.open('Database data is updating in background...', 'X', {
      duration: 2000
    });
  }

  cleanDB() {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    headers['Content-Type'] = 'application/json';
    this.http.delete(`http://${window.location.hostname}:3000/setup/reset`, {headers: headers})
      .subscribe();
    this.snackBar.open('Database data is resetting...', 'X', {
      duration: 2000
    });
  }
}
