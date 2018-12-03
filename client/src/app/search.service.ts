import {Injectable} from '@angular/core';
import {TorrentService} from './torrent.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private torrentService: TorrentService) {
  }

  tri: string;
  genre: string;
  title: string;
  casting: string;
  minYear: number;
  maxYear: number;
  minRating: number;
  maxRating: number;
  views: object;
  type: string;


  //   search(title, tri, genre, page, async: boolean, api: string) {
  search(query, async: boolean, api: string) {
    const req = {};
    req['minYear'] = query.minYear !== undefined ? query.minYear : 1870;
    req['maxYear'] = query.maxYear !== undefined ? query.maxYear : 2018;
    req['minRating'] = query.minRating !== undefined ? query.minRating : 0;
    req['maxRating'] = query.maxRating !== undefined ? query.maxRating : 10;
    req['title'] = query.title;
    req['casting'] = query.casting;
    req['sort_by'] = 'pop';
    req['order_by'] = 'desc';
    req['page'] = query.page;

    if (query.type === 'Movie' || query.type === 'TV Show') {
      req['type'] = [query.type];
    } else {
      req['type'] = ['Movie', 'TV Show'];
    }
    if (query.tri === 'year_a' || query.tri === 'rating_a' || query.tri === 'runt_a' || query.tri === 'pop_a') {
      req['order_by'] = 'asc';
    }
    if (query.tri === 'year_a' || query.tri === 'year_d') {
      req['sort_by'] = 'year';
    } else if (query.tri === 'runt_a' || query.tri === 'runt_d') {
      req['sort_by'] = 'runtime';
    } else if (query.tri === 'rating_a' || query.tri === 'rating_d') {
      req['sort_by'] = 'rating';
    }
    if (query.genre !== 'all') {
      req['genre'] = query.genre;
    }
    this.torrentService.getTorrents(req)
      .subscribe(torrents => {
          let index = (req['page'] - 1) * 20;
          Object.values(this.views).forEach(function (view) {
            const imdbid = view['imdbid'];
            Object.values(torrents).forEach(function (torrent) {
              torrent['index'] = index;
              index++;
              if (imdbid === torrent['imdb_code']) {
                torrent['already_seen'] = true;
              }
            });
          });
          if (async) {
            if (this.torrentService.torrents) {
              const torrentService = this.torrentService;
              if (api === 'yts') {
                torrents.forEach(function (val) {
                  torrentService.torrents.push(val);
                });
              }
            }
          } else {
            if (api === 'yts') {
              this.torrentService.torrents = torrents;
            }
          }
          this.title = query.title;
          this.casting = query.casting;
          this.genre = query.genre;
          this.tri = query.tri;
          this.type = query.type;
          this.minYear = query.minYear;
          this.maxYear = query.maxYear;
          this.minRating = query.minRating;
          this.maxRating = query.maxRating;
          this.torrentService.torrentsIsShow = true;
          this.torrentService.loaded = Promise.resolve(true);
        }
      );
  }
}
