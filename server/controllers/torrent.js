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

function live(hash) {
    if (global.PROCESS_ARRAY[hash]) {
        global.PROCESS_ARRAY[hash].live = Math.floor(Date.now() / 1000);
        return true;
    }
    return false;
}

exports.liveTorrent = function (req, res) {
    res.json({status: live(req.params.hash)});
};

function stop(hash) {
    console.log(`FFMPEG - killing process of hash: ${hash}`);
    const process = global.PROCESS_ARRAY[hash];
    if (process) {
        process.engine.destroy();
        process.process.kill('SIGSTOP');
        process.status = 'stopped';
        return true;
    } else {
        return false;
    }
}

exports.stopTorrent = function (req, res) {
    res.json({status: stop(req.params.hash)});
};

exports.streamTorrent = function (req, res) {
    let sent = false;

    // Adds a view to the user collection
    if (req.body.imdbid) {
        User.addView({imdbid: req.body.imdbid, user_id: req.userdata._id}, (success, msg) => {
        });
    }

    // Parse magnet, should be done directly in the database as it's specific to yts
    let magnet = 'magnet:?xt=urn:btih:'
        + req.params.hash
        + '&dn=Url+Encoded+Movie+Name&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://tracker.uw0.xyz:6969/announce&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.zer0day.to:1337/announce&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://explodie.org:6969&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.internetwarriors.net:1337/announce&tr=http://mgtracker.org:6969/announce&tr=udp://ipv6.leechers-paradise.org:6969/announce&tr=http://nyaa.tracker.wf:7777/announce';

    // Only if this torrent has not been downloaded and converted
    if (!global.PROCESS_ARRAY[req.params.hash] || global.PROCESS_ARRAY[req.params.hash].status === 'stopped') {
        let engine = torrentStream(magnet, {path: './../films'});
        // Torrent engine is ready
        let stream;
        engine.on('ready', function () {
            // Find the video file
            engine.files.forEach(function (file) {
                if (file.name.substr(file.name.length - 3) === 'mkv' || file.name.substr(file.name.length - 3) === 'mp4') {
                    if (!fs.existsSync('../films/' + req.params.hash)) {
                        fs.mkdirSync('../films/' + req.params.hash);
                    }
                    file.path = req.params.hash + '/' + file.name;

                    // create stream to torrent file
                    stream = file.createReadStream();
                    // initialize process entry
                    if (!global.PROCESS_ARRAY[req.params.hash]) {
                        global.PROCESS_ARRAY[req.params.hash] = {engine: engine, status: 'ready'};
                    } else {
                        global.PROCESS_ARRAY[req.params.hash].status = 'ready';
                    }
                } else {
                    file.deselect();
                }
            });

            // This torrent is now live for 20s
            live(req.params.hash);
            // Launch new process
            global.PROCESS_ARRAY[req.params.hash].process = ffmpeg(stream, {timeout: 432000})
                .addOptions([
                    '-profile:v baseline',
                    '-level 3.0',
                    '-start_number 0',
                    '-hls_list_size 0',
                    '-hls_time 10',
                    '-f hls'
                ])
                .on('start', () => {
                    global.PROCESS_ARRAY[req.params.hash].status = 'in progress';
                })
                .on('progress', (data) => {
                    console.log('FFMPEG - progress:', data.frames,
                        ', hash:', req.params.hash);
                    if (data.frames >= 1000 && !sent) {
                        res.json({path: '/' + req.params.hash + '/output.m3u8'});
                        sent = true;
                    }
                })
                .on('end', () => {
                    global.PROCESS_ARRAY[req.params.hash].status = 'done';
                })
                .save('../films/' + req.params.hash + '/output.m3u8');
        });

        engine.on('download', function () {
            console.log('TORRENT - progress:', engine.swarm.downloaded,
                ', hash:', req.params.hash);
            // Monitor last live on torrent to suspend download and conversion
            console.log('TORRENT - live:', Math.floor(Date.now() / 1000) - global.PROCESS_ARRAY[req.params.hash].live);
            if ((Date.now() / 1000) - global.PROCESS_ARRAY[req.params.hash].live > 30) {
                stop(req.params.hash)
            }
        });

        engine.on('idle', function () {
            console.log('TORRENT - live:', Math.floor(Date.now() / 1000) - global.PROCESS_ARRAY[req.params.hash].live);
            if ((Date.now() / 1000) - global.PROCESS_ARRAY[req.params.hash].live > 30) {
                stop(req.params.hash)
            }
        });

    } else {
        res.json({path: '/' + req.params.hash + '/output.m3u8'});
        // Sent boolean prevents double sending
        sent = true;
    }
};
