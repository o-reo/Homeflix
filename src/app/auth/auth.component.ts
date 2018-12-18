import {Component, OnInit, Inject} from '@angular/core';
import {HyperAuthService} from '../auth.service';
import {UserService} from '../user.service';
import {MatSnackBar} from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Router} from '@angular/router';

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
