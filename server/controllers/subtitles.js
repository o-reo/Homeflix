const OS = require('opensubtitles-api');
var srt2vtt = require('srt-to-vtt');

const OpenSubtitles = new OS({
    useragent: 'TemporaryUserAgent'
});

exports.getSubtitles = function (req, res) {
    console.log(req.query);
    let lang = 'eng';
    if (req.query.lang) {
        lang = req.query.lang;
    }
    let search_array = {
        sublanguageid: lang,
        extensions: ['srt']
    };
    if (req.query.filesize) {
        search_array.filesize = req.query.filesize;
    }
    if (req.query.filesize) {
        search_array.imdbid = req.query.imdbid;
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
                    console.log('debug output:', {
                        path: './../client/src/assets/subtitles/' + uniqid + '.vtt',
                        lang: lang
                    });
                    res.json({path: 'subtitles/' + uniqid + '.vtt', lang: lang});
                })
                .catch(error => {
                    console.log('error');
                    res.json({error: error, query: req.query});
                })
        })
        .catch(error => {
            console.log('error');
            res.json({error: error, query: req.query});
        })
};
