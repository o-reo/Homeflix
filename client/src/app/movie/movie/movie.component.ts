import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TorrentService } from "../../torrent.service";
import { Movie} from "../../movie";

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {

  loaded = new Promise((resolve, reject) => {
    setTimeout(
      () => {
        this.textLoad = '';
        resolve(true);
      }, 10000
    );
  });

  movie: Movie;
  path: String;
  link: String;
  textLoad: String = 'Veuillez patienter ...';
  /*= 'http://localhost:3000/streaming/Harry_Potter_and_the_Goblet_of_Fire_2005.mkv';*/

  constructor(private route: ActivatedRoute, private torrentService: TorrentService) { }

  ngOnInit() {
    this.torrentService.getMovie('yts', this.route.snapshot.params['id_movie'])
      .subscribe(movie => {
        console.log(JSON.stringify(movie));
          this.movie = movie;
          this.torrentService.startStreaming(movie)
            .subscribe(data => {
              this.path = data.path;
              this.link = 'http://localhost:3000/streaming/' + data.path;
              console.log(data.path);
              //this.loaded = Promise.resolve(true);
              //setTimeout(function() { this.loaded = Promise.resolve(true); console.log('test');  }, 50);
            });
      });
  }

}
