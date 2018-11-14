import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TorrentService} from '../../torrent.service';
import {UserService} from '../../user.service';
import {Torrent} from '../../torrent';
import {Input} from '@angular/core';
import * as bytes from 'bytes';
// import * as $ from 'jquery';
import {HyperAuthService} from '../../auth.service';
// import {Page} from 'ngx-pagination/dist/pagination-controls.directive';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit, OnDestroy {

  videoloaded: Promise<boolean>;
  loaded: Promise<boolean>;
  torrent: Torrent;
  path: String;
  link: String;
  lang: String;
  subtitle_default: boolean;
  subtitle_defined_en: boolean;
  subtitle_defined_lang: boolean;
  @Input() subtitle_path_en;
  @Input() subtitle_path_lang;

  constructor(private route: ActivatedRoute, private torrentService: TorrentService, private authService: HyperAuthService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.subtitle_default = false;
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
          if (this.lang !== 'eng') {
            this.torrentService.getSubtitles('eng', torrent.imdb_code, bytes(torrent.torrents[0].size))
              .subscribe(subtitles => {
                this.subtitle_defined_en = subtitles.path;
                this.subtitle_path_en = './../../../src/assets/' + subtitles.path;
              });
          }
          this.torrentService.getSubtitles(this.lang, torrent.imdb_code, bytes(torrent.torrents[0].size))
            .subscribe(subtitles => {
              this.subtitle_defined_lang = subtitles.path;
              this.subtitle_path_lang = './../../../src/assets/' + subtitles.path;
              if (torrent.language && torrent.language.toLowerCase() !== resp['language']) {
                this.subtitle_default = true;
              }
              this.loaded = Promise.resolve(true);
              this.torrentService.startStreaming(this.torrent)
                .subscribe(data => {
                  this.path = data.path;
                  this.link = '/streams' + data.path;
                  this.videoloaded = Promise.resolve(true);
                });
            });
        });
      });
    // this.page.on('navigatingTo', (data) => {
    //   console.log('navigating to');
    // });
    // this.page.on('navigatingFrom', (data) => {
    //   console.log('navigating From');
    // });
  }

  ngOnDestroy() {
    // this.torrentService.stopStreaming(this.torrent)
    //   .subscribe();
  }
}
