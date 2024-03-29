let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
const request = require('request-promise');

let config = require('../config');

db = mongoose.connection;
db.once('open', function () {
    console.log('Connection successful')
});

const movieid_schema = new mongoose.Schema({
    showtimes: String,
    themoviedb: String,
});

const movie_id = mongoose.model('movie_id', movieid_schema);

// Get genres and ids as is in themoviedb API

router.get('/genres', function (req, res, next) {
    res.json({
        'data': [
            {"id": 28, "name": "Action"},
            {"id": 12, "name": "Adventure"},
            {"id": 16, "name": "Animation"},
            {"id": 35, "name": "Comedy"},
            {"id": 80, "name": "Crime"},
            {"id": 99, "name": "Documentary"},
            {"id": 18, "name": "Drama"},
            {"id": 10751, "name": "Family"},
            {"id": 14, "name": "Fantasy"},
            {"id": 36, "name": "History"},
            {"id": 27, "name": "Horror"},
            {"id": 10402, "name": "Music"},
            {"id": 9648, "name": "Mystery"},
            {"id": 10749, "name": "Romance"},
            {"id": 878, "name": "Science Fiction"},
            {"id": 10770, "name": "TV Movie"},
            {"id": 53, "name": "Thriller"},
            {"id": 10752, "name": "War"},
            {"id": 37, "name": "Western"}
        ]
    })
});

// Get cinema name by id because cinema_name is not included in /showtimes API response

router.get('/cinemas/:id', function (req, res, next) {
    let cinema_id = req.params.id;
    get_cinema_by_id(cinema_id)
        .then(function (fx) {
            fx = JSON.parse(fx);
            return res.json({'cinema_name': fx.cinema.name})
        }, (err) => {
            return res.json({'error': err})
        })

});

// Get movies by genre

router.post('/get_movies', function (req, res, next) {
    if (!('genres' in req.body)) {
        return res.json({'message': 'missing required parameter'})
    }
    let genres = req.body.genres;
    get_movies(genres)
        .then(function (fx) {
            fx = JSON.parse(fx);
            return res.json({'results': fx.results})
        }, (err) => {
            return res.json({'error': err})
        })

});

// Get showtimes by movie title

router.post('/get_showtimes', function (req, res, next) {
    if (!('themoviedb_id' in req.body) || !('movie_title' in req.body)) {
        return res.json({'message': 'missing required parameter'})
    }
    let themoviedb_id = req.body.themoviedb_id;
    let movie_title = req.body.movie_title;
    let city = req.body.city;

    helper_movie_id(themoviedb_id, movie_title)
        .then(function (fx) {

                get_showtimes(fx.showtimes_id, req.body.location)
                    .then(function (showtimes) {
                        showtimes = JSON.parse(showtimes);

                        add_cinema_name(showtimes)
                            .then(function (showtimes_with_names) {
                                return res.json(showtimes_with_names)

                            })
                    })
            }
        )
});

// Helper functions //


// Get all cinema names for cinema ids in showtimes response

const add_cinema_name = function (showtimes) {
    return new Promise((resolve, reject) => {
        try {
            let names = [];
            for (let i = 0; i < showtimes.length; i++) {
                get_cinema_by_id(showtimes[i].cinema.id)
                    .then(function (cinema) {
                        cinema = JSON.parse(cinema);

                        showtimes[i].cinema_name = cinema.cinema.name;
                        names.push(cinema.cinema);

                    }, (err) => {
                    })
            }
            resolve(showtimes)

        } catch (err) {
            reject(err)
        }
    })

};

// Get showtimes API id based on themoviedb id or movie title

const helper_movie_id = function (themoviedb_id, movie_title) {
    return new Promise((resolve, reject) => {
        try {
            let showtimes_id = 0;
            get_movie_id(themoviedb_id, movie_title)
                .then(function (fx) {
                    fx = JSON.parse(fx);
                    if ('from_db' in fx) {
                        resolve(fx)
                    }

                    // If not from db, add to db
                    let results = [];
                    for (let i = 0; i < fx.movies.length; i++) {
                        if (fx.movies[i].title.toLowerCase() === movie_title.toLowerCase()) {
                            results.push(fx.movies[i])
                        }
                    }
                    if (results.length > 0) {
                        showtimes_id = results[0].id;
                        add_to_db(themoviedb_id, showtimes_id)
                    }
                    resolve({'showtimes_id': showtimes_id})
                }, (err) => {
                    return {'error': err}
                })
        } catch (err) {
            reject(err)
        }
    })
};

// API call to showtimes API to get cinema title

const get_cinema_by_id = function (cinema_id) {
    return new Promise((resolve, reject) => {
        try {
            const api_key = config.showtimes_key;

            let fx = request('https://api.internationalshowtimes.com/v4/cinemas/' + cinema_id + '?apikey=' + api_key);

            resolve(fx)
        }
        catch (err) {
            reject(err)
        }
    });
};

// Get showtimes ID based on themoviedb ID or movie title

const get_movie_id = function (themoviedb_id, movie_title) {
    let query = movie_id.findOne({'themoviedb': themoviedb_id});

    // Checking mongo if already in db
    query.select('showtimes');
    query.exec(function (err, showtimes_id) {
        if (err) return err;
        if (!(showtimes_id == null)) {
            return {'showtimes_id': showtimes_id, 'from_db': true};
        }
    });
    return new Promise((resolve, reject) => {
        try {
            const api_key = config.showtimes_key;

            movie_title = encodeURIComponent(movie_title.trim());
            let fx = request('https://api.internationalshowtimes.com/v4/movies/?apikey=' + api_key + '&search_field=original_title&search_query=' + movie_title);

            resolve(fx)
        }
        catch (err) {
            reject(err)
        }
    });
};

// Add id mapping to db

const add_to_db = function (themoviedb_id, showtimes_id) {
    let new_entry = new movie_id({'themoviedb': themoviedb_id, 'showtimes': showtimes_id});
    new_entry.save(function (err) {
        if (err) {
            console.log(err)
        }
        else {
            console.log({'message': 'success!', 'showtimes': showtimes_id})
        }
    })
};

// API call to showtimes to get showtimes based on movie id and location

const get_showtimes = function (showtimes_id, location) {
    return new Promise((resolve, reject) => {
        try {
            const api_key = config.showtimes_key;

            let fx = request('https://api.internationalshowtimes.com/v4/showtimes/?apikey=' + api_key + '&movie_id=' + showtimes_id + '&location=' + location);
            resolve(fx)
        }
        catch (err) {
            reject(err)
        }
    });
};

// API call to themoviedb API to get movies based on genres

const get_movies = function (genres) {
    return new Promise((resolve, reject) => {
        try {
            const api_key = config.themoviedb_key;
            let fx = request('https://api.themoviedb.org/3/discover/movie?api_key=' + api_key + '&sort_by=popularity.desc&primary_release_year=2018&with_genres=' + genres);
            resolve(fx)
        }
        catch (err) {
            reject(err)
        }
    })
};

module.exports = router;