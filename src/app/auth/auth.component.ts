import {Component, OnInit, Inject} from '@angular/core';
import {HyperAuthService} from '../auth.service';
import {UserService} from '../user.service';
import {MatSnackBar} from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {API_42, API_GITHUB, API_SLACK, API_GOOGLE} from '../credentials';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  username: string;
  password: string;
  provider: string;
  email: string;

  constructor(private authService: HyperAuthService,
              private userService: UserService,
              public snackBar: MatSnackBar,
              private router: Router,
              private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['watch']);
    }
  }


  login() {
    window.localStorage.removeItem('provider');
    this.authService.login({username: this.username}, (res) => {
      if (res['msg']) {
        this.snackBar.open(res['msg'], 'X', {
          duration: 2000
        });
      } else {
        this.router.navigate(['/profile']);
      }
    });
  }
}

@Component({
  selector: 'app-dialog-template',
  templateUrl: 'dialog-template.html',
})

export class DialogTemplateComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogTemplateComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
