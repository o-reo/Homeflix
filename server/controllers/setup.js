const Movie = require('../models/movie');
const https = require('https');
const request = require('request');
const MovieInfos = require('../models/movie-infos');
const imdb = require('imdb-api');
const credentials = require('../config/credentials');
const EztvApi = require('eztv-api-pt')

function dlPage(page) {
  if (dlPage >= 170)
    return;
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
      if (!error) {
        data.data.movies.forEach(function(val) {
          imdb.get({
              id: val.imdb_code
            }, {
              apiKey: credentials.imdb.key,
              timeout: 30000
            })
            .then((info) => {
              setTimeout(() => {
                val.torrents.forEach((torrent) => {
                  torrent.magnet = `magnet:?xt=urn:btih:${torrent.hash}&dn=Url+Encoded+Movie+Name&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://tracker.uw0.xyz:6969/announce&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.zer0day.to:1337/announce&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://explodie.org:6969&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.internetwarriors.net:1337/announce&tr=http://mgtracker.org:6969/announce&tr=udp://ipv6.leechers-paradise.org:6969/announce&tr=http://nyaa.tracker.wf:7777/announce`;
                });
                val.cast = [{
                    character_name: 'Director',
                    name: info.director
                  },
                  {
                    character_name: 'Writer',
                    name: info.writer
                  },
                  {
                    character_name: 'Production',
                    name: info.production
                  }
                ];
                val.type = 'Movie';
                info.actors.split(', ').forEach((actor, key) => {
                  val.cast.push({
                    character_name: '',
                    name: actor
                  });
                });
                const newMovie = MovieInfos(val);
                newMovie.save((err, movie) => {
                  if (err) {
                    console.log('MONGOOSE - Could not add movie');
                  } else {
                    console.log('MONGOOSE - Adding movie:', movie.title);
                  }
                });
              }, 1000)
            }).catch(err => {
              console.log('OMDB - Could not fetch infos');
            });
        });
      } else {
        console.log('YTS: Could not get movie page', page);
      }
    });
    dlPage(page + 1);
  }, 1500);
}

function EztvToMovieInfo(res) {
  let info = {
    imdb_code: 'tt' + res.imdb_id,
    type: 'TV Show',
    title: res.title,
    year: 1989,
    rating: 0,
    runtime: 0,
    genres: [],
    summary: `Season ${res.season}, episode ${res.episode}`,
    synopsis: `Season ${res.season}, episode ${res.episode}`,
    background_image: res.large_screenshot,
    background_image_original: res.large_screenshot,
    small_cover_image: res.small_screenshot,
    medium_cover_image: res.small_screenshot,
    large_cover_image: res.large_screenshot,
    language: 'english',
    cast: [],
    torrents: [{
      magnet: res.magnet_url,
      seeds: res.seeds,
      peers: res.peers,
      size: res.size_bytes,
      hash: res.hash,
      quality: `Season ${res.season}, episode ${res.episode}`
    }]
  };
  return info;
}

function addEztvTorrents(page) {
  if(page > 3){
    return;
  }
  const eztv = new EztvApi();
  eztv.getTorrents({
    page: page,
    limit: 20
  }).then((result) => {
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
            quality: `Season ${res.season}, episode ${res.episode}`
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
    addEztvTorrents(page + 1);
  }).catch((err) => {
    console.log(err);
  });
}

exports.populate = function(req, res) {
  addEztvTorrents(1);
};

// exports.populate = function(req, res) {
//   dlPage(1);
//   res.json({
//     msg: 'Populating database...'
//   })
// };
