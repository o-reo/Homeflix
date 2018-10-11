const https = require('https');
const http = require('http');
const torrentStream = require('torrent-stream');
var request = require('request');
const OS = require('opensubtitles-api');
const fs = require("fs"); //Load the filesystem module
var srt2vtt = require('srt-to-vtt');

const OpenSubtitles = new OS({
    useragent: 'TemporaryUserAgent'
});

exports.getSubtitles = function (req, res) {
    let lang = 'eng';
    if (req.query.lang){
        lang = req.query.lang;
    }
    let search_array = {
        imdbid: req.params.imdbid,
        sublanguageid: lang,
        extensions: ['srt']
    };
    OpenSubtitles.login()
        .then(result => {
            OpenSubtitles.search(search_array)
                .then(subtitles => {
                    let uniqid = (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16);
                    let sub_file = fs.createWriteStream('subtitles/'+ uniqid +'.vtt');
                    req = http.get(subtitles[Object.keys(subtitles)[0]]['url'], function (response) {
                        response
                            .pipe(srt2vtt())
                            .pipe(sub_file);
                    });
                    console.log('debug output:', {path: 'subtitles/'+ uniqid +'.vtt', lang: lang});
                    res.json({path: 'subtitles/'+ uniqid +'.vtt', lang: lang});
                })
                .catch(error => {
                    console.log('error');
                    res.json({error: error, imdbid: req.params.imdbid, lang: lang});
                })
        })
        .catch(error => {
            res.json({error: error, imdbid: req.params.imdbid, lang: lang});
        })
};

exports.getTorrent = function (req, res) {
    var get_query = '';
    if (req.params.api === 'yts') {
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
    }
    console.log(get_query);
    request(get_query, function (error, response, body) {
        console.log(body);
        res.json(body);
    });
    /* https.get(get_query, (resp) => {
         let data = '';

         // A chunk of data has been recieved.
         resp.on('data', (chunk) => {
             data += chunk;
         });

         // The whole response has been received. Print out the result.
         resp.on('end', () => {
             console.log(data);
             res.json(data);
         });

     }).on("error", (err) => {
         res.json(err);
     }); */
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
        if (data > 20) {
            const stats = fs.statSync('films/' + path);
            const fileSizeInBytes = stats.size;
//Convert the file size to megabytes (optional)
            const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
            if (fileSizeInMegabytes >= 50 && !sending) {
                res.json({path: path});
                sending = true;
                console.log('piece telechargee, diffusion du stream !');
            }
            console.log('SIZE: ', fileSizeInMegabytes);
        }
    });

    engine.on('idle', function () {
        console.log('end download');
    });
};