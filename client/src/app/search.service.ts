import {Injectable} from '@angular/core';
import {TorrentService} from "./torrent.service";
import {forEach} from "@angular/router/src/utils/collection";

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private torrentService: TorrentService) {
  }

  tri: string;
  genre: string;
  title: string;

  search(title, tri, genre, page, async: boolean, api: string) {
    /*
    let query = '?title=' + title;
    let sort = '';
    let order = '';
    let year = '';
    let rating = '';
    let runtime = '';
    let asc = '';
    let desc = '';

    title = title !== null ? title : '*';
    query = '?title=' + title;
    if (api === 'yts') {
      sort = 'sort_by';
      order = 'order_by';
      year = 'year';
      rating = 'rating';
      runtime = 'runtime';
      asc = 'asc';
      desc = 'desc';

    } else if (api === 'nyaapantsu') {
      sort = 'sort';
      order = 'order';
      year = '2';
      rating = '6';
      runtime = '1';
      asc = 'true';
      desc = 'false';
    }
    query += '&';
    switch (tri) {
      case 'year_a':
        query += sort + '=' + year + '&' + order + '=' + asc;
        break;
      case 'year_d':
        query += sort + '=' + year + '&' + order + '=' + desc;
        break;
      case 'pop_a':
        query += sort + '=' + rating + '&' + order + '=' + asc;
        break;
      case 'pop_d':
        query += sort + '=' + rating + '&' + order + '=' + desc;
        break;
      case 'runt_a':
        query += sort + '=' + runtime + '&' + order + '=' + asc;
        break;
      case 'runt_d':
        query += sort + '=' + runtime + '&' + order + '=' + desc;
        break;
    }
    if (genre !== 'all') {
      query += '&genre=' + genre;
    }
    if (tri || (genre || genre !== 'all')) {
      query += '&';
    } else {
      query += '?';
    }
    query += 'page=' + page;
    console.log('QUERY', query);
*/
    let req = {};
    req['title'] = title !== null ? title : '*';
    req['sort_by'] = 'rating';
    req['order_by'] = 'desc';
    req['page'] = page;
    if (tri === 'year_a' || tri === 'pop_a' || tri === 'runt_a') {
      req['order_by'] = 'asc';
    }
    if (tri === 'year_a' || tri === 'year_d') {
      req['sort_by'] = 'year';
    }
    else if (tri === 'runt_a' || tri === 'runt_d') {
      req['sort_by'] = 'runtime';
    }
    if (genre !== 'all') {
      req['genre'] = genre;
    }
    console.log(req);
    //this.torrentService.getTorrents(encodeURI(query))
    this.torrentService.getTorrents(req)
      .subscribe(torrents => {
        //console.log(torrents);
        if (async) {
          if (this.torrentService.torrents) {
            const torrentService = this.torrentService;
            if (api === 'yts') {
              torrents.forEach(function (val) {
                torrentService.torrents.push(val);
              });
            }
          } else {
            if (api === 'yts') {
              this.torrentService.torrents = JSON.parse(torrents);
            }
          }
        } else {
          if (api === 'yts') {
            //console.log('torrents', torrents);
            this.torrentService.torrents = torrents;
          }
        }
        this.title = title;
        this.genre = genre;
        this.tri = tri;
        this.torrentService.torrentsIsShow = true;
        this.torrentService.loaded = Promise.resolve(true);
      });
  }


  triByDate_a() {
    this.torrentService.torrents.sort(function (a, b) {
      return a.year - b.year;
    });
  }

  triByDate_d() {
    this.torrentService.torrents.sort(function (a, b) {
      return b.year - a.year;
    });
  }

  triByPopularity_a() {
    this.torrentService.torrents.sort(function (a, b) {
      return a.rating - b.rating;
    });
  }

  triByPopularity_d() {
    this.torrentService.torrents.sort(function (a, b) {
      return b.rating - a.rating;
    });
  }

  triByRunTime_a() {
    this.torrentService.torrents.sort(function (a, b) {
      return a.runtime - b.runtime;
    });
  }

  triByRunTime_d() {
    this.torrentService.torrents.sort(function (a, b) {
      return b.runtime - a.runtime;
    });
  }
}
