const https = require('https');
const torrentStream = require('torrent-stream');
var request = require('request');
const HorribleSubsApi = require('horriblesubs-api');
const fs = require("fs"); //Load the filesystem module
const MovieInfos = require('./../models/movie-infos');

exports.getTorrent = function (req, res) {
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
    var limit = 20;
    var order = 1;
    var sort = { title: 1 };
    var page = 1;
    var query = {};
    if (req.params.title.charAt(0) != '*')
        query = { title: {$regex: req.params.title, $options: 'i'}};
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
    var q = MovieInfos.find(query).limit(limit).skip(limit * page).sort(sort);
    q.exec (function(err, movie) {
       if (movie) {
          // console.log(movie);
           res.json(movie)
       }
   })
};

exports.streamTorrent = function (req, res) {
    let path = '';
    let sending = false;
    var magnet = 'magnet:?xt=urn:btih:'
        + req.params.hash
        + '&dn=Url+Encoded+Movie+Name&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://tracker.uw0.xyz:6969/announce&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.zer0day.to:1337/announce&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://explodie.org:6969&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.internetwarriors.net:1337/announce&tr=http://mgtracker.org:6969/announce&tr=udp://ipv6.leechers-paradise.org:6969/announce&tr=http://nyaa.tracker.wf:7777/announce';
    var engine = torrentStream(magnet, {path: './films'});
    console.log('Waiting download ... ');
    engine.on('ready', function (){
        console.log('Start Download ...');
       engine.files.forEach(function(file){
           if (file.name.substr(file.name.length - 3) === 'mkv' || file.name.substr(file.name.length - 3) === 'mp4') {
               console.log('Stream en cours ...: ', file.name);
               var stream = file.createReadStream();
               path = file.path;
               console.log('path:', file.path);
           }
       });
    });

    engine.on('download', function(data){
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

    engine.on('idle', function() {
        console.log('end download');
    });
};