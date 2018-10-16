const http = require('http');
const torrentStream = require('torrent-stream');
const OS = require('opensubtitles-api');
const fs = require("fs"); //Load the filesystem module
const MovieInfos = require('../models/movie-infos');
var srt2vtt = require('srt-to-vtt');

const OpenSubtitles = new OS({
    useragent: 'TemporaryUserAgent'
});

exports.getSubtitles = function (req, res) {
    let lang = 'eng';
    console.log(req.query);
    if (req.query.lang) {
        lang = req.query.lang;
    }
    let filesize = '';
    if (req.query.filesize) {
        filesize = req.query.filesize;
    }
    let search_array = {
        imdbid: req.params.imdbid,
        sublanguageid: lang,
        filesize: filesize,
        extensions: ['srt']
    };
    OpenSubtitles.login()
        .then(result => {
            OpenSubtitles.search(search_array)
                .then(subtitles => {
                    let uniqid = (new Date().getTime() + Math.floor((Math.random() * 10000) + 1)).toString(16);
                    let sub_file = fs.createWriteStream('./../client/src/assets/subtitles/' + uniqid + '.vtt');
                    req = http.get(subtitles[Object.keys(subtitles)[0]]['url'], function (response) {
                        response
                            .pipe(srt2vtt())
                            .pipe(sub_file);
                    });
                    console.log('debug output:', {
                        path: './../client/src/assets/subtitles/' + uniqid + '.vtt',
                        lang: lang
                    });
                    res.json({path: 'subtitles/' + uniqid + '.vtt', lang: lang});
                })
                .catch(error => {
                    console.log('error');
                    res.json({error: error, imdbid: req.params.imdbid, lang: lang});
                })
        })
        .catch(error => {
            console.log('error');
            res.json({error: error, imdbid: req.params.imdbid, lang: lang});
        })
};

exports.getTorrents = function (req, res) {
    var get_query = '';
    /* if (req.params.api === 'yts') {
         if (req.params.title.charAt(0) != '*')
             get_query = 'https://yts.am/api/v2/list_movies.json?limit=48&query_term=' + req.params.title + '&with_images=true&with_cast=true';
         else {
             get_query = 'https://yts.am/api/v2/list_movies.json?limit=48' + req.params.title.substring(1) + '&with_images=true&with_cast=true';
         }
     } else if (req.params.api === 'nyaapantsu') {
         if (req.params.title.charAt(0) != '*')
             get_query = 'https://nyaa.pantsu.cat/api/search?limit=48&q=' + req.params.title;
         else {
             get_query = 'https://nyaa.pantsu.cat/api/search?limit=48' + req.params.title.substring(1);
         }
     }*/
    /*console.log(get_query);
    request(get_query, function (error, response, body) {
        console.log(body);
        res.json(body);
    });*/
    console.log(req.query);
    var limit = 20;
    var order = 1;
    var sort = {title: 1};
    var page = 1;
    var query = {};
    var genre = '*';
    if (req.query.genre)
        genre = req.query.genre;
    if (req.params.title.charAt(0) !== '*')
        query = {title: {$regex: req.params.title, $options: 'i'}};
    if (genre !== '*') {
        console.log('GENRE:', genre);
        query.genres = {$all: [genre]};
    }
    console.log('QUERY', query);
    if (req.query.page)
        page = Math.max(0, req.query.page);
    if (req.query.limit && req.query.limit <= 50 && req.query.limit >= 1)
        limit = req.query.limit;
    if (req.query.order_by)
        order = (req.query.order_by === 'asc') ? 1 : -1;
    if (req.query.sort_by) {
        console.log('sortBy');
        if (req.query.sort_by === 'title')
            sort = {title: order};
        if (req.query.sort_by === 'year')
            sort = {year: order};
        if (req.query.sort_by === 'rating')
            sort = {rating: order};
    }
    var options = {
        sort: sort,
        page: page,
        limit: limit
    }
    MovieInfos.paginate(query, options, function (err, movies) {
        //console.log(movies.docs);
        res.json(movies.docs);
    });
};

exports.streamTorrent = function (req, res) {
    let path = '';
    let sending = false;
    var magnet = 'magnet:?xt=urn:btih:'
        + req.params.hash
        + '&dn=Url+Encoded+Movie+Name&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://tracker.uw0.xyz:6969/announce&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.zer0day.to:1337/announce&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://explodie.org:6969&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.internetwarriors.net:1337/announce&tr=http://mgtracker.org:6969/announce&tr=udp://ipv6.leechers-paradise.org:6969/announce&tr=http://nyaa.tracker.wf:7777/announce';
    var engine = torrentStream(magnet, {path: './films'});
    console.log('Waiting download ... ');
    engine.on('ready', function () {
        console.log('Start Download ...');
        engine.files.forEach(function (file) {
            if (file.name.substr(file.name.length - 3) === 'mkv' || file.name.substr(file.name.length - 3) === 'mp4') {
                console.log('Stream en cours ...: ', file.name);
                var stream = file.createReadStream();
                path = file.path;
                console.log('path:', file.path);
            }
        });
    });

    engine.on('download', function (data) {
        console.log('--piece downloaded: ', data);
        if (!sending) {
            if (fs.existsSync(__dirname + '/../films/' + path)) {
                const stats = fs.statSync(__dirname + '/../films/' + path);
                const fileSizeInBytes = stats.size;
//Convert the file size to megabytes (optional)
                const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
                if (fileSizeInMegabytes >= 25 && !sending) {
                    sending = true;
                    res.json({path: path});
                    console.log('piece telechargee, diffusion du stream !');
                }
                console.log('SIZE: ', fileSizeInMegabytes);
            } else {
                console.log('fichier introuvable: ' + __dirname + '/../films/' + path);
            }
        }
    });

    engine.on('idle', function () {
        if (!sending) {
            if (fs.existsSync(__dirname + '/../films/' + path)) {
                const stats = fs.statSync(__dirname + '/../films/' + path);
                const fileSizeInBytes = stats.size;
//Convert the file size to megabytes (optional)
                const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
                if (fileSizeInMegabytes >= 25 && !sending) {
                    sending = true;
                    res.json({path: path});
                    console.log('piece telechargee, diffusion du stream !');
                }
                console.log('SIZE: ', fileSizeInMegabytes);
            } else {
                console.log('fichier introuvable: ' + __dirname + '/../films/' + path);
            }
        }
        console.log('end download');
    });
};