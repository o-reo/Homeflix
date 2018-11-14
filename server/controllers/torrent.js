const torrentStream = require('torrent-stream');
const fs = require("fs"); //Load the filesystem module
const MovieInfos = require('../models/movie-infos');
const User = require('../models/user');
const ffmpeg = require('fluent-ffmpeg');

exports.getTorrents = function (req, res) {
    let limit = 20;
    let order = 1;
    let sort = {title: 1};
    let page = 1;
    let query = {};
    let genre = '*';
    if (req.query.genre)
        genre = req.query.genre;
    if (req.query.title.charAt(0) !== '*')
        query = {title: {$regex: req.query.title, $options: 'i'}};
    if (genre !== '*') {
        // console.log('GENRE:', genre);
        query.genres = {$all: [genre]};
    }
    // console.log('QUERY', query);
    if (req.query.page)
        page = Math.max(0, req.query.page);
    if (req.query.limit && req.query.limit <= 50 && req.query.limit >= 1)
        limit = req.query.limit;
    if (req.query.order_by)
        order = (req.query.order_by === 'asc') ? 1 : -1;
    if (req.query.sort_by) {
        // console.log('sortBy');
        if (req.query.sort_by === 'title')
            sort = {title: order};
        if (req.query.sort_by === 'year')
            sort = {year: order};
        if (req.query.sort_by === 'rating')
            sort = {rating: order};
    }
    const options = {
        sort: sort,
        page: page,
        limit: limit
    };
    MovieInfos.paginate(query, options, function (err, movies) {
        //console.log(movies.docs);
        res.json(movies.docs);
    });
};


exports.streamTorrent = function (req, res) {
    let stream;
    let converting = false;
    let sent = false;

    // Adds a view to the user collection
    if (req.query.imdbid) {
        User.addView({imdbid: req.query.imdbid, user_id: req.userdata._id}, (success, msg) => {
        });
    }
    let magnet = 'magnet:?xt=urn:btih:'
        + req.params.hash
        + '&dn=Url+Encoded+Movie+Name&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://tracker.uw0.xyz:6969/announce&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.zer0day.to:1337/announce&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://explodie.org:6969&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.internetwarriors.net:1337/announce&tr=http://mgtracker.org:6969/announce&tr=udp://ipv6.leechers-paradise.org:6969/announce&tr=http://nyaa.tracker.wf:7777/announce';
    let engine = torrentStream(magnet, {path: './../films'});

    engine.on('ready', function () {
        engine.files.forEach(function (file) {
            if (file.name.substr(file.name.length - 3) === 'mkv' || file.name.substr(file.name.length - 3) === 'mp4') {
                if (!fs.existsSync('../films/' + req.params.hash)) {
                    fs.mkdirSync('../films/' + req.params.hash);
                }
                file.path = req.params.hash + '/' + file.name;
                stream = file.createReadStream();
            } else {
                file.deselect();
            }
        });

    });

    engine.on('download', function () {
        if (!converting) {
            // ffmpeg convert to HLS stream
            let proc = ffmpeg(stream, {timeout: 432000})
                .addOptions([
                    '-profile:v baseline',
                    '-level 3.0',
                    '-start_number 0',
                    '-hls_list_size 0',
                    '-hls_time 10',
                    '-f hls'
                ])
                .on('progress', (data) => {
                    console.log('User:', req.userdata.username, '\nMovie:', req.query.imdbid, '\nTimemark:', data.timemark);
                    if (data.frames >= 500 && !sent) {
                        res.json({path: '/' + req.params.hash + '/output.m3u8'});
                        sent = true;
                    }
                })
                .save('../films/' + req.params.hash + '/output.m3u8');
            converting = true;
        }
    });

    engine.on('idle', function () {
        if (!sent) {
            res.json({path: '/' + req.params.hash + '/output.m3u8'});
            sent = true;
        }
    });
};
