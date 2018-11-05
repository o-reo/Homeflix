import { Component, OnInit } from '@angular/core';
import {UserService} from '../user.service';
import {User} from '../user';
import {HyperAuthService} from '../auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [UserService]
})
export class UsersComponent implements OnInit {
  users: User[];
  user: User;
  first_name: string;
  last_name: string;
  password: string;
  mail: string;
  username: string;

  isLog: boolean = false;

  constructor(private userService: UserService, private authService: HyperAuthService) {
    this.isLog = authService.isLoggedIn();
  }

  ngOnInit() {
    if (this.authService.isLoggedIn() === true) {
        this.userService.getUsers()
            .subscribe(users => this.users = users);
    }
  }

  addUser() {
    const newUser = {
      first_name: this.first_name,
      last_name: this.last_name,
      password: this.password,
      mail: this.mail,
      username: this.username
    };
    this.userService.addUser(newUser)
      .subscribe(user => {
        this.users.push(user);
        this.userService.getUsers()
          .subscribe(users => this.users = users);
      });
  }

  deleteUser(id: any) {
    /*
 var users = this.users;
  	 this.userService.deleteUser(id)
		   .subscribe(data => {
		 		for (var i = 0; i < users.length; i++)
		 		{
		 			if (users[i]._id == id)
		 			{
		 				users.splice(i, 1);
		 			}
		 	}
		 });
*/
  }
}
