import {Component, OnInit, Inject} from '@angular/core';
import {HyperAuthService} from '../auth.service';
import {UserService} from '../user.service';
import {MatSnackBar} from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Router} from '@angular/router';
import {MalihuScrollbarService} from 'ngx-malihu-scrollbar';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  users;
  username: String;

  constructor(private authService: HyperAuthService,
              private userService: UserService,
              public snackBar: MatSnackBar,
              private router: Router,
              public dialog: MatDialog,
              private mScrollbarService: MalihuScrollbarService
              ) {
  }

  ngOnInit() {
    this.mScrollbarService.initScrollbar(".avatar-list", { axis: 'y', theme: 'minimal' });
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['watch']);
    }
    this.userService.getUsers().subscribe((res) => {
      this.users = res['users'];
    });
  }


  login(username) {
    this.authService.login({username: username}, (res) => {
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
