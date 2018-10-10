import { Injectable } from '@angular/core';
import {TorrentService} from "./torrent.service";
import {forEach} from "@angular/router/src/utils/collection";

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private torrentService: TorrentService) { }

  tri: string;
  genre: string;
  title: string;

  search(title, tri, genre, page, async: boolean, api: string) {
    let query = title;
    let sort = '';
    let order = '';
    let year = '';
    let rating = '';
    let runtime = '';
    let asc = '';
    let desc = '';
    if (api === 'yts') {
      sort = 'sort_by'; order = 'order_by';
      year = 'year'; rating = 'rating';
      runtime = 'runtime'; asc = 'asc';
      desc = 'desc';
      if (genre !== 'all') {
        query += '&genre=' + genre;
      }
    } else if (api === 'nyaapantsu') {
      sort = 'sort'; order = 'order';
      year = '2'; rating = '6';
      runtime = '1'; asc = 'true';
      desc = 'false';
    }
      switch (tri) {
        case 'year_a':
          query += '&' + sort + '=' + year + '&' + order + '=' + asc;
          break;
        case 'year_d':
          query += '&' + sort + '=' + year + '&' + order + '=' + desc;
          break;
        case 'pop_a':
          query += '&' + sort + '=' + rating + '&' + order + '=' + asc;
          break;
        case 'pop_d':
          query += '&' + sort + '=' + rating + '&' + order + '=' + desc;
          break;
        case 'runt_a':
          query += '&' + sort + '=' + runtime + '&' + order + '=' + asc;
          break;
        case 'runt_d':
          query += '&' + sort + '=' + runtime + '&' + order + '=' + desc;
          break;
      }
    query += '&page=' + page;
    this.torrentService.getTorrent(encodeURI(query), api)
      .subscribe(torrents => {
        console.log(torrents);
        if (async) {
          if (this.torrentService.torrents) {
            const torrentService = this.torrentService;
            if (api === 'yts' ) {
              JSON.parse(torrents).data.movies.forEach(function (val) {
                torrentService.torrents.push(val);
              });
            } else if (api === 'nyaapantsu') {
              this.torrentService.convertNyaaPantsu_Array(JSON.parse(torrents)).forEach(function (val) {
                torrentService.torrents.push(val);
              });
            }
          } else {
            if (api === 'yts') {
              this.torrentService.torrents = JSON.parse(torrents).data.movies;
            } else if (api === 'nyaapantsu') {
              this.torrentService.torrents = this.torrentService.convertNyaaPantsu_Array(JSON.parse(torrents));
            }
          }
        } else {
          if (api === 'yts') {
            this.torrentService.torrents = JSON.parse(torrents).data.movies;
          } else if (api === 'nyaapantsu') {
            console.log(torrents);
            this.torrentService.torrents = this.torrentService.convertNyaaPantsu_Array(JSON.parse(torrents));
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
    this.torrentService.torrents.sort(function(a, b) {
        return a.year - b.year;
    });
  }

  triByDate_d() {
    this.torrentService.torrents.sort(function(a, b) {
      return b.year - a.year;
    });
  }

  triByPopularity_a() {
    this.torrentService.torrents.sort(function(a, b) {
      return a.rating - b.rating;
    });
  }

  triByPopularity_d() {
    this.torrentService.torrents.sort(function(a, b) {
      return b.rating - a.rating;
    });
  }

  triByRunTime_a() {
    this.torrentService.torrents.sort(function(a, b) {
      return a.runtime - b.runtime;
    });
  }

  triByRunTime_d() {
    this.torrentService.torrents.sort(function(a, b) {
      return b.runtime - a.runtime;
    });
  }
}
