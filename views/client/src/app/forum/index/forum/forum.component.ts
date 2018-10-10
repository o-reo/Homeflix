import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Message } from '../../../models/message';
import { Topic } from '../../../models/topic';
import { ForumService } from '../../../forum.service';
import { UserService } from '../../../user.service';
import { User } from '../../../user';

@Component({
  selector: '[app-forum]',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css'],
})
export class ForumComponent implements OnInit {

  @Input() title: string;
  @Input() description: string;
  @Input() id: string;

  message: Message;
  topic: Topic;
  user: User;
  loaded: Promise<boolean>;

  constructor(private forumService: ForumService, private userService: UserService) { }

  ngOnInit() {
    this.forumService.getLastMessageInForum(this.id)
      .subscribe(message => {
        this.message = message;
        if (message) {
          console.log(message.content);
          console.log(message.id_author);
          //this.loaded = Promise.resolve(true);
          this.userService.getUser(message.id_author)
            .subscribe(user => {
              this.user = user;
              this.forumService.getTopicById(message.id_topic)
                .subscribe(topic => {
                  this.topic = topic;
                  this.loaded = Promise.resolve(true);
                });
            });
        } else {
          this.loaded = Promise.resolve(true);
        }
      });
  }

}
