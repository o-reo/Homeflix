import {Component, HostListener, OnInit} from '@angular/core';
import {TorrentService} from '../torrent.service';
import {Torrent} from '../torrent';
import {ActivatedRoute, Router} from '@angular/router';
import {SearchService} from '../search.service';
import {UserService} from '../user.service';
import {MalihuScrollbarService} from 'ngx-malihu-scrollbar';


@Component({
    selector: 'app-torrents',
    templateUrl: './torrents.component.html',
    styleUrls: ['./torrents.component.css']
})
export class TorrentsComponent implements OnInit {
    text: String;
    nextActived: boolean;

    get torrentsIsShow(): boolean {
        return this.torrentService.torrentsIsShow;
    }

    get loaded() {
        return this.torrentService.loaded;
    }

    get torrents(): Torrent[] {
        return this.torrentService.torrents;
    }

    constructor(private torrentService: TorrentService, 
                private userService: UserService,
                private route: ActivatedRoute,
                private searchService: SearchService, 
                private router: Router, 
                private mScrollbarService: MalihuScrollbarService) {
    }

    ngOnInit() {
        this.mScrollbarService.initScrollbar(".scrollable", { axis: 'y', theme: 'minimal' });
        this.torrentService.page = 1;
        let genre = 'all';
        if (this.router.url.includes('/watch/genre')) {
            genre = this.route.snapshot.params['genre'];
        }
        this.userService.getUser('').subscribe(resp => {
           // this.searchService.views = resp['views'];
            const query = {
                title: '*',
                casting: '*',
                tri: 'pop_d',
                genre: genre,
                page: 1
            };
            this.searchService.search(query, false);
            this.nextActived = true;
        });
    }

    @HostListener('window:scroll', [])
    onScroll(): void {
        if ((window.innerHeight + window.scrollY) + 1 >= document.body.offsetHeight) {
            this.torrentService.page++;
            const query = {
                title: this.searchService.title,
                casting: this.searchService.casting,
                tri: this.searchService.tri,
                genre: this.searchService.genre,
                minYear: this.searchService.minYear,
                maxYear: this.searchService.maxYear,
                minRating: this.searchService.minRating,
                maxRating: this.searchService.maxRating,
                page: this.torrentService.page,
                type: this.searchService.type
            };
            this.searchService.search(query, true);
        }
    }
}
