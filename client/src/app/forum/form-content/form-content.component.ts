import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import { ForumService } from '../../forum.service';
import { Input } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';

@Component({
  selector: 'app-form-content',
  templateUrl: './form-content.component.html',
  styleUrls: ['./form-content.component.css']
})
export class FormContentComponent implements OnInit {

  @Input() id_topic: string;

  public options: Object = {
    placeholder: 'Send a message ...'
  }

  constructor(private forumService: ForumService, private router: Router) { }
  formGroup = new FormGroup({
    form1: new FormControl()
  });

  ngOnInit() {
  }

  onSubmit() {
    const newMessage = {
      id_topic: this.id_topic,
      content: this.formGroup.value.form1
    };
    this.forumService.postMessage(newMessage)
      .subscribe(msg => {
          location.reload();
      });
  }
}
