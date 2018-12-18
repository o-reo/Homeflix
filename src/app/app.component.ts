import {Component, OnInit} from '@angular/core';
import {HyperAuthService} from './auth.service';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(public authService: HyperAuthService, private translate: TranslateService) {
    translate.setDefaultLang('en');
  }

  ngOnInit() {
  }
}
