import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import { Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommentService} from "../../comment.service";

@Component({
  selector: 'app-post-comment',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.css']
})
export class PostCommentComponent implements OnInit {


  formGroup = new FormGroup({
    form1: new FormControl()
  });
  @Input() id_movie: string;

  constructor(private commentService: CommentService) { }

  ngOnInit() {}

  onSubmit() {
    const newComment = {
      id_movie: this.id_movie,
      content: this.formGroup.value.form1
    };
    // this.commentService.postComment(newComment)
    //   .subscribe(msg => {
    //     this.commentService.comments.push(msg);
    //     /* location.reload(); */
    //   });
  }

}
