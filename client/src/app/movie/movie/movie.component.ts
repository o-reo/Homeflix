import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TorrentService} from '../../torrent.service';
import {UserService} from '../../user.service';
import {Torrent} from '../../torrent';
import {Input} from '@angular/core';
import * as bytes from 'bytes';
import {HyperAuthService} from '../../auth.service';
import {Observable} from 'rxjs';
import 'rxjs/add/observable/interval';


@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css'],
})
export class MovieComponent implements OnInit {
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
  torrent_id: number;

  constructor(private route: ActivatedRoute, private torrentService: TorrentService, private authService: HyperAuthService,
              private userService: UserService, private router: Router) {
  }

  ngOnInit() {
    // Catch torrent identifier if available
    this.route.queryParams.subscribe(params => {
      this.torrent_id = 0;
      if (params['torrent']) {
        this.torrent_id = params['torrent'];
      }
    });
    this.subtitle_default = false;
    this.torrentService.getTorrent(this.route.snapshot.params['id_movie'])
      .subscribe(torrent => {
        this.torrent = torrent;
        this.lang = 'eng';
        this.userService.getUser('').subscribe(resp => {
          if (resp['language'] === 'french') {
            this.lang = 'fre';
          } else if (resp['language'] === 'spanish') {
            this.lang = 'spa';
          }
          if (this.lang !== 'eng') {
            this.torrentService.getSubtitles('eng', torrent.imdb_code, bytes(torrent.torrents[this.torrent_id].size))
              .subscribe(subtitles => {
                this.subtitle_defined_en = subtitles.path;
                this.subtitle_path_en = './../../../src/assets/' + subtitles.path;
              });
          }
          this.torrentService.getSubtitles(this.lang, torrent.imdb_code, bytes(torrent.torrents[this.torrent_id].size))
            .subscribe(subtitles => {
              this.subtitle_defined_lang = subtitles.path;
              this.subtitle_path_lang = './../../../src/assets/' + subtitles.path;
              if (torrent.language && torrent.language.toLowerCase() !== resp['language']) {
                this.subtitle_default = true;
              }
              this.loaded = Promise.resolve(true);
              this.liveStreaming(this.torrent);
              this.torrentService.startStreaming(this.torrent, this.torrent_id)
                .subscribe(data => {
                  this.path = data.path;
                  this.link = '/streams' + data.path;
                  this.videoloaded = Promise.resolve(true);
                });
            });
        });
      });
  }

  liveStreaming(movie) {
    const living = Observable.interval(10000)
      .subscribe(() => {
        this.torrentService.liveStreaming(movie, this.torrent_id)
          .subscribe();
      });
    const route_evt = this.router.events.subscribe(() => {
      route_evt.unsubscribe();
      living.unsubscribe();
    });
  }
}
