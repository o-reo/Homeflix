const fs = require("fs"); //Load the filesystem module

exports.getStream = function (req, res) {
    let film = req.params.file;

    let path = './../films/' + film;
    let stat = fs.statSync(path);
    let total = stat.size;
    if (req.headers['range']) {
        let range = req.headers.range;
        let parts = range.replace(/bytes=/, "").split("-");
        let partialstart = parts[0];
        let partialend = parts[1];

        let start = parseInt(partialstart, 10);
        let end = partialend ? parseInt(partialend, 10) : total - 1;
        let chunksize = (end - start) + 1;
        console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);


        file = fs.createReadStream(path, {start: start, end: end});
        res.writeHead(206, {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'
        });
        file.pipe(res);
    } else {
        console.log('ALL: ' + total);
        res.writeHead(200, {'Content-Length': total, 'Content-Type': 'video/mp4'});
        let file = fs.createReadStream(path);
        file.pipe(res);
    }
};

exports.getStreamDirectory = function (req, res) {
    let film = req.params.file;

    let path = './../films/' + req.params.directory + '/' + film;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(path, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res)
    }
};