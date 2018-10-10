import { Injectable } from '@angular/core';
import { Comment } from "./comment";
import {ForumSection} from "./models/forumSection";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthsimpleService} from './authsimple.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient, private authSimpleService: AuthsimpleService) { }

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
    let headers = this.authSimpleService.getHeader_token('application/json');
    return this.http.post<any>('http://localhost:3000/api/movie_comment', data, {headers: headers});
  }
}
