import { Component, OnInit } from '@angular/core';
import { Genre } from '../genre';
import { GENRES } from '../genres';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-genres',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.css']
})
export class GenresComponent implements OnInit {

  genres : any;
  selectedGenre: Genre;
  name: string;


  constructor(private http: HttpClient) {
     http.get('http://localhost:4000/movies/genres')
      .subscribe(
        data => this.genres = data['data'],
        err => console.log(`Error: ${err}`),
        () => console.log(`Completed request`)
      )
  }

  ngOnInit() {
  }

  onSelect(genre: Genre, http: HttpClient): void {
    this.selectedGenre = genre;
    http.post('https://localhost:4000/movies/get_movies', {'genre':genre.id})
      .subscribe()
  }
}
