import {Component, OnInit} from '@angular/core';
import {UserService} from '../user.service';
import {HyperAuthService} from '../auth.service';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {FileUploader} from 'ng2-file-upload/ng2-file-upload';
import * as $ from 'jquery';

const URL = `http://${window.location.hostname}:3000/user/upload/`;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  err_username: string;
  err_photo: string;
  username: string;
  language: string;
  photo: string;
  id: string;
  pathPicture: string;
  req: boolean;
  text: string;

  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: 'photo',
    allowedMimeType: ['image/png', 'image/jpeg', 'image/jpg']
  });

  constructor(private userService: UserService,
              private authService: HyperAuthService,
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
    this.uploader.onCompleteItem = (item, response) => {
      const updatePhoto = new Promise((resolve) => {
        this.authService.login({username: this.username}, function() {
          resolve();
        });
      });
      // Updates the user image after it was uploaded
      updatePhoto.then(() => {
        let name = JSON.parse(response).filename;
        const req = {'photo': name};
        this.userService.updateMyUser(req).subscribe();
      });
    };
    $('#file-upload').click(() => {
      $('#file-upload_back').click();
    });
    $('#file-upload_back').change(function () {
      const filelist = $(this).val().split('\\');
      $('#file-upload_file').val(filelist[filelist.length - 1]);
    });
    this.activatedRoute.queryParams.subscribe(params => {
      this.username = params.username;
    });
  }

  register() {
    /* Puts all inputs into new object. */
    const newUser = {
      username: this.username
    };
    /* Adds language into object if it was given in inputs. */
    if (this.language) {
      newUser['language'] = this.language;
    }
    /* Cleans errors if some were displayed. */
    this.cleanErrors();
    /* Sends object to router. */
    this.userService.addUser(newUser)
      .subscribe(response => {
        if (response['msg']) {
          this.snackBar.open(response['msg'], 'X', {
            duration: 3000,
          });
        }
        /* If request succeeded upload picture and empty form, if not throw error messages.*/
        if (response['success'] === true) {
          this.id = response['id'];
          this.uploader.uploadAll();
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 3000);
        } else {
          this.throwError(response['err']);
        }
      });
  }

  throwError(errors) {
    if (errors['no_photo'] === true) {
      this.err_photo = 'You must add a picture.';
    }
    if (errors['username_undefined'] === true) {
      this.err_username = 'Username is empty.';
    }
    if (errors['username_uncorrect'] === true) {
      this.err_username = 'Username should not contains any special characters.';
    }
  }

  cleanErrors() {
    this.err_username = null;
    this.err_photo = null;
  }
}
