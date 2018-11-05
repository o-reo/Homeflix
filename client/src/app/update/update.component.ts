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
  }

  upload(data, key) {
    this.userService.getUser('').subscribe(resp => {
      let obj = {newInfo: {[key]: data}, oldInfo: {}};
      obj['oldInfo'][key] = resp[key];
      this.userService.updateMyUser(obj).subscribe(resp => {
        console.log(resp);
      });
    });
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
}
