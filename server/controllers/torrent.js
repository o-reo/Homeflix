const torrentStream = require('torrent-stream');
const fs = require("fs"); //Load the filesystem module
const MovieInfos = require('../models/movie-infos');
const User = require('../models/user');
const ffmpeg = require('fluent-ffmpeg');
const parseTorrent = require('parse-torrent');

exports.getTorrents = function (req, res) {
    let order = 1;
    let query = {};
    let options = {};
    let genre = '*';
    let casting = '*';

    // Query part.
    if (req.query.title && req.query.title.charAt(0) !== '*') {
        query.title = {$regex: req.query.title, $options: 'i'}
    }
    if (req.query.casting && req.query.casting !== '*') {
        query = Object.assign({"cast.name": {$regex: req.query.casting, $options: 'i'}}, query);
    }
    if (req.query.genre)
        genre = req.query.genre;
    if (genre !== '*') {
        query.genres = {$all: [genre]};
    }
    if (req.query.minYear && req.query.maxYear) {
        query.year = {$gte: req.query.minYear, $lte: req.query.maxYear};
    }
    if (req.query.minRating && req.query.maxRating) {
        query.rating = {$gte: req.query.minRating, $lte: req.query.maxRating};
    }
    if (req.query.type) {
        query.type = {$in: req.query.type};
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
    MovieInfos.paginate(query, options, function (err, movies) {
        res.json(movies.docs);
    });
}
;

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
    let timeout = 2;

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
        if (!global.PROCESS_ARRAY[req.params.hash] || global.PROCESS_ARRAY[req.params.hash].status === 'stopped') {
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
            }, 10000);
            setTimeout(() => {
                if (timeout > 0 && !sent) {
                    console.log('FFMPEG: Timeout');
                    stop(req.params.hash);
                    global.PROCESS_ARRAY[req.params.hash] = null;
                    res.json({error: true, msg: 'Torrent Timed out'});
                    sent = true;
                }
            }, 30000);
            engine.on('ready', function () {
                // Find the video file
                global.PROCESS_ARRAY[req.params.hash] = {engine: engine, status: 'ready'};
                engine.files.forEach(function (file) {
                    if (file.name.substr(file.name.length - 3) === 'mkv' || file.name.substr(file.name.length - 3) === 'mp4') {
                        if (!fs.existsSync('../films/' + req.params.hash)) {
                            fs.mkdirSync('../films/' + req.params.hash);
                        }
                        file.path = req.params.hash + '/' + file.name;

                        // create stream to torrent file
                        stream = file.createReadStream();
                        // initialize process entry
                    } else {
                        file.deselect();
                    }
                });

                // This torrent is now live for 20s
                live(req.params.hash);
                // Launch new process
                if (stream) {
                    global.PROCESS_ARRAY[req.params.hash].process = ffmpeg(stream, {timeout: 432000})
                        .addOptions([
                            '-profile:v baseline',
                            '-level 3.0',
                            '-start_number 0',
                            '-hls_list_size 0',
                            '-hls_time 10',
                            '-threads 3',
                            '-f hls',
                            '-c:a aac',
                            '-b:a 192k'
                        ])
                        .on('start', () => {
                            global.PROCESS_ARRAY[req.params.hash].status = 'in progress';
                        })
                        .on('progress', (data) => {
                            timeout = 0;
                            console.log('FFMPEG - progress:', data.frames,
                                ', hash:', req.params.hash);
                            if (data.frames >= 1000 && !sent) {
                                res.json({path: '/' + req.params.hash + '/output.m3u8'});
                                sent = true;
                            }
                            if ((Date.now() / 1000) - global.PROCESS_ARRAY[req.params.hash].live > 30) {
                                stop(req.params.hash)
                            }
                        })
                        .on('end', () => {
                            global.PROCESS_ARRAY[req.params.hash].status = 'done';
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
                } else {
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
