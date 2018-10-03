import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ForumSection } from './models/forumSection';
import { Message } from './models/message';
import { Topic } from './models/topic';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  getForumSections() {
    return this.http.get<ForumSection[]>('http://localhost:3000/api/forum/section_forums');
  }

  getTopicsInForumSection(id_sectionForum) {
    return this.http.get<Topic[]>('http://localhost:3000/api/forum/topics/' + id_sectionForum);
  }

  getTopicById(id_topic) {
    return this.http.get<Topic>('http://localhost:3000/api/forum/topic/' + id_topic);
  }

  getMessage(id_message) {
    return this.http.get<Message>('http://localhost:3000/api/forum/message/' + id_message);
  }

  getMessagesInTopic(id_topic) {
    return this.http.get<Message[]>('http://localhost:3000/api/forum/messages/' + id_topic);
  }

  getLastMessageInForum(id_forum) {
    return this.http.get<Message>('http://localhost:3000/api/forum/message/lastinforum/' + id_forum);
  }

  getLastMessageInTopic(id_topic) {
    return this.http.get<Message>('http://localhost:3000/api/forum/message/lastintopic/' + id_topic);
  }

  postMessage(data) {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic '
      + btoa(localStorage.getItem('username') + ':' + localStorage.getItem('passwd')));
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post<any>('http://localhost:3000/api/forum/message', data, {headers: headers});
  }

  editMessage(id, data) {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic '
      + btoa(localStorage.getItem('username') + ':' + localStorage.getItem('passwd')));
    headers = headers.append('Content-Type', 'application/json');
    return this.http.put<any>('http://localhost:3000/api/forum/message/' + id, data, {headers: headers});
  }

  postTopic(data) {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic '
      + btoa(localStorage.getItem('username') + ':' + localStorage.getItem('passwd')));
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post<any>('http://localhost:3000/api/forum/topic', data, {headers: headers});
  }
}
