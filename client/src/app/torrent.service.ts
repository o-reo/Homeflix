import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {AuthService} from "./auth.service";
import {Torrent} from "./torrent";
import { Movie } from './movie';

@Injectable({
  providedIn: 'root'
})
export class TorrentService {

  loaded: Promise<boolean>;
  torrents: Torrent[];
  page: number;
  torrentsIsShow: boolean;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.page = 1;
    this.torrentsIsShow = false;
  }

  getTorrent(title) {
    return this.http.get<any>('http://localhost:3000/api/torrent/' + title);
  }

  getImage(title) {
    return this.http.get<any>('https://api.themoviedb.org/3/search/movie?api_key=0da39945fce0b1135aa1b956f44eb3ec&query='
      + encodeURI(title));
  }

  startStreaming(movie: Movie) {
    return this.http.get<any>('http://localhost:3000/api/stream/' + movie.hash);
  }

  getMovie(api, id) {
    return this.http.get<Movie>('http://localhost:3000/api/movie/' + api + '/' + id);
  }

}
