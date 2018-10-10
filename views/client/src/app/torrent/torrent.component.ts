import { Component, OnInit } from '@angular/core';
import {Torrent} from "../torrent";
import {Input} from "@angular/core";
import {TorrentService} from "../torrent.service";

@Component({
  selector: 'app-torrent',
  templateUrl: './torrent.component.html',
  styleUrls: ['./torrent.component.css']
})
export class TorrentComponent implements OnInit {

  @Input() torrent: Torrent;

  loaded: Promise<boolean>;

  constructor(private torrentService: TorrentService) { }

  ngOnInit() {
    /*this.torrentService.getImage(this.searchTitle)
      .subscribe(response => {
        console.log(JSON.stringify(response));
        if (response.results.length > 0) {
          this.torrent.img = 'https://image.tmdb.org/t/p/w500' + response.results[0].poster_path;
        }
        this.loaded = Promise.resolve(true);
      });*/
  }

  getBgStyle() {
    const bgStyle = {
      'background': 'url("' + this.torrent.medium_cover_image + '")',
      'padding': 0,
      'margin': 0,
      'height': '367px',
      'width': '100%',
      'display': 'block',
      'border-top-left-radius': '10px',
      'border-top-right-radius': '10px',
      'background-size': '100% 100%',
      'background-position': '100% 80%'
    };
    return bgStyle;
  }

}
