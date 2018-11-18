const request = require('request');
const MovieInfos = require('../models/movie-infos');
const credentials = require('../config/credentials');
const EztvApi = require('eztv-api-pt');

function addYTSTorrents(page, max_page) {
  if (page >= max_page)
    return;
  let count = 0;
  setTimeout(function() {
    let options = {
      url: 'https://yts.am/api/v2/list_movies.json?limit=50&page=' + page + '&with_images=true&with_cast=true',
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36',
        'cookie': '__cfduid=df636e11815501063a8271a09ea634e271539350245; PHPSESSID=5seuhn4gbp8o5df0h5ftibe9s6; __test; __atuvc=4%7C41; cf_clearance=ef6c8834664556c48bd215b322e2a7b77ac6e863-1539354307-3600-150'
      }
    };
    request(options, function(error, response, body) {
      let data = {
        data: {
          movies: []
        }
      };
      try {
        data = JSON.parse(body);
      } catch (err) {
        error = err;
        console.log(err);
      }
      count = data.data.movies.length;
      if (!error) {
        data.data.movies.forEach(function(val) {
            val.type = 'Movie';
            val.torrents.forEach((torrent) => {
                torrent.magnet = `magnet:?xt=urn:btih:${torrent.hash}&dn=Url+Encoded+Movie+Name&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://tracker.uw0.xyz:6969/announce&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.zer0day.to:1337/announce&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://explodie.org:6969&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.internetwarriors.net:1337/announce&tr=http://mgtracker.org:6969/announce&tr=udp://ipv6.leechers-paradise.org:6969/announce&tr=http://nyaa.tracker.wf:7777/announce`;
            });
            const newMovie = MovieInfos(val);
            newMovie.save((err, movie) => {
                if (err) {
                    console.log('MONGOOSE - Could not add movie');
                } else {
                    console.log('MONGOOSE - Adding movie:', movie.title);
                }
            });
        });
      } else {
        console.log('YTS: Could not get movie page', page);
      }
    });
    if (count) {
        addYTSTorrents(page + 1);
    }
    }, 1500);
}

function EztvToMovieInfo(res) {
  let tvinfo = {
    imdb_code: 'tt' + res.imdb_id,
    type: 'TV Show',
    title: res.title,
    year: 1989,
    rating: 0,
    runtime: 0,
    genres: [],
    summary: `Season ${res.season}, episode ${res.episode}`,
    synopsis: `Season ${res.season}, episode ${res.episode}`,
    medium_cover_image: res.small_screenshot,
    language: 'english',
    cast: [],
    torrents: [{
        magnet: res.magnet_url,
        seeds: res.seeds,
        peers: res.peers,
        size: res.size_bytes,
        hash: res.hash,
        season: res.season,
        episode: res.episode
    }]
  };
  return tvinfo;
}

function addEZTVTorrents(page, max_page) {
  if(page > max_page){
    return;
  }
  let count = 0;
  const eztv = new EztvApi();
  eztv.getTorrents({
    page: page,
    limit: 20
  }).then((result) => {
      count = result.torrents.length;
    result.torrents.forEach((res) => {
      MovieInfos.findOne({imdb_code: 'tt' + res.imdb_id}, (err, movie) => {
        if (err) {
          console.log('MONGOOSE - Could not fetch torrents');
        } else if (!movie) {
          // Add a new movie entry
          let tvshow = EztvToMovieInfo(res);
          const newMovie = MovieInfos(tvshow);
          newMovie.save((err, movie) => {
            if (err) {
              console.log('MONGOOSE - Could not add tvshow');
            } else {
              console.log('MONGOOSE - Adding tvshow:', movie.title);
            }
          });
        } else {
          // Append episode to tv show
          movie.torrents.push({
            magnet: res.magnet_url,
            seeds: res.seeds,
            peers: res.peers,
            size: res.size_bytes,
            hash: res.hash,
            season: res.season,
            episode: res.episode
          });
          movie.save((err, movie) => {
            if (err) {
              console.log('MONGOOSE - Could not add episode');
            } else {
              console.log('MONGOOSE - Adding episode to:', movie.title);
            }
          });
        }
      })
    });
    if (count){
        addEZTVTorrents(page + 1, max_page);
    }
  }).catch((err) => {
    console.log(err);
  });
}

function checkIMDB() {
    let api_query = `api_key=${credentials.themoviedb.key}`;
    let query = `${api_query}&external_source=imdb_id`;
  MovieInfos.find((err, movies) => {
    movies.forEach((movie, key) => {
        setTimeout(function() {
        request(`https://api.themoviedb.org/3/find/${movie.imdb_code}?${query}`, function(error, response, body) {
            let infos = JSON.parse(body);

            // Handle TV Shows infos
            if (movie.type === 'TV Show'){
                // Get tv infos
                if (infos && infos['tv_results'] && infos['tv_results'][0]){
                    infos = infos['tv_results'][0];
                    movie.year = infos['first_air_date'].substring(0,4);
                    movie.synopsis = infos['overview'];
                    movie.title = infos['name'];
                    movie.rating = infos['vote_average'];
                    movie.medium_cover_image = `https://image.tmdb.org/t/p/w300${infos['poster_path']}`;
                    request(`https://api.themoviedb.org/3/tv/${infos['id']}?${api_query}`, function(error, response, body) {
                        let tvdata = JSON.parse(body);
                        let genres = [];
                        if (tvdata.genres){
                            tvdata.genres.forEach((genre) => {
                                genres.push(genre['name']);
                            });
                        }
                        movie.genres = genres;
                        if (tvdata['episode_run_time']){
                            movie.runtime = tvdata['episode_run_time'][0];
                        }
                        movie.language = tvdata['original_language'];
                        if (movie.language === 'en'){
                            movie.language = 'english';
                        } else if (movie.language === 'fr'){
                            movie.language = 'french';
                        } else if (movie.language === 'sp'){
                            movie.language = 'spanish';
                        } else {
                            movie.language = 'Other';
                        }
                        request(`https://api.themoviedb.org/3/tv/${infos['id']}/credits?${api_query}`, function(error, response, body) {
                            let castdata = JSON.parse(body);
                            let cast = [];
                            if (castdata.crew){
                                castdata.crew.slice(0,3).forEach((crew) => {
                                    cast.push({
                                        name: crew['name'],
                                        character_name: crew['job']
                                    });
                                });
                            }
                            if (castdata.cast){
                                castdata.cast.slice(0,10).forEach((actor) => {
                                    cast.push({
                                        name: actor['name'],
                                        character_name: actor['character']
                                    });
                                });
                            }
                            movie.cast = cast;
                            movie.save((err, movie) => {
                                if(err){
                                    console.log(err);
                                }else {
                                    console.log(`Adding data to ${movie.title}`);
                                }
                            });
                        });
                    });
                } else {
                    // Remove show because there is no info about it
                    console.log('Removed ', movie.title);
                    movie.remove();

                }
                // Handle Movie infos
            } else if (movie.type === 'Movie'){
                if (infos && infos['movie_results'] && infos['movie_results'][0]) {
                    infos = infos['movie_results'][0];
                    // Get casting
                    request(`https://api.themoviedb.org/3/movie/${infos['id']}/credits?${api_query}`, function(error, response, body) {
                       let moviedata = JSON.parse(body);
                       let cast = [];
                       if (moviedata.crew){
                        moviedata.crew.slice(0,3).forEach((crew) => {
                            cast.push({
                                name: crew['name'],
                                character_name: crew['job']
                            });
                        });
                       }
                       if (moviedata.cast){
                       moviedata.cast.slice(0,10).forEach((actor) => {
                          cast.push({
                              name: actor['name'],
                              character_name: actor['character']
                          });
                       });
                       }
                       movie.cast = cast;
                        movie.save((err, movie) => {
                            if(err){
                                console.log(err);
                            }else {
                                console.log(`Adding data to ${movie.title}`);
                            }
                        });
                    });
                }
            }
        }); // 4 Requests per second
        }, 800 * key);
    });
  });
}

exports.populate = function(req, res) {
  // addEZTVTorrents(1, 5);
  //   addYTSTorrents(1, 2);
  checkIMDB();
    res.json({
      msg: 'Populating database...'
    })
};
