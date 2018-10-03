import { Injectable } from '@angular/core';
import {TorrentService} from "./torrent.service";

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private torrentService: TorrentService) { }

  tri: string;
  title: string;

  search(title, tri, page) {
    let query = title;
    if (title === '*') {
      query = '*';
      switch (tri) {
        case 'year_a':
          query += '&sort_by=year&order_by=asc';
          break;
        case 'year_d':
          query += '&sort_by=year&order_by=desc';
          break;
        case 'pop_a':
          query += '&sort_by=rating&order_by=asc';
          break;
        case 'pop_d':
          query += '&sort_by=rating&order_by=desc';
          break;
        case 'runt_a':
          query += '&sort_by=runtime&order_by=asc';
          break;
        case 'runt_d':
          query += '&sort_by=runtime&order_by=desc';
          break;
      }
    }
    query += '&page=' + page;
    this.torrentService.getTorrent(encodeURI(query))
      .subscribe(torrents => {
        // const js = JSON.parse(torrents);
        // console.log(js);
        // this.text = torrents;
        this.torrentService.torrents = JSON.parse(torrents).data.movies;
        if (title !== '*') {
          switch (tri) {
            case 'year_a':
              this.triByDate_a();
              break;
            case 'year_d':
              this.triByDate_d();
              break;
            case 'pop_a':
              this.triByPopularity_a();
              break;
            case 'pop_d':
              this.triByPopularity_d();
              break;
            case 'runt_a':
              this.triByRunTime_a();
              break;
            case 'runt_d':
              this.triByRunTime_d();
              break;
          }
        }
        this.torrentService.torrentsIsShow = true;
        this.torrentService.loaded = Promise.resolve(true);
        // console.log(JSON.parse(torrents).movies);*/
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
