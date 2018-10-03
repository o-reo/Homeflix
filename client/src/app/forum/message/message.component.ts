import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { User } from '../../user';
import { UserService } from '../../user.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: '[app-message]',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
  providers: [AuthService]
})
export class MessageComponent implements OnInit {

  @Input() content: string;
  @Input() time: string;
  @Input() user_id: string;
  @Input() message_id: string;

  loaded: Promise<boolean>;
  myUser: User;

  get isMine(): boolean{
    if (this.authService.isLog && this.myUser._id === this.user_id) {
      return true;
    }
    return false;
  }

  user: User;

  constructor(private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.userService.getUser(this.user_id)
      .subscribe(user => {
        this.user = user;
        if (this.authService.isLog) {
          this.userService.getMyUser()
            .subscribe(myUser => {
              this.myUser = myUser;
              this.loaded = Promise.resolve(true);
            });
        } else { this.loaded = Promise.resolve(true); }
      });
  }

}
