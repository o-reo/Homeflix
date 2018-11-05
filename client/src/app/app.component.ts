import { Component, OnInit } from '@angular/core';
import { HyperAuthService } from './auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(public authService: HyperAuthService, private router: Router) {}

  ngOnInit() {
  }
}
