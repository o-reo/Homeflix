import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthsimpleService} from "./authsimple.service";
import {Torrent} from "./torrent";
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

  constructor(private http: HttpClient, private authService: AuthsimpleService) {
    this.page = 1;
    this.torrentsIsShow = false;
    this.api = 'yts';
  }

  getTorrent(title, api) {
    return this.http.get<any>('http://localhost:3000/api/torrent/' + api + '/' + title);
  }

  getSubtitles(lang, imdbid) {
    return this.http.get<any>('http://localhost:3000/api/subtitles/' + imdbid + '?lang=' + lang);
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

  getMovieInfos(api, id) {
    if (api === 'yts') {
      return this.http.get<any>('https://yts.am/api/v2/movie_details.json?movie_id=' + id);
    } else if (api === 'nyaapantsu') {
      return this.http.get<any>('https://nyaa.pantsu.cat/api/search?id=' + id);
    }
  }

  convertNyaaPantsu(json) {
    const torrent: Torrent = ({
      title: json.name,
      year: json.date,
      rating: json.completed,
      runtime: 0,
      imdb_code: '',
      description_full: 'unvailable',
      synopsis: 'unvailable',
      language: 'unvailable',
      background_image: 'https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwjVspaJkPPdAhVF2xoKHXFJBiUQjRx6BAgBEAU&url=http%3A%2F%2Ffr.dota2.com%2F2018%2F06%2Fconcours-de-courts-metrages-dota-2-3%2F&psig=AOvVaw1Q9gpKSmTPvsgQCiatW_ZY&ust=1538960308264207',
      large_cover_image: 'https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwjVspaJkPPdAhVF2xoKHXFJBiUQjRx6BAgBEAU&url=http%3A%2F%2Ffr.dota2.com%2F2018%2F06%2Fconcours-de-courts-metrages-dota-2-3%2F&psig=AOvVaw1Q9gpKSmTPvsgQCiatW_ZY&ust=1538960308264207',
      medium_cover_image: 'https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwjVspaJkPPdAhVF2xoKHXFJBiUQjRx6BAgBEAU&url=http%3A%2F%2Ffr.dota2.com%2F2018%2F06%2Fconcours-de-courts-metrages-dota-2-3%2F&psig=AOvVaw1Q9gpKSmTPvsgQCiatW_ZY&ust=1538960308264207',
      summary: 'unvailable',
      id: json.id,
      hash: json.hash,
    });
    return torrent;
  }

  convertNyaaPantsu_Array(json): Torrent[] {
    let torrents = new Array();
    json.torrents.forEach(function (val) {
      const torrent: Torrent = ({
        imdb_code: '',
        title: val.name,
        year: val.date,
        rating: val.completed,
        runtime: 0,
        description_full: 'unvailable',
        synopsis: 'unvailable',
        language: 'unvailable',
        background_image: 'https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwjVspaJkPPdAhVF2xoKHXFJBiUQjRx6BAgBEAU&url=http%3A%2F%2Ffr.dota2.com%2F2018%2F06%2Fconcours-de-courts-metrages-dota-2-3%2F&psig=AOvVaw1Q9gpKSmTPvsgQCiatW_ZY&ust=1538960308264207',
        large_cover_image: 'https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwjVspaJkPPdAhVF2xoKHXFJBiUQjRx6BAgBEAU&url=http%3A%2F%2Ffr.dota2.com%2F2018%2F06%2Fconcours-de-courts-metrages-dota-2-3%2F&psig=AOvVaw1Q9gpKSmTPvsgQCiatW_ZY&ust=1538960308264207',
        medium_cover_image: 'https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwjVspaJkPPdAhVF2xoKHXFJBiUQjRx6BAgBEAU&url=http%3A%2F%2Ffr.dota2.com%2F2018%2F06%2Fconcours-de-courts-metrages-dota-2-3%2F&psig=AOvVaw1Q9gpKSmTPvsgQCiatW_ZY&ust=1538960308264207',
        summary: 'unvailable',
        id: val.id,
        hash: val.hash,
      });
      torrents.push(torrent);
    });
    return torrents;
  }

}
