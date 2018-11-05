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
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  password2: string;
  language: string;
  photo: string;
  path: string;
  err_password: string;

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
      console.log(resp);
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
    this.userService.getUser('').subscribe(resp => {
      let obj = {newInfo: {[key]: data}, oldInfo: {}};
      obj['oldInfo'][key] = resp[key];
      this.userService.updateMyUser(obj).subscribe(resp => {
        console.log(resp);
      });
    });
  }

  /* Function that updates password. */
  update_password() {

    this.userService.getUser('').subscribe(resp => {
      let obj = {newInfo: {['password']: this.password, ['password2']: this.password2}, oldInfo: {}};
      obj['oldInfo']['username'] = resp['username'];
      console.log(obj);
      this.userService.updateMyUser(obj).subscribe(resp => {
        console.log(resp);
      });
    });
  }


  /* Function that updates photo. */
  update_photo() {
    console.log(this.photo);
    /* Create path of the profil picture. */
    if (this.photo) {
      let extension = this.photo.split('.')[this.photo.split('.').length - 1];
      if (extension === 'JPG' || extension === 'jpg') {
        extension = 'jpeg';
      }
      /* Request to uploads picture name to database. */
      this.userService.getUser('').subscribe(resp => {
        let obj = {newInfo: {['photo']: 'profil_pictures/' + this.username + '.' + extension}, oldInfo: {}};
        //let obj = {newInfo: {['photo']: this.password, ['password2']: this.password2}, oldInfo: {}};
        obj['oldInfo']['photo'] = resp['photo'];
        console.log(obj);
        this.userService.updateMyUser(obj).subscribe(resp => {
          console.log(resp);
          /* Uploads picture into server repositorie. */
          this.uploader.uploadAll();
        });
      });
    }
  }

  /* Function for collapse button. */
  button(coll) {
    if (coll === true) {
      return false;
    }
    else {
      return true;
    }
  }

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
