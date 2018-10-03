import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ForumService } from './../../../forum.service';
import { ForumSection } from './../../../models/forumSection';
import { Message } from './../../../models/message';
import { Topic } from './../../../models/topic';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.css']
})
export class TopicsComponent implements OnInit {
  loaded: Promise<boolean>;
  topics: Topic[];

  get id_sectionForum(): string {
    return this.route.snapshot.params['id_sectionForum'];
  }

  constructor(private forumService: ForumService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.forumService.getTopicsInForumSection(this.route.snapshot.params['id_sectionForum'])
      .subscribe(topics => {
        this.topics = topics;
        this.loaded = Promise.resolve(true);
      });
  }

}
