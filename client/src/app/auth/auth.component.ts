import { Component, OnInit } from '@angular/core';
import {AuthsimpleService} from '../authsimple.service';
import {Router} from '@angular/router';
import {AuthService, FacebookLoginProvider, GoogleLoginProvider, SocialUser} from 'angularx-social-login';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  username: string;
  password: string;
  user: SocialUser;

  constructor(private authSimpleService: AuthsimpleService, private router: Router, private authService: AuthService, private http: HttpClient) { }

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.user = user;
    });
    var parts = window.location.search.substr(1).split("&");
    var $_GET = {};
    for (var i = 0; i < parts.length; i++) {
      var temp = parts[i].split("=");
      $_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
    }
    if ('code' in $_GET && (('isLog' in localStorage) === false
      || ('isLog' in localStorage && localStorage.getItem('isLog') === 'false'))) {
      this.signInWith42($_GET['code']);
    }
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
    console.log(this.user);
    this.authSimpleService.goAuthWithGoogle(this.user)
      .subscribe(response => {
        if (response.success == true) {
          localStorage.setItem('isLog', 'true');
          localStorage.setItem('token', response.token);
          this.authSimpleService.myUser = response.user;
          console.log('rresp: ', response.user);
          this.router.navigate(['torrents']);
        } else {
          localStorage.removeItem('isLog');
        }
      });
  }

  signInWith42(code: string): void {
    const auth = {
      grant_type: 'authorization_code',
      client_id: '5ce22ae173d5c328029ee542afc8fe162935f4698642f91afe77a747dac61523',
      client_secret: 'b82a3dbdec7522f57b01cfc3e17cee54ddbce81021555ddacb130a13a6ee8dbc',
      code: code,
      redirect_uri: 'http://localhost:4200/auth/'
    };
    console.log('CODE: ', code);
    this.http.post<any>('https://api.intra.42.fr/oauth/token', auth)
      .subscribe(response => {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', 'Bearer ' + response.access_token);
        console.log('TOKEN: ', response.access_token);
        this.http.get<any>('https://api.intra.42.fr/v2/me', {headers: headers})
          .subscribe(user => {
            this.authSimpleService.goAuthWith42(user)
              .subscribe(res => {
                console.log('RESPONSE: ', res);
                if (res.success == true) {
                  localStorage.setItem('isLog', 'true');
                  localStorage.setItem('token', res.token);
                  this.authSimpleService.myUser = res.user;
                  console.log('rresp: ', res.user);
                  this.router.navigate(['torrents']);
                } else {
                  localStorage.removeItem('isLog');
                }
              });
          });
      });
  }

  goAuth() {
    const newAuth = {
        username: this.username,
        password: this.password
    }
    this.authSimpleService.goAuth(newAuth)
      .subscribe(response => {
        if (response.success == true) {
          localStorage.setItem('isLog', 'true');
          localStorage.setItem('token', response.token);
          this.authSimpleService.myUser = response.user;
          console.log('rresp: ', response.user);
          this.router.navigate(['torrents']);
        } else {
          localStorage.removeItem('isLog');
        }
      });
  }

}
