const OS = require('opensubtitles-api');
const srt2vtt = require('srt-to-vtt');
const fs = require('fs');
const http = require('http');

const OpenSubtitles = new OS({
    useragent: 'TemporaryUserAgent'
});

exports.getSubtitles = function (req, res) {
    let lang = 'eng';
    if (req.query.lang) {
        lang = req.query.lang;
    }
    let search_array = {
        sublanguageid: lang,
        imdbid: req.query.imdbid
    };
    if (req.query.filesize) {
        search_array.filesize = req.query.filesize;
    }
    if (req.query.season) {
        search_array.season = req.query.season;
    }
    if (req.query.episode) {
        search_array.episode = req.query.episode;
    }
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
                    res.json({path: 'subtitles/' + uniqid + '.vtt', lang: lang});
                })
                .catch(error => {
                    res.json({error: error, query: req.query});
                })
        })
        .catch(error => {
            res.json({error: error, query: req.query});
        })
};
