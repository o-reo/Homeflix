import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TorrentService} from '../../torrent.service';
import {UserService} from '../../user.service';
import {Torrent} from '../../torrent';
import {Input} from '@angular/core';
import * as bytes from 'bytes';
import {HyperAuthService} from '../../auth.service';

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

  constructor(private route: ActivatedRoute, private torrentService: TorrentService, private authService: HyperAuthService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.torrentService.getTorrent(this.route.snapshot.params['id_movie'])
      .subscribe(torrent => {
        this.lang = 'eng';
        this.userService.getUser('').subscribe(resp => {
          if (resp['language'] === 'french') {
            this.lang = 'fre';
          } else if (resp['language'] === 'spanish') {
            this.lang = 'spa';
          }
          this.torrent = torrent;
          this.torrentService.getSubtitles(this.lang, torrent.imdb_code, bytes(torrent.torrents[0].size))
            .subscribe(subtitles => {
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
      });
  }

}
