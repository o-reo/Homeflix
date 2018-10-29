import {Component, OnInit} from '@angular/core';
import {UserService} from '../user.service';
// import {User} from '../user';
import {FormControl, FormGroup} from '@angular/forms';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user = null;
  formGroup = new FormGroup({
    input_lastName: new FormControl(),
    input_firstName: new FormControl(),
    input_email: new FormControl(),
    input_lang: new FormControl()
  });

  formGroupPhoto = new FormGroup({
    uploadImg: new FormControl()
  });

  profilePhoto: any;

  // get myUser(): User {
  //   return this.authService.getUser();
  // }

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    this.authService.getUser().subscribe(resp => {
      console.log(resp);
      this.user = resp;
      this.formGroup.controls['input_lastName'].setValue(this.user['last_name']);
      this.formGroup.controls['input_firstName'].setValue(this.user['first_name']);
      this.formGroup.controls['input_email'].setValue(this.user['mail']);
      this.formGroup.controls['input_lang'].setValue(this.user['language']);
    });
  }

  changeListener($event): void {
    this.readThis($event.target);
  }

  readThis(inputValue: any): void {
    const file: File = inputValue.files[0];
    const myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      // this.profilePhoto = myReader.result;
      // this.userService.UpdateMyPhoto(myReader.result)
      //   .subscribe();
    };
    myReader.readAsDataURL(file);
  }

  onSubmit() {
    const user = {
      first_name: this.formGroup.value.input_firstName,
      last_name: this.formGroup.value.input_lastName,
      lang: this.formGroup.value.input_lang
    };
    // this.userService.updateMyUser(user)
    //   .subscribe(msg => {
    //     console.log(msg);
    //     location.reload();
    //   });
  }

  onSubmitPhoto() {

  }
}
