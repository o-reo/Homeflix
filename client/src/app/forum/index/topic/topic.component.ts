import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ForumService } from './../../../forum.service';
import { ForumSection } from './../../../models/forumSection';
import { Message } from './../../../models/message';
import { Topic } from './../../../models/topic';
import { User } from '../../../user';
import { UserService } from '../../../user.service';

@Component({
  selector: '[app-topic]',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.css']
})
export class TopicComponent implements OnInit {

  loaded: Promise<boolean>;

  @Input() title: string;
  @Input() content: string;
  @Input() id_topic: string;
  @Input() id_user: string;

  user: User;
  lastMessage_User: User;
  lastMessage: Message;

  constructor(private userService: UserService, private forumService: ForumService) { }

  ngOnInit() {
    this.userService.getUser(this.id_user)
      .subscribe(user => {
        this.user = user;
        this.forumService.getLastMessageInTopic(this.id_topic)
          .subscribe(message => {
            this.lastMessage = message;
            if (message) {
              this.userService.getUser(message.id_author)
                .subscribe(user2 => {
                  this.lastMessage_User = user2;
                  this.loaded = Promise.resolve(true);
                });
            } else { this.loaded = Promise.resolve(true); }
          });
      });
  }


}
