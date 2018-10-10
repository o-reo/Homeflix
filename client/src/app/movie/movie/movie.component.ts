import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TorrentService } from "../../torrent.service";
import { Movie} from "../../movie";
import { Torrent } from "../../torrent";
import {promise} from "selenium-webdriver";

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {

  videoloaded: Promise<boolean>;
  loaded: Promise<boolean>;
  movie: Movie;
  torrent: Torrent;
  path: String;
  link: String;
  textLoad: String = 'Veuillez patienter ...';
  /*= 'http://localhost:3000/streaming/Harry_Potter_and_the_Goblet_of_Fire_2005.mkv';*/

  constructor(private route: ActivatedRoute, private torrentService: TorrentService) { }

  ngOnInit() {
    this.torrentService.getMovie(this.torrentService.api, this.route.snapshot.params['id_movie'])
      .subscribe(movie => {
        console.log(JSON.stringify(movie));
          this.movie = movie;
          this.torrentService.getMovieInfos(this.torrentService.api, movie.id_api)
            .subscribe(torrent => {
              console.log(torrent);
              if (this.torrentService.api === 'yts') {
                this.torrent = torrent.data.movie;
              } else if (this.torrentService.api === 'nyaapantsu') {
                this.torrent = this.torrentService.convertNyaaPantsu(torrent.torrents[0]);
              }
              this.loaded = Promise.resolve(true);
          });
          this.torrentService.startStreaming(movie)
            .subscribe(data => {
              this.path = data.path;
              this.link = 'http://localhost:3000/streaming/' + data.path;
              console.log(data.path);
              this.videoloaded = Promise.resolve(true);
              this.textLoad = '';
              //this.loaded = Promise.resolve(true);
              //setTimeout(function() { this.loaded = Promise.resolve(true); console.log('test');  }, 50);
            });
      });
  }

}
