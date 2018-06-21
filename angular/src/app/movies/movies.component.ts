import { Component, OnInit } from '@angular/core';
import {Movie} from "../movie";

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit {
  movies : any;
  selectedMovie: Movie;
  name: string;
  constructor() { }

  ngOnInit() {

  }
  onSelect(movie: Movie, ): void {
    this.selectedMovie = movie;
  }

}
