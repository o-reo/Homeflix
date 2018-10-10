import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  textInfos: String;

  formGroup = new FormGroup({
    input_lastName: new FormControl(),
    input_firstName: new FormControl(),
    input_username: new FormControl(),
    input_email: new FormControl(),
    input_password: new FormControl(),
    input_password2: new FormControl()
  });

  constructor(private userService: UserService) { }

  ngOnInit() {
  }

  onSubmit() {
    if (this.formGroup.value.input_password === this.formGroup.value.input_password2) {
      const newUser = {
        first_name: this.formGroup.value.input_firstName,
        last_name: this.formGroup.value.input_lastName,
        password: this.formGroup.value.input_password,
        mail: this.formGroup.value.input_email,
        username: this.formGroup.value.input_username
      }
      this.userService.addUser(newUser)
        .subscribe(msg => {
          this.textInfos = msg.msg;
        });
    } else {
      this.textInfos = 'Les 2 mots de passes ne sont pas identiques';
      this.formGroup.controls['input_password'].setValue('');
      this.formGroup.controls['input_password2'].setValue('');
    }
  }

}
