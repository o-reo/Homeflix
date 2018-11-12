import {Injectable} from '@angular/core';
import {Comment} from './comment';
import {HttpClient} from '@angular/common/http';
import {HyperAuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient, private authservice: HyperAuthService) {
  }

  comments: Comment[];

  getAllComments() {
    return this.http.get<Comment[]>('http://localhost:3000/comments');
  }

  getComments(id_movie) {
    return this.http.get<Comment[]>('http://localhost:3000/comments/' + id_movie);
  }

  getComment(id_comment) {
    return this.http.get<Comment>('http://localhost:3000/comment/' + id_comment);
  }

  postComment(data) {
    const headers = {authorization: 'Bearer ' + this.authservice.getToken()};
    headers['Content-Type'] = 'application/json';
    return this.http.post<any>('http://localhost:3000/comment', data, {headers: headers});
  }
}
