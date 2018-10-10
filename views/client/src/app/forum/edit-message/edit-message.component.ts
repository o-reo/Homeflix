import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import { ForumService } from '../../forum.service';
import { Input } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Message} from '../../models/message';
import {promise} from "selenium-webdriver";
import * as $ from 'jquery';

@Component({
  selector: 'app-edit-message',
  templateUrl: './edit-message.component.html',
  styleUrls: ['./edit-message.component.css']
})
export class EditMessageComponent implements OnInit {

  message: Message;
  loaded: Promise<boolean>;

  public options: Object = {
    placeholder: 'Send a message ...',
    height: 400
  }

  constructor(private forumService: ForumService, private router: Router,  private route: ActivatedRoute) { }
  formGroup = new FormGroup({
    form1: new FormControl()
  });

  ngOnInit() {
    this.forumService.getMessage(this.route.snapshot.params['id_message'])
      .subscribe(message => {
        this.message = message;
        this.formGroup.controls['form1'].setValue(message.content);
        this.loaded = Promise.resolve(true);
      });
  }

  onSubmit() {
    const newMessage = {
      content: this.formGroup.value.form1
    };
    this.forumService.editMessage(this.route.snapshot.params['id_message'], newMessage)
      .subscribe(msg => {
        this.router.navigate(['forum', 'messages', this.message.id_topic]);
      });
  }

}
