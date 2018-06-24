import { Component, OnInit } from '@angular/core';
import { Genre } from '../genre';
import { Movie } from '../movie';
import {HttpClient} from "@angular/common/http";

import {GenreService} from "./genres_api.service";

@Component({
  selector: 'app-genres',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.css']
})
export class GenresComponent implements OnInit {

  genres : any;
  selectedGenre: Genre;
  name: string;
  movies: any;
  selectedMovie: Movie;
  showtimes: any;
  no_movies: boolean;
  geolocationPosition: any
  movieUrl: string

  get_movies(genre): any {
    this.genres_api.get_movies(genre)
      .subscribe(
       data => this.movies = data['results'],
      err => console.log('Error', err),
        () => console.log(`Completed request`)
      )
  }

  get_showtimes(movie, location): any {
    let coords = {}
    if (location.coords){
      coords = location.coords
    } else {
      coords = {'latitude': 42.350490099999995, 'longitude': -71.0986401}
    }
    this.genres_api.get_showtimes(movie, coords)
      .subscribe(
        data => this.showtimes = this.genres_api.get_cinema_names(data['showtimes'], movie.title),
        err => console.log('Error', err),
        () => console.log(`Completed request`)
      )

  }



  constructor(private http: HttpClient, private genres_api: GenreService) {
     http.get('http://localhost:4000/movies/genres')
      .subscribe(
        data => this.genres = data['data'],
        err => console.log(`Error: ${err}`),
        () => console.log(`Completed request`)
      )
  }

  ngOnInit() {
    async function delay(ms: number) {
      await new Promise(resolve => setTimeout(()=>resolve(), 1000)).then(()=>console.log("fired"));
    }
    delay(300)
      .then(any => {
        if (window.navigator && window.navigator.geolocation) {
          window.navigator.geolocation.getCurrentPosition(
            position => {
              this.geolocationPosition = position,
                console.log(position)
            },
            error => {
              switch (error.code) {
                case 1:
                  console.log('Permission Denied');
                  break;
                case 2:
                  console.log('Position Unavailable');
                  break;
                case 3:
                  console.log('Timeout');
                  break;
              }
            }
          )}

      })

  }


  onSelect(selection: any, ): void {

    if ('name' in selection) {
      this.showtimes = null

      let genre = selection
      this.selectedGenre = genre;
      this.get_movies(genre)
      this.selectedMovie = null
      this.movieUrl = null

    } else {
      let movie = selection
      this.selectedMovie = movie
      this.movieUrl = "https://image.tmdb.org/t/p/w600_and_h900_bestv2" + movie.poster_path
      this.get_showtimes(movie, this.geolocationPosition)

    }
  }
}
