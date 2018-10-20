import { Injectable } from '@angular/core';
import { Comment } from "./comment";
import { HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) { }

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

  // postComment(data) {
  //   let headers = this.authSimpleService.getHeader_token('application/json');
  //   return this.http.post<any>('http://localhost:3000/api/movie_comment', data, {headers: headers});
  // }
}
