import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import { ForumService } from '../../forum.service';
import { Input } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as $ from 'jquery';

@Component({
  selector: 'app-create-topic',
  templateUrl: './create-topic.component.html',
  styleUrls: ['./create-topic.component.css']
})
export class CreateTopicComponent implements OnInit {

  public options: Object = {
    placeholder: 'Send a message ...'
  }

  constructor(private forumService: ForumService, private router: Router, private route: ActivatedRoute) { }

  formGroup = new FormGroup({
    formTitle: new FormControl(),
    formContent: new FormControl()
  });

  ngOnInit() {
  }

  onSubmit() {
    const newTopic = {
      id_sectionForum: this.route.snapshot.params['id_sectionForum'],
      title: this.formGroup.value.formTitle,
      content: this.formGroup.value.formContent
    };
    this.forumService.postTopic(newTopic)
      .subscribe(topic => {
        this.router.navigate(['/forum', 'forum_content', this.route.snapshot.params['id_sectionForum']]);
      });
  }

}
