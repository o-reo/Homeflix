const https = require('https');
const torrentStream = require('torrent-stream');

exports.getTorrent = function (req, res) {
    var get_query = '';
    if (req.params.title.charAt(0) != '*')
        get_query = 'https://yts.am/api/v2/list_movies.json?query_term=\' + req.params.title + \'&with_images=true&with_cast=true';
    else {
        get_query = 'https://yts.am/api/v2/list_movies.json?limit=48' + req.params.title.substring(1) + '&with_images=true&with_cast=true';
        console.log(get_query);
    }
    https.get(get_query, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            res.json(data);
        });

    }).on("error", (err) => {
        res.json(err);
    });
};

exports.streamTorrent = function (req, res) {
    var magnet = 'magnet:?xt=urn:btih:'
        + req.params.hash
        + '&dn=Url+Encoded+Movie+Name&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce';
    var engine = torrentStream(magnet, {path: './films'});
    console.log('Waiting download ... ');
    engine.on('ready', function (){
        console.log('Start Download ...');
       engine.files.forEach(function(file){
           if (file.name.substr(file.name.length - 3) === 'mkv' || file.name.substr(file.name.length - 3) === 'mp4') {
               console.log('Stream en cours ...: ', file.name);
               var stream = file.createReadStream();
               var path = file.path;
               console.log('path:', file.path);
               res.json({path: path})
           }
       });
    });

    engine.on('download', function(data){
        console.log('--piece downloaded: ', data);
    });

    engine.on('idle', function() {
        console.log('end download');
    });
};