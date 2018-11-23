const request = require('request');
const MovieInfos = require('../models/movie-infos');
const credentials = require('../config/credentials');
const EztvApi = require('eztv-api-pt');
const fs = require('fs');
const fse = require('fs-extra');
const cloudflare = require('cloudflare-bypasser');

function addYTSTorrents(page, max_page, header) {
    if (page >= max_page)
        return;
    let count = 0;
    setTimeout(function () {
        let options = {
            url: 'https://yts.am/api/v2/list_movies.json?limit=40&page=' + page + '&with_images=true&with_cast=true',
            jar: header.jar,
            headers: {
                'user-agent': header['user-agent']
            }
        };
        request(options, function (error, response, body) {
            let data = {
                data: {
                    movies: []
                }
            };
            try {
                data = JSON.parse(body);
            } catch (err) {
                error = err;
                console.log('YTS: IDs need to be updated');
            }
            count = data.data.movies.length;
            if (!error) {
                data.data.movies.forEach(function (val) {
                    val.type = 'Movie';
                    if (val.torrents){
                        val.torrents.forEach((torrent) => {
                            torrent.magnet = `magnet:?xt=urn:btih:${torrent.hash}&dn=Url+Encoded+Movie+Name&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://tracker.uw0.xyz:6969/announce&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.zer0day.to:1337/announce&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://explodie.org:6969&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.internetwarriors.net:1337/announce&tr=http://mgtracker.org:6969/announce&tr=udp://ipv6.leechers-paradise.org:6969/announce&tr=http://nyaa.tracker.wf:7777/announce`;
                        });
                    }
                    val.medium_cover_image = '/default.png';
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
            if (count) {
                addYTSTorrents(page + 1, max_page, header);
            }
        });
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
        medium_cover_image: '/default.png',
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

function EZTVPromise(res){
    return new Promise((resolve) => {
        MovieInfos.findOne({imdb_code: 'tt' + res.imdb_id}, (err, movie) => {
            if (err) {
                console.log('MONGOOSE - Could not fetch torrents');
            } else if (!movie) {
                // Add a new movie entry
                let tvshow = EztvToMovieInfo(res);
                const newMovie = MovieInfos(tvshow);
                newMovie.save((err, savedmovie) => {
                    if (err) {
                        console.log('MONGOOSE - Could not add tvshow');
                    } else {
                        console.log('MONGOOSE - Adding tvshow:', savedmovie.title);
                    }
                    resolve();
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
                    resolve();
                });
            }
        })
    });
}

function addEZTVTorrents(page, max_page) {
    if (page > max_page + 1) {
        return;
    }
    let count = 0;
    const eztv = new EztvApi();
    eztv.getTorrents({
        page: page,
        limit: 40
    }).then(async (result) => {
        count = result.torrents.length;
        for (const res of result.torrents){
            await EZTVPromise(res);
        }
        if (count) {
            addEZTVTorrents(page + 1, max_page);
        }
    }).catch((err) => {
        console.log('EZTV: Could not fetch results');
    });
}

function checkIMDB(callback) {
    let api_query = `api_key=${credentials.themoviedb.key}`;
    let query = `${api_query}&external_source=imdb_id`;
    MovieInfos.find((err, movies) => {
        movies.forEach((movie, key) => {
            setTimeout(function () {
                request(`https://api.themoviedb.org/3/find/${movie.imdb_code}?${query}`, function (error, response, body) {
                    let infos = JSON.parse(body);

                    // Handle TV Shows infos
                    if (movie.type === 'TV Show') {
                        // Get tv infos
                        if (infos && infos['tv_results'] && infos['tv_results'][0]) {
                            infos = infos['tv_results'][0];
                            if (infos['first_air_date']) {
                                movie.year = infos['first_air_date'].substring(0, 4);
                            }
                            movie.synopsis = infos['overview'];
                            movie.title = infos['name'];
                            movie.rating = infos['vote_average'];
                            if (infos.poster_path) {
                                movie.medium_cover_image = `https://image.tmdb.org/t/p/w300${infos['poster_path']}`;
                            }
                            request(`https://api.themoviedb.org/3/tv/${infos['id']}?${api_query}`, function (error, response, body) {
                                let tvdata = JSON.parse(body);
                                let genres = [];
                                if (tvdata.genres) {
                                    tvdata.genres.forEach((genre) => {
                                        genres.push(genre['name']);
                                    });
                                }
                                movie.genres = genres;
                                if (tvdata['episode_run_time']) {
                                    movie.runtime = tvdata['episode_run_time'][0];
                                }
                                movie.language = tvdata['original_language'];
                                if (movie.language === 'en') {
                                    movie.language = 'english';
                                } else if (movie.language === 'fr') {
                                    movie.language = 'french';
                                } else if (movie.language === 'sp') {
                                    movie.language = 'spanish';
                                } else {
                                    movie.language = 'Other';
                                }
                                request(`https://api.themoviedb.org/3/tv/${infos['id']}/credits?${api_query}`, function (error, response, body) {
                                    let castdata = JSON.parse(body);
                                    let cast = [];
                                    if (castdata.crew) {
                                        castdata.crew.slice(0, 3).forEach((crew) => {
                                            cast.push({
                                                name: crew['name'],
                                                character_name: crew['job']
                                            });
                                        });
                                    }
                                    if (castdata.cast) {
                                        castdata.cast.slice(0, 10).forEach((actor) => {
                                            cast.push({
                                                name: actor['name'],
                                                character_name: actor['character']
                                            });
                                        });
                                    }
                                    movie.cast = cast;
                                    movie.save((err, movie) => {
                                        if (err) {
                                            if (movie) {
                                                console.log(`THEMOVIEDB: Error while adding data to ${movie.title}`);
                                            }
                                        } else {
                                            console.log(`THEMOVIEDB: Adding data to ${movie.title}`);
                                        }
                                    });
                                });
                            });
                        } else {
                            // Remove show because there is no info about it
                            console.log('THEMOVIEDB: Removed ', movie.title);
                            movie.remove();

                        }
                        // Handle Movie infos
                    } else if (movie.type === 'Movie') {
                        if (infos && infos['movie_results'] && infos['movie_results'][0]) {
                            infos = infos['movie_results'][0];
                            if (!infos['poster_path']) {
                                infos['poster_path'] = null;
                            }
                            if (infos.poster_path) {
                                movie.medium_cover_image = `https://image.tmdb.org/t/p/w300${infos['poster_path']}`;
                            }
                            // Get casting
                            request(`https://api.themoviedb.org/3/movie/${infos['id']}/credits?${api_query}`, function (error, response, body) {
                                let moviedata = JSON.parse(body);
                                let cast = [];
                                if (moviedata.crew) {
                                    moviedata.crew.slice(0, 3).forEach((crew) => {
                                        cast.push({
                                            name: crew['name'],
                                            character_name: crew['job']
                                        });
                                    });
                                }
                                if (moviedata.cast) {
                                    moviedata.cast.slice(0, 10).forEach((actor) => {
                                        cast.push({
                                            name: actor['name'],
                                            character_name: actor['character']
                                        });
                                    });
                                }
                                movie.cast = cast;
                                movie.save((err, movie) => {
                                    if (err) {
                                        if (movie) {
                                            console.log(`THEMOVIEDB: Error while adding data to ${movie.title}`);
                                        }
                                    } else {
                                        console.log(`THEMOVIEDB: Adding data to ${movie.title}`);
                                    }
                                });
                            });
                        } else {
                            // Remove show because there is no info about it
                            if (movie) {
                                console.log('THEMOVIEDB: Removed ', movie.title);
                                movie.remove();
                            }
                        }
                    }
                }); // 4 Requests per second
                if (key === movies.length) {
                    callback();
                }
            }, 700 * key);
        });
    });
}

exports.populate = function (req, res) {
    if (req.userdata.grant === 1) {
        let page = 0;
        if (req.query.amount) {
            page = Math.ceil(req.query.amount / 40);
        } else {
            page = 500;
        }
        addEZTVTorrents(1, page);
        let cf = new cloudflare();
        cf.request({
            url: 'https://yts.am/api/',
            headers: {
                accept: 'application/json'
            }
        }).then((res) => {
            addYTSTorrents(1, page, {
                'user-agent': cf.userAgent,
                'jar': cf.jar
            });
        });
        res.json({
            msg: 'Populating database...'
        })
    } else {
        res.json({error: true, msg: "Your rights are not enough"});
    }
};

exports.infos = function (req, res) {
    if (req.userdata.grant === 1) {
        res.json({
            msg: 'Adding infos...'
        });
        checkIMDB(() => {
            console.log('Fetched all informations');
        });
    } else {
        res.json({error: true, msg: "Your rights are not enough"});
    }
};

exports.cleanMovies = function (req, res) {
    let time = new Date().getTime();
    fs.readdir('../films', (err, files) => {
        files.forEach((file) => {
            fs.stat('../films/' + file, (err, stat) => {
                // mtime is modified time a month is 2592000000 seconds
                if ((time - stat.mtimeMs) > 2592000000) {
                    fse.remove('../films/' + file);
                }
            });
        });
    });
};

exports.reset = function (req, res) {
    if (req.userdata.grant === 1) {
        MovieInfos.deleteMany({}, (err, conf) => {
            console.log('MONGOOSE: Database was cleaned');
            res.json({error: false, msg: 'Database was cleaned'});
        });
    } else {
        res.json({error: true, msg: "Your rights are not enough"});
    }
};