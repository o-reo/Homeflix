import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HyperAuthService} from './auth.service';
import {Torrent} from './torrent';

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

  startStreaming(movie) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    return this.http.post<any>('http://localhost:3000/torrent/stream/' + movie.torrents[0].hash, {imdbid: movie.imdb_code},
      {headers: headers});
  }

  liveStreaming(movie) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    return this.http.put<any>('http://localhost:3000/torrent/stream/' + movie.torrents[0].hash, {imdbid: movie.imdb_code},
      {headers: headers});
  }
}
