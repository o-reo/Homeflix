import { Component, OnInit } from '@angular/core';
import { Input } from "@angular/core";
import { Comment } from "../../comment";
import { UserService } from "../../user.service";

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
        if (!this.user.photo.includes('http://') && !this.user.photo.includes('https://')) {
          this.user.photo = `http://${window.location.hostname}:3000/${this.user.photo}`;
        }
        this.loaded = Promise.resolve(true);
      });
  }
}
