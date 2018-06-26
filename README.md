# movie_showtimes
MEAN stack project for CS 591: an app to find movies and showtimes near you based on genre.

## To run project

* From root directory to run backend:\
`npm install`\
`npm start`
* To run frontend:\
`cd angular`  \
`ng serve` 

* To run mongo
In separate terminal window:\
`mongod`

Navigate to [https://localhost:4200] in browser.

## APIs used / keys needed
[The Movie DB](https://www.themoviedb.org/documentation/api) \
[International Showtimes API](https://api.internationalshowtimes.com/documentation/v4/) \
Twitter Application Management keys

## Other Requirements
* Twitter account for oauth
* MongoDB (stores mapping between movie UIDs of each API)