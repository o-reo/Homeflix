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
  id: string;

  collapsed1: boolean;
  collapsed2: boolean;
  collapsed3: boolean;
  collapsed4: boolean;
  collapsed5: boolean;
  collapsed6: boolean;
  collapsed7: boolean;
  hidden: boolean;


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
    this.hidden = false;
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onBeforeUploadItem = (item) => {
      item.file.name = this.username;
    };
    this.uploader.onCompleteItem = (item, response) => {
      this.path = JSON.parse(response).filename;
      this.getImg();
      this.update_photo();
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
      this.id = resp['_id'];
    });
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


  /* Functions that updates everything except password and picture. */
  update(data, key) {
    this.cleanErrorMessage();
    const req = {'oldInfo': {'_id': this.id}, 'newInfo': {[key]: data}};
    this.userService.updateMyUser(req).subscribe(res => {
      if (res['success'] === true) {
        if (key === 'first_name') {
          key = 'First name';
        }
        if (key === 'last_name') {
          key = 'Last name';
        }
        if (key === 'language') {
          this.userService.switchLanguage(req['newInfo']['language']);
        }
        this.snackBar.open(key.charAt(0).toUpperCase() + key.slice(1) + ' was successfully updated.', 'X', {
          duration: 3000,
        });
      } else {
        this.throwErrors(res);
      }
    });
  }


  /* Function that updates password. */
  update_password() {
    this.cleanErrorMessage();
    this.userService.getUser('').subscribe(resp => {
      const req = {
        oldInfo: {'_id': resp['_id']},
        newInfo: {['password']: this.password, ['password2']: this.password2}
      };
      this.userService.updateMyUser(req).subscribe(res => {
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
      this.userService.getUser('').subscribe(resp => {
        const req = {
          oldInfo: {'_id': resp['_id']},
          newInfo: {['photo']: 'http://localhost:3000/' + this.path}
        };
        this.userService.updateMyUser(req).subscribe(res => {
          if (res['success'] === true) {
            this.snackBar.open('Photo' + ' was successfully updated.', 'X', {
              duration: 3000,
            });
          }
        });
      });
    } else {
      this.throwErrors({place: 'err_photo', message: 'Photo is empty.'});
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

  /* Function that pu image to background css. */
  enable() {
    if (this.hidden === false) {
      return ('visible');
    }
    else {
      return ('hidden');
    }
  }
}
