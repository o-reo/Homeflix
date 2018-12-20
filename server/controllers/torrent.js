const torrentStream = require('torrent-stream');
const fs = require('fs'); //Load the filesystem module
const MovieInfos = require('../models/movie-infos');
const User = require('../models/user');
const ffmpeg = require('fluent-ffmpeg');
const parseTorrent = require('parse-torrent');
const diskspace = require('diskspace');

exports.getTorrents = function (req, res) {
    let order = 1;
    let query = {};
    let options = {};
    let genre = '*';

    // Query part.
    if (req.query.title && req.query.title.charAt(0) !== '*') {
        query.title = new RegExp(req.query.title, 'i');
    }
    if (req.query.casting && req.query.casting !== '*') {
        query['cast.name'] = new RegExp(req.query.casting, 'i');
    }
    if (req.query.genre)
        genre = req.query.genre;
    if (genre !== '*') {
        query.genres = {$elemMatch: genre};
    }
    if (req.query.minYear && req.query.maxYear) {
        query.year = {$gte: parseInt(req.query.minYear), $lte: parseInt(req.query.maxYear)};
    }
    if (req.query.minRating && req.query.maxRating) {
        query.rating = {$gte: parseFloat(req.query.minRating), $lte: parseFloat(req.query.maxRating)};
    }
    if (req.query.type) {
        let type = Array.isArray(req.query.type) ? req.query.type : [req.query.type];
        query.type = {$in: type};
    }
// Options part.
    if (req.query.page) {
        options['page'] = Math.max(0, req.query.page);
    }
    options.limit = 20;
    if (req.query.order_by)
        order = (req.query.order_by === 'asc') ? 1 : -1;
    if (req.query.sort_by) {
        if (req.query.sort_by === 'title')
            options['sort'] = {title: order};
        if (req.query.sort_by === 'year')
            options['sort'] = {year: order};
        if (req.query.sort_by === 'rating')
            options['sort'] = {rating: order};
        if (req.query.sort_by === 'runtime')
            options['sort'] = {runtime: order};
        if (req.query.sort_by === 'pop')
            options['sort'] = {'torrents.peers': order};
    }
    MovieInfos.search(query, options, (err, movies) => {
        res.json(movies);
    });
}
;

function live(hash) {
    if (global.PROCESS_ARRAY[hash]) {
        global.PROCESS_ARRAY[hash].live = Math.floor(Date.now() / 1000);
        return global.PROCESS_ARRAY[hash].status;
    }
    return null;
}

exports.liveTorrent = function (req, res) {
    res.json({status: live(req.params.hash)});
};

function stop(hash) {
    console.log(`FFMPEG - killing process of hash: ${hash}`);
    const process = global.PROCESS_ARRAY[hash];
    if (process && process.engine && process.process) {
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
    let timeout = 2;
    // PROCESS_ARRAY status is [init, ready, progress, stream, stop]
    if (!global.PROCESS_ARRAY[req.params.hash]) {
        global.PROCESS_ARRAY[req.params.hash] = {status: 'init'};
    }
    // Adds a view to the user collection
    if (req.body.imdbid) {
        User.addView({imdbid: req.body.imdbid, user_id: req.userdata._id}, (success, msg) => {
        });
    }

    MovieInfos.get({'torrents.hash': req.params.hash}, (err, torrent) => {
        let magnet = '';
        torrent.torrents.forEach((el) => {
            if (el.hash === req.params.hash) {
                magnet = el.magnet;
            }
        });
        if (err) {
            res.json({err: err, msg: 'MONGOOSE: Could not find movie'});
            return;
        }
        try {
            let mytorrent = parseTorrent(magnet);
            mytorrent.name = 'Url Encoded Movie Name';
            mytorrent.dn = 'Url Encoded Movie Name';
        } catch (err) {
            console.log('TORRENTSTREAM: Could not parse magnet');
            res.json({error: err, msg: 'Could not parse magnet'});
            return;
        }
        // Only if this torrent has not been downloaded and converted
        let engine = null;
        if (global.PROCESS_ARRAY[req.params.hash].status === 'init' || global.PROCESS_ARRAY[req.params.hash].status === 'stopped') {
            engine = torrentStream(magnet, {path: './../films/' + req.params.hash + '/torrent'});
            let stream;
            setTimeout(() => {
                if (timeout > 1 && !sent) {
                    console.log('TORRENTSTREAM: Timeout');
                    stop(req.params.hash);
                    global.PROCESS_ARRAY[req.params.hash] = null;
                    res.json({error: true, msg: 'Torrent Timed out'});
                    sent = true;
                }
            }, 25000);
            setTimeout(() => {
                if (timeout > 0 && !sent) {
                    console.log('FFMPEG: Timeout');
                    stop(req.params.hash);
                    global.PROCESS_ARRAY[req.params.hash] = null;
                    res.json({error: true, msg: 'Torrent Timed out'});
                    sent = true;
                }
            }, 60000);
            engine.on('ready', function () {
                if (global.PROCESS_ARRAY[req.params.hash]) {
                    // Find the video file
                    global.PROCESS_ARRAY[req.params.hash].engine = engine;
                    global.PROCESS_ARRAY[req.params.hash].status = 'ready';
                    engine.files.forEach(function (file) {
                        file.deselect();
                        if (file.name.substr(file.name.length - 3) === 'mkv' || file.name.substr(file.name.length - 3) === 'mp4') {
                            diskspace.check('./', function (err, info) {
                                if (info.free < 2 * file.length && !sent) {
                                    res.json({error: true, msg: 'The server disk is full'});
                                    stop(req.params.hash);
                                    delete global.PROCESS_ARRAY[req.params.hash];
                                    sent = true;
                                }
                            });
                            if (!fs.existsSync('../films/' + req.params.hash)) {
                                fs.mkdirSync('../films/' + req.params.hash);
                            }
                            file.path = req.params.hash + '/' + file.name;

                            // create stream to torrent file
                            stream = file.createReadStream();
                        }
                    });
                }
                // This torrent is now live for 20s
                live(req.params.hash);
                // Launch new process
                if (stream) {
                    global.PROCESS_ARRAY[req.params.hash].process = ffmpeg(stream, {timeout: 432000})
                        .addOptions([
                            '-profile:v main',
                            '-level 3.0',
                            '-start_number 0',
                            '-hls_list_size 0',
                            '-hls_time 10',
                            '-threads 3',
                            '-f hls',
                            '-g 48',
                            '-keyint_min 48',
                            '-c:a libmp3lame',
                            '-b:a 192k',
                            '-sn'
                        ])
                        .on('start', () => {
                            if (global.PROCESS_ARRAY[req.params.hash]) {
                                global.PROCESS_ARRAY[req.params.hash].status = 'progress';
                            }
                        })
                        .on('progress', (data) => {
                            timeout = 0;
                            console.log('FFMPEG - progress:', data.frames,
                                ', hash:', req.params.hash);
                            // Save progress to launch stream on live
                            if (data.frames >= 1000 && !sent) {
                                global.PROCESS_ARRAY[req.params.hash].status = 'stream';
                                res.json({path: '/' + req.params.hash + '/output.m3u8'});
                                sent = true;
                            }
                            if ((Date.now() / 1000) - global.PROCESS_ARRAY[req.params.hash].live > 30) {
                                stop(req.params.hash)
                            }
                        })
                        .on('end', () => {
                            global.PROCESS_ARRAY[req.params.hash].status = 'stream';
                        })
                        .on('error', (err) => {
                                if (!sent) {
                                    console.log('FFMPEG: An Error happened');
                                    stop(req.params.hash);
                                    res.json({error: err, msg: 'FFMPEG: Error'});
                                    sent = true;
                                }
                            }
                        )
                        .save('../films/' + req.params.hash + '/output.m3u8');
                } else if (!sent)
                {
                    console.log('TORRENT-STREAM: This torrent is not valid');
                    global.PROCESS_ARRAY[req.params.hash] = null;
                    stop(req.params.hash);
                    res.json({error: true, msg: 'Could not parse torrent file'});
                    sent = true;
                }
            });

            engine.on('download', function () {
                if (timeout === 2) {
                    timeout = 1;
                }
                // Don't throw timeout error
                console.log('TORRENT - progress:', engine.swarm.downloaded,
                    ', hash:', req.params.hash);
                // Monitor last live on torrent to suspend download and conversion
                console.log('TORRENT - live:', Math.floor(Date.now() / 1000) - global.PROCESS_ARRAY[req.params.hash].live);
                if ((Date.now() / 1000) - global.PROCESS_ARRAY[req.params.hash].live > 30) {
                    stop(req.params.hash)
                }
            });

            engine.on('idle', function () {
                if (global.PROCESS_ARRAY[req.params.hash]) {
                    console.log('TORRENT - live:', Math.floor(Date.now() / 1000) - global.PROCESS_ARRAY[req.params.hash].live);
                    if ((Date.now() / 1000) - global.PROCESS_ARRAY[req.params.hash].live > 30) {
                        stop(req.params.hash)
                    }
                }
            });


        }
        else {
            if (!sent) {
                res.json({path: '/' + req.params.hash + '/output.m3u8'});
                // Sent boolean prevents double sending
                sent = true;
            }
        }
    })
    ;

}
;
