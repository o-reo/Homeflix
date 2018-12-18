import {Component, OnInit} from '@angular/core';
import {Input} from '@angular/core';
import {CommentService} from '../../comment.service';
import 'froala-editor/js/froala_editor.pkgd.min.js';
import {MatSnackBar} from '@angular/material';

declare var $: any;

@Component({
  selector: 'app-post-comment',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.css']
})
export class PostCommentComponent implements OnInit {

  @Input() id_movie: string;

  constructor(private commentService: CommentService, public snackBar: MatSnackBar) {
  }

  public editorContent = '';

  public options: Object = {
    placeholderText: '...',
    theme: 'dark',
    quickInsertTags: [],
    toolbarInline: true,
    charCounterCount: false,
    toolbarButtons: ['bold', 'italic', 'underline', 'color', 'clearFormatting'],
    toolbarButtonsXS: ['bold', 'italic', 'underline', 'color', 'clearFormatting'],
    toolbarButtonsSM: ['bold', 'italic', 'underline', 'color', 'clearFormatting'],
    toolbarButtonsMD: ['bold', 'italic', 'underline', 'color', 'clearFormatting'],
    charCounterMax: 80,
    // enter: $.FroalaEditor.ENTER_DIV
  };

  ngOnInit() {
  }

  SubmitEditor() {
    if (this.editorContent.length > 80 || this.editorContent.split(/<p>/).length > 3) {
      this.snackBar.open('Your message is too long', 'X', {
        duration: 3000,
      });
    }
    else if (this.editorContent) {
      const newComment = {
        id_movie: this.id_movie,
        content: this.editorContent
      };
      this.commentService.postComment(newComment)
        .subscribe(msg => {
          this.commentService.comments.push(msg);
          this.editorContent = '';
        });
    }
  }
}
