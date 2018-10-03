import { Injectable } from '@angular/core';
import { Comment } from "./comment";
import {ForumSection} from "./models/forumSection";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) { }

  comments: Comment[];

  getAllComments() {
    return this.http.get<Comment[]>('http://localhost:3000/api/movie_comments');
  }

  getComments(id_movie) {
    return this.http.get<Comment[]>('http://localhost:3000/api/movie_comments/' + id_movie);
  }

  getComment(id_comment) {
    return this.http.get<Comment>('http://localhost:3000/api/movie_comment/' + id_comment);
  }

  postComment(data) {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic '
      + btoa(localStorage.getItem('mail') + ':' + localStorage.getItem('passwd')));
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post<any>('http://localhost:3000/api/movie_comment', data, {headers: headers});
  }
}
