import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TorrentService} from '../../torrent.service';
import {Torrent} from '../../torrent';
import { Input } from '@angular/core';
import * as bytes from 'bytes';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {

  videoloaded: Promise<boolean>;
  loaded: Promise<boolean>;
  torrent: Torrent;
  path: String;
  link: String;
  textLoad: String = 'Please Wait...';
  lang: String;
  @Input() subtitle_path_en;

  constructor(private route: ActivatedRoute, private torrentService: TorrentService, private authService: AuthService) {
  }

  ngOnInit() {
    this.torrentService.getTorrent(this.route.snapshot.params['id_movie'])
      .subscribe(torrent => {
        this.torrent = torrent;
        this.lang = 'eng';
        // if (this.authService.myUser.lang && this.authService.myUser.lang !== undefined) {
        //   this.lang = this.authService.myUser.lang;
        // }
        this.torrentService.getSubtitles(this.lang, torrent.imdb_code, bytes(torrent.torrents[0].size))
          .subscribe(subtitles => {
            console.log('sub', subtitles);
            this.subtitle_path_en = './../../../src/assets/' + subtitles.path;
            this.loaded = Promise.resolve(true);
            this.torrentService.startStreaming(this.torrent)
              .subscribe(data => {
                this.path = data.path;
                this.link = 'http://localhost:3000/torrent/streaming/' + data.path;
                console.log(data.path);
                this.videoloaded = Promise.resolve(true);
                this.textLoad = '';
              });
          });
      });
  }

}
