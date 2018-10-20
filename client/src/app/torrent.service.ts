import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Torrent} from './torrent';
import {Movie} from './movie';

@Injectable({
  providedIn: 'root'
})
export class TorrentService {

  loaded: Promise<boolean>;
  torrents: Torrent[];
  page: number;
  torrentsIsShow: boolean;
  api: string;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.page = 1;
    this.torrentsIsShow = false;
    this.api = 'yts';
  }

  getTorrents(query) {
    return this.http.get<any>('http://localhost:3000/torrents' + query);
  }

  getTorrent(id) {
    return this.http.get<any>('http://localhost:3000/movie/' + id);
  }

  getSubtitles(lang, imdbid, filesize) {
    return this.http.get<any>('http://localhost:3000/subtitles/?imdbid=' + imdbid + '&lang=' + lang + '&filesize=' + filesize);
  }

  getImage(title) {
    return this.http.get<any>('https://api.themoviedb.org/3/search/movie?api_key=0da39945fce0b1135aa1b956f44eb3ec&query='
      + encodeURI(title));
  }

  startStreaming(movie) {
    return this.http.get<any>('http://localhost:3000/torrent/stream/' + movie.torrents[0].hash);
  }

  /* getMovie(id) {
    return this.http.get<Movie>('http://localhost:3000/api/movie/' + id);
  } */

  /*getMovieInfos(api, id) {
    if (api === 'yts') {
      return this.http.get<any>('https://yts.am/api/v2/movie_details.json?movie_id=' + id);
    } else if (api === 'nyaapantsu') {
      return this.http.get<any>('https://nyaa.pantsu.cat/api/search?id=' + id);
    }
  }*/
}
