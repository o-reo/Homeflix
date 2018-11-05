import { Component, OnInit } from '@angular/core';
import { HyperAuthService } from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(public authService: HyperAuthService, private router: Router) {
  }

  ngOnInit() {
  }

}
