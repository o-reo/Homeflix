import {Component, Inject, OnInit, HostListener} from '@angular/core';
import {Torrent} from '../torrent';
import {Input} from '@angular/core';
import {TorrentService} from '../torrent.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {DialogTemplateComponent} from "../auth/auth.component";

@Component({
  selector: 'app-torrent',
  templateUrl: './torrent.component.html',
  styleUrls: ['./torrent.component.css']
})
export class TorrentComponent implements OnInit {
  innerWidth: number;

  @Input() torrent: Torrent;

  loaded: Promise<boolean>;

  constructor(private torrentService: TorrentService, public dialog: MatDialog) {
  }

  ngOnInit() {
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

  SelectTorrent(event): void {
    let leftMargin = 0;
    let topMargin = 0;
    let el = event.srcElement;

    while (el) {
      if (el.attributes.class !== undefined && el.attributes.class.nodeValue === 'movie-card') {
        const scrollTop = $(window).scrollTop();
        const elementOffset = el.offsetTop;
        topMargin = (elementOffset - scrollTop) + 80;
        leftMargin = el.offsetLeft + 40;
      }
      el = el.parentElement;
    }

    const dialogRef = this.dialog.open(DialogSelectComponent, {
      position: {
        left: leftMargin + 'px',
        top: topMargin + 'px'
      },
      width: '235px',
      data: {torrent: this.torrent}
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data !== undefined) {
        console.log('hash: ', data.torrent.torrents[data.index]['hash']);
      }
    });
  }

  @HostListener('window:resize')
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }
}

@Component({
  selector: 'app-select-template',
  templateUrl: 'dialog-select.html',
})

export class DialogSelectComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogSelectComponent>, @Inject(MAT_DIALOG_DATA) public data) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
