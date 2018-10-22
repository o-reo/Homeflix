import { Component, OnInit } from '@angular/core';
import { Input } from "@angular/core";
import { Comment } from "../../comment";
import { UserService } from "../../user.service";
import { User} from "../../user";

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

  loaded: Promise<boolean>;
  @Input() comment: Comment;
  user: any;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.getUser(this.comment.id_user)
      .subscribe(user => {
        this.user = user;
        this.loaded = Promise.resolve(true);
      });
  }

}
