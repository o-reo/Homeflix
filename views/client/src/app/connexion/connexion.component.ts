import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import { AuthsimpleService } from '../authsimple.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})
export class ConnexionComponent implements OnInit {

  textInfos: String;

  formGroup = new FormGroup({
    input_mail: new FormControl(),
    input_password: new FormControl()
  });

  constructor(private authService: AuthsimpleService, private router: Router) { }

  ngOnInit() { }

  onSubmit() {
    const newAuth = {
      mail: this.formGroup.value.input_mail,
      password: this.formGroup.value.input_password
  };
    this.authService.goAuth(newAuth)
      .subscribe(response => {
        console.log(response);
        if (!response.msg) {
          localStorage.setItem('isLog', 'true');
          localStorage.setItem('mail', newAuth.mail);
          localStorage.setItem('passwd', newAuth.password);
          this.authService.myUser = response;
          this.router.navigate(['forum']);
        } else {
          localStorage.removeItem('isLog');
          this.textInfos = 'Connexion Imposible !';
        }
      });
  }

}
