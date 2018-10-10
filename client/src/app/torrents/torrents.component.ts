import {Component, HostListener, OnInit} from '@angular/core';
import { TorrentService } from '../torrent.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Torrent} from "../torrent";
import {ActivatedRoute} from "@angular/router";
import {SearchService} from "../search.service";


@Component({
  selector: 'app-torrents',
  templateUrl: './torrents.component.html',
  styleUrls: ['./torrents.component.css']
})
export class TorrentsComponent implements OnInit {

  /*formGroupSearch = new FormGroup( {
    inputSearch: new FormControl()
  });*/

  text: String;
  nextActived: boolean;
  prevActived: boolean;
  get torrentsIsShow(): boolean {
    return this.torrentService.torrentsIsShow;
  }

  get loaded() {
    return this.torrentService.loaded;
  }

  get torrents(): Torrent[] {
    return this.torrentService.torrents;
  }

  constructor(private torrentService: TorrentService, private route: ActivatedRoute, private searchService: SearchService) { }

  ngOnInit() {
    /*if ('page' in this.route.snapshot.params) {
         this.torrentService.page = this.route.snapshot.params['page'];
    }*/
    this.searchService.search('*', 'pop_d', 'all', 1, false, 'yts');
    this.nextActived = true;
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.torrentService.page++;
      this.searchService.search(this.searchService.title, this.searchService.tri, this.searchService.genre, this.torrentService.page, true, this.torrentService.api);
     // document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
  }

  /* nextPage() {
    this.torrentService.page++;
    this.prevActived = true;
    this.searchService.search(this.searchService.title, this.searchService.tri, this.searchService.genre, this.torrentService.page, false);
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  prevPage() {
    if (this.torrentService.page > 1) {
      this.torrentService.page--;
      this.searchService.search(this.searchService.title, this.searchService.tri, this.searchService.genre, this.torrentService.page, false);
    }
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  } */

  /*onSubmitSearch() {
    this.torrentService.getTorrent(encodeURI(this.formGroupSearch.value.inputSearch))
      .subscribe(torrents => {
         //const js = JSON.parse(torrents);
         //console.log(js);
         //this.text = torrents;
        this.torrents = JSON.parse(torrents).data.movies;
         //console.log(JSON.parse(torrents).movies);
      });
  }*/

}
