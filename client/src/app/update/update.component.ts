import {Component, OnInit} from '@angular/core';
import {UserService} from '../user.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {FileUploader} from 'ng2-file-upload/ng2-file-upload';
import * as $ from 'jquery';

const URL = 'http://localhost:3000/user/upload/';

@Component({
  selector: 'app-register',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})

export class UpdateComponent implements OnInit {
  err_firstname: string;
  err_lastname: string;
  err_username: string;
  err_email: string;
  err_password: string;
  err_password2: string;
  err_photo: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  password2: string;
  language: string;
  photo: string;
  path: string;


  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: 'photo',
    allowedMimeType: ['image/png', 'image/jpeg', 'image/jpg']
  });

  constructor(private userService: UserService,
              public snackBar: MatSnackBar,
              private router: Router) {
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


    this.userService.getUser('').subscribe(resp => {
      this.first_name = resp['first_name'];
      this.last_name = resp['last_name'];
      this.username = resp['username'];
      this.email = resp['email'];
      this.language = resp['language'];
      this.path = resp['photo'];
    });
  }

  /* Functions that updates everything except password and picture. */
  update(data, key) {
    this.cleanErrorMessage();
    this.userService.getUser('').subscribe(resp => {
      const obj = {newInfo: {[key]: data}, oldInfo: {}};
      obj['oldInfo'][key] = resp[key];
      this.userService.updateMyUser(obj).subscribe(res => {
        if (res['success'] === true) {
          if (key === 'first_name') {
            key = 'First name';
          }
          if (key === 'last_name') {
            key = 'Last name';
          }
          this.snackBar.open(key.charAt(0).toUpperCase() + key.slice(1) + ' was successfully updated.', 'X', {
            duration: 3000,
          });
        } else {
          this.throwErrors(res);
        }
      });
    });
  }

  /* Function that updates password. */
  update_password() {
    this.cleanErrorMessage();
    this.userService.getUser('').subscribe(resp => {
      const obj = {newInfo: {['password']: this.password, ['password2']: this.password2}, oldInfo: {}};
      obj['oldInfo']['username'] = resp['username'];
      this.userService.updateMyUser(obj).subscribe(res => {
        if (res['success'] === true) {
          this.snackBar.open('Password' + ' was successfully updated.', 'X', {
            duration: 3000,
          });
        } else {
          let errors = {};
          if (Object.keys(res).length === 0) {
            if (!this.password && !this.password2) {
              errors = {
                place: 'err_password', message: 'Password is undefined.',
                place2: 'err_password2', message2: 'Password confirmation is undefined.'
              };
            } else if (!this.password) {
              errors = {place: 'err_password', message: 'Password is undefined.'};
            } else if (!this.password2) {
              errors = {place: 'err_password2', message: 'Password confirmation is undefined.'};
            } else if (this.password && this.password2 && this.password !== this.password2) {
              errors = {place: 'err_password2', message: 'Passwords don\'t match.'};
            }
          } else {
            errors = res;
          }
          this.throwErrors(errors);
        }
      });
    });
  }

  /* Function that updates photo. */
  update_photo() {
    this.cleanErrorMessage();
    /* Create path of the profil picture. */
    if (this.photo) {
      let extension = this.photo.split('.')[this.photo.split('.').length - 1];
      if (extension === 'JPG' || extension === 'jpg') {
        extension = 'jpeg';
      }
      /* Request to uploads picture name to database. */
      this.userService.getUser('').subscribe(resp => {
        const obj = {newInfo: {['photo']: 'profil_pictures/' + this.username + '.' + extension}, oldInfo: {}};
        obj['oldInfo']['photo'] = resp['photo'];
        this.userService.updateMyUser(obj).subscribe(res => {
          if (res['success'] === true) {
            this.snackBar.open('Photo' + ' was successfully updated.', 'X', {
              duration: 3000,
            });
            /* Uploads picture into server repositorie. */
            this.uploader.uploadAll();
          } else {
          }
        });
      });
    } else {
        this.throwErrors({place: 'err_photo', message: 'Photo is empty.'});
    }
  }

  /* Function that prints error message. */
  throwErrors(errors) {
    let varName = Object.values(errors)[0];
    this[String(varName)] = Object.values(errors)[1];
    if (Object.keys(errors).length === 4) {
      varName = Object.values(errors)[2];
      this[String(varName)] = Object.values(errors)[3];
    }
  }

  /* Function that cleans errors message. */
  cleanErrorMessage() {
    this.err_firstname = '';
    this.err_lastname = '';
    this.err_username = '';
    this.err_email = '';
    this.err_password = '';
    this.err_password2 = '';
    this.err_photo = '';
  }

  /* Function for collapse button. */
  button(coll) {
    return coll !== true;
  }

  /* Function that pu image to background css. */
  getImg() {
    if (!this.path) {
      return 'none';
    }
    if (this.path.includes('http://') || this.path.includes('https://')) {
      return 'url(\'' + this.path + '\')';
    }
    return 'url(\'http://localhost:3000/' + this.path + '\')';
  }
}

