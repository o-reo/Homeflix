import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TorrentService} from '../../torrent.service';
import {UserService} from '../../user.service';
import {Torrent} from '../../torrent';
import {Input} from '@angular/core';
import * as bytes from 'bytes';
import {HyperAuthService} from '../../auth.service';
import {Observable} from 'rxjs';
import 'rxjs/add/observable/interval';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

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
  subtitle_defined_en: string;
  subtitle_defined_lang: string;
  @Input() subtitle_path_en;
  @Input() subtitle_path_lang;
  torrent_id: number;

  constructor(private route: ActivatedRoute, private torrentService: TorrentService, private authService: HyperAuthService,
              private userService: UserService, private router: Router, private dialog: MatDialog) {
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
        const subdata = {
          imdbid: torrent.imdb_code,
          filesize: bytes(torrent.torrents[this.torrent_id].size)
        };
        if (torrent.torrents[this.torrent_id].episode) {
          subdata['episode'] = torrent.torrents[this.torrent_id].episode;
          subdata['season'] = torrent.torrents[this.torrent_id].season;
        }
        this.userService.getUser('').subscribe(resp => {
          if (resp['language'] === 'french') {
            this.lang = 'fre';
          } else if (resp['language'] === 'spanish') {
            this.lang = 'spa';
          }
          subdata['lang'] = this.lang;
          if (this.lang !== 'eng') {
            this.torrentService.getSubtitles('eng', subdata)
              .subscribe(subtitles => {
                this.subtitle_defined_en = subtitles.path;
                this.subtitle_path_en = './../../../src/assets/' + subtitles.path;
              });
          }
          this.torrentService.getSubtitles(this.lang, subdata)
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
                  if (data.error) {
                    // Could not parse torrent file
                    this.openErrorDialog(data.msg);
                  } else {
                    this.path = data.path;
                    this.link = '/streams' + data.path;
                    this.videoloaded = Promise.resolve(true);
                  }
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

  openErrorDialog(msg): void {
    const dialogRef = this.dialog.open(ErrorDialogTemplateComponent, {
      width: '300px',
      data: {msg: msg, torrent: this.torrent}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(['/watch']);
    });
  }
}

@Component({
  selector: 'app-errordialog-template',
  templateUrl: 'errordialog-template.html',
})

export class ErrorDialogTemplateComponent {

  constructor(
    public dialogRef: MatDialogRef<ErrorDialogTemplateComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onGoBackClick(): void {
    this.dialogRef.close();
  }

}
