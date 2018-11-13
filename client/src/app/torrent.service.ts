import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HyperAuthService} from './auth.service';
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

  constructor(private http: HttpClient, private authService: HyperAuthService) {
    this.page = 1;
    this.torrentsIsShow = false;
    this.api = 'yts';
  }

  getTorrents(query) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    return this.http.get<any>('http://localhost:3000/torrents' + query, {headers: headers});
  }

  getTorrent(id) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    return this.http.get<any>('http://localhost:3000/torrent/' + id, {headers: headers});
  }

  getSubtitles(lang, imdbid, filesize) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    return this.http.get<any>('http://localhost:3000/subtitles',
      {headers: headers, params: {imdbid: imdbid, lang: lang, filesize: filesize}});
  }

  getImage(title) {
    return this.http.get<any>('https://api.themoviedb.org/3/search/movie',
      {params: {api_key: '0da39945fce0b1135aa1b956f44eb3ec', query: encodeURI(title)}});
  }

  startStreaming(movie) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    return this.http.get<any>('http://localhost:3000/torrent/stream/' + movie.torrents[0].hash,
      {headers: headers, params: {imdbid: movie.imdb_code}});
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
