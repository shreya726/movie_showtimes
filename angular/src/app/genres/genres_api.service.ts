import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import { Genre } from '../genre';
import { Movie } from '../movie';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  constructor(
  private http: HttpClient){}

  get_movies(genre: Genre): any {
    return this.http.post('http://localhost:4000/movies/get_movies',
      {'genres': genre.id},
      httpOptions).pipe(
      tap((genre: Genre) => console.log(`got movies for genre`)),
      catchError(this.handleError<Genre>('get movies'))
    );


  }
  get_showtimes(movie: Movie, coords: any): any {
    let location_str = coords.latitude + ',' + coords.longitude
    return this.http.post('http://localhost:4000/movies/get_showtimes',
      {'movie_title': movie.title, 'themoviedb_id': movie.id, 'location':location_str},
      httpOptions).pipe(
      tap((movie: Movie) => console.log(`got showtimes for movie`)),
      catchError(this.handleError<Genre>('get showtimes'))
    );


  }

  get_cinema_names(showtimes: any, movie_title: string): any{
    let new_showtimes = []
    let unique_cinemas = []
    let tweet_text = ''
    for (let i = 0; i<showtimes.length; i++){
      let cinema_id = showtimes[i].cinema_id
      if (unique_cinemas.indexOf(cinema_id) < 0){
        unique_cinemas.push(cinema_id)
        new_showtimes.push(showtimes[i])
      }

    }
    for (let j=0; j<new_showtimes.length; j++){
      let cinema_id = new_showtimes[j].cinema_id
      this.http.get('http://localhost:4000/movies/cinemas/'+cinema_id)
        .subscribe(
          data => new_showtimes[j].cinema_name = (data['cinema_name']),
          err => console.log('Error', err),
          () => console.log(`Completed request`)
        )
      new_showtimes[j].time = new_showtimes[j].start_at.substring(11,16)
      console.log(new_showtimes[j].cinema_name)

      tweet_text = "I'm going to see "+movie_title + " at " + new_showtimes[j].time +". Lmk if you wanna join!! " + new_showtimes[j].booking_link
      tweet_text = encodeURI(tweet_text)
      new_showtimes[j].tweetLink = "https://twitter.com/intent/tweet?text=" + tweet_text
    }
    return new_showtimes
  }
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
