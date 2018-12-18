import {Component, NgModule, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {TorrentService} from '../../torrent.service';
import {SearchService} from '../../search.service';
import {IonRangeSliderModule} from 'ng2-ion-range-slider';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})


@NgModule({
  imports: [IonRangeSliderModule]
})


export class SearchComponent implements OnInit {
  minYear: number;
  maxYear: number;
  minRating: number;
  maxRating: number;
  views: object;

  advancedSlider = {name: 'Advanced Slider'};

  formGroupSearch = new FormGroup({
    inputTri: new FormControl(),
    input_query: new FormControl(),
    inputCasting: new FormControl(),
    inputGenre: new FormControl(),
    inputType: new FormControl()
  });

  constructor(private torrentService: TorrentService, private searchService: SearchService) {
  }

  ngOnInit() {
      this.torrentService.page = 1;
  }

  getYears(slider, event) {
    slider.onFinish = event;
    this.minYear = slider.onFinish.from;
    this.maxYear = slider.onFinish.to;
  }


  getRating(slider, event) {
    slider.onFinish = event;
    this.minRating = slider.onFinish.from;
    this.maxRating = slider.onFinish.to;
  }

  onSubmitSearch() {
    const req = {
      title: this.formGroupSearch.value.input_query !== null ? this.formGroupSearch.value.input_query : '*',
      casting: this.formGroupSearch.value.inputCasting !== null ? this.formGroupSearch.value.inputCasting : '*',
      tri: this.formGroupSearch.value.inputTri !== null ? this.formGroupSearch.value.inputTri : 'pop_d',
      genre: this.formGroupSearch.value.inputGenre != null ? this.formGroupSearch.value.inputGenre : 'all',
      type: this.formGroupSearch.value.inputType != null ? this.formGroupSearch.value.inputType : 'both',
      page: 1,
      minYear: this.minYear,
      maxYear: this.maxYear,
      minRating: this.minRating,
      maxRating: this.maxRating
    };
    this.torrentService.page = 1;
    this.searchService.search(req, false, this.torrentService.api);
  }
}
