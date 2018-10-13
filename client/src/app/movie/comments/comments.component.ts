import { Component, OnInit } from '@angular/core';
import { Comment } from "../../comment";
import {CommentService} from "../../comment.service";
import { Input } from "@angular/core";

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

  loaded: Promise<boolean>;
  @Input() id_movie;

  get comments(): Comment[] {
    return this.commentService.comments;
  }

  constructor(private commentService: CommentService) { }

  ngOnInit() {
    this.commentService.getComments(this.id_movie)
      .subscribe(comments => {
        console.log(comments);
        this.commentService.comments = comments;
        this.loaded = Promise.resolve(true);
      });
  }
}
