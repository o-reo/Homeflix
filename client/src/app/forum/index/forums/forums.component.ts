import { Component, OnInit } from '@angular/core';
import { ForumService } from './../../../forum.service';
import { ForumSection } from './../../../models/forumSection';
import { Message } from './../../../models/message';
import { Topic } from './../../../models/topic';

@Component({
  selector: 'app-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.css']
})
export class ForumsComponent implements OnInit {

  loaded: Promise<boolean>;
  forumSections: ForumSection[];

  constructor(private forumService: ForumService) {}

  ngOnInit() {
    this.forumService.getForumSections()
      .subscribe( forums => {
        this.forumSections = forums;
        this.loaded = Promise.resolve(true);
      });
  }
}
