import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Input} from '@angular/core';
import {CommentService} from '../../comment.service';
import 'froala-editor/js/froala_editor.pkgd.min.js';

declare var $: any;

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

  constructor(private commentService: CommentService) {
  }

  public options: Object = {
    placeholderText: 'Write your comment here',
    theme: 'dark',
    quickInsertTags: [],
    toolbarInline: true,
    charCounterCount: false,
    toolbarButtons: ['bold', 'italic', 'underline', 'color', 'clearFormatting'],
    toolbarButtonsXS: ['bold', 'italic', 'underline', 'color', 'clearFormatting'],
    toolbarButtonsSM: ['bold', 'italic', 'underline', 'color', 'clearFormatting'],
    toolbarButtonsMD: ['bold', 'italic', 'underline', 'color', 'clearFormatting'],
  };

  ngOnInit() {
  }

  onSubmit() {
    if (this.formGroup.value.form1) {
      const newComment = {
        id_movie: this.id_movie,
        content: this.formGroup.value.form1
      };
      this.commentService.postComment(newComment)
        .subscribe(msg => {
          this.commentService.comments.push(msg);
          this.formGroup.reset();
        });
    }
  }
}
