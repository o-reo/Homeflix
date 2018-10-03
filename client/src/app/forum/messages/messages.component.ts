import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ForumService } from './../../forum.service';
import { ForumSection } from './../../models/forumSection';
import { Message } from './../../models/message';
import { Topic } from './../../models/topic';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  loaded: Promise<boolean>;
  messages: Message[];
  topic: Topic;
  p: Number = 1;

  constructor(private forumService: ForumService, private route: ActivatedRoute, public authService: AuthService) { }

  ngOnInit() {
    this.forumService.getMessagesInTopic(this.route.snapshot.params['id_topic'])
      .subscribe(messages => {
        this.messages = messages;
      });
    this.forumService.getTopicById(this.route.snapshot.params['id_topic'])
      .subscribe(topic => {
        this.topic = topic;
        this.loaded = Promise.resolve(true);
      });
  }
}
