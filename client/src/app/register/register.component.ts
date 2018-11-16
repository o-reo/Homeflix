import {Component, OnInit} from '@angular/core';
import {UserService} from '../user.service';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {FileUploader} from 'ng2-file-upload/ng2-file-upload';
import * as $ from 'jquery';

const URL = 'http://localhost:3000/user/upload/';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  err_firstname: string;
  err_lastname: string;
  err_username: string;
  err_email: string;
  err_password: string;
  err_password2: string;
  err_photo: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  password2: string;
  language: string;
  photo: string;
  req: boolean;
  text: string;

  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: 'photo',
    allowedMimeType: ['image/png', 'image/jpeg', 'image/jpg']
  });

  constructor(private userService: UserService,
              public snackBar: MatSnackBar,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onBeforeUploadItem = (item) => {
      item.file.name = this.username;
    };
    $('#file-upload').click(() => {
      $('#file-upload_back').click();
    });
    $('#file-upload_back').change(function () {
      const filelist = $(this).val().split('\\');
      $('#file-upload_file').val(filelist[filelist.length - 1]);
    });
    this.activatedRoute.queryParams.subscribe(params => {
      this.firstname = params.firstname;
      this.lastname = params.lastname;
      this.username = params.username;
      this.email = params.email;
    });
  }

  register() {
    /* Puts all inputs into new object. */
    const newUser = {
      firstname: this.firstname,
      lastname: this.lastname,
      password: this.password,
      password2: this.password2,
      email: this.email,
      username: this.username
    };
    /* Adds language into object if it was given in inputs. */
    if (this.language) {
      newUser['language'] = this.language;
    }
    /* Create path of the profil picture. */
    if (this.photo) {
      let extension = this.photo.split('.')[this.photo.split('.').length - 1];
      if (extension === 'JPG' || extension === 'jpg') {
        extension = 'jpeg';
      }
      newUser['path_picture'] = 'profil_pictures/' + this.username + '.' + extension;
    }
    /* Cleans errors if some were displayed. */
    this.cleanErrors();
    /* Sends object to router. */
    this.userService.addUser(newUser)
      .subscribe(msg => {
        if (msg['msg']) {
          this.snackBar.open(msg['msg'], 'X', {
            duration: 3000,
          });
        }
        /* If request succeeded upload picture and empty form, if not throw error messages.*/
        if (msg['success'] === true) {
          this.uploader.uploadAll();
          setTimeout(() => {
            window.location.href = 'http://localhost:4200';
          }, 3000);
        } else {
          this.throwError(msg['err']);
        }
      });
  }

  throwError(errors) {
    if (errors['no_photo'] === true) {
      this.err_photo = 'You must add a picture.';
    }
    if (errors['firstname_undefined'] === true) {
      this.err_firstname = 'Firstname is empty.';
    }
    if (errors['lastname_undefined'] === true) {
      this.err_lastname = 'Lastname is empty.';
    }
    if (errors['username_undefined'] === true) {
      this.err_username = 'Username is empty.';
    }
    if (errors['mail_uncorrect'] === true) {
      this.err_email = 'The format of the email is uncorrect.';
    }
    if (errors['mail_undefined'] === true) {
      this.err_email = 'Email is empty.';
    }
    if (errors['password1_empty'] === true) {
      this.err_password = 'Password is empty.';
    }
    if (errors['passwords_dont_match'] === true) {
      this.err_password2 = 'Passwords don\'t match.';
    }
    if (errors['password2_empty'] === true) {
      this.err_password2 = 'Password confirmation is empty.';
    }
    if (errors['password_uncorrect'] === true) {
      this.err_password2 = 'The password should contain a letter, a digit, a special character and contain 8 characters.';
    }
  }

  cleanErrors() {
    this.err_firstname = null;
    this.err_lastname = null;
    this.err_username = null;
    this.err_email = null;
    this.err_password = null;
    this.err_password2 = null;
    this.err_firstname = null;
    this.err_photo = null;
  }
}
