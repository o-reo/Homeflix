import {Injectable} from '@angular/core';
import {Comment} from './comment';
import {HttpClient} from '@angular/common/http';
import {HyperAuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient, private authService: HyperAuthService) {
  }

  comments: Comment[];

  getAllComments() {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    headers['Content-Type'] = 'application/json';
    return this.http.get<Comment[]>('http://localhost:3000/comments', {headers: headers});
  }

  getComments(id_movie) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    headers['Content-Type'] = 'application/json';
    return this.http.get<Comment[]>('http://localhost:3000/comments/' + id_movie, {headers: headers});
  }

  getComment(id_comment) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    headers['Content-Type'] = 'application/json';
    return this.http.get<Comment>('http://localhost:3000/comment/' + id_comment, {headers: headers});
  }

  postComment(data) {
    const headers = {authorization: 'Bearer ' + this.authService.getToken()};
    headers['Content-Type'] = 'application/json';
    return this.http.post<any>('http://localhost:3000/comment', data, {headers: headers});
  }
}
