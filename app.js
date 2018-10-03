var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var cors = require('cors');
var path = require('path');
var ejs = require('ejs');
var session = require('express-session');
const passport = require('passport');
const fs = require('fs');

var app = express();

const route = require('./routes/route');
const port = 3000;

//static files
app.use(express.static(path.join(__dirname, 'public')));

//Use express session support for OAuth2 require it
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//connect to mongodb
mongoose.connect('mongodb://localhost:27017/contactlist');

//on connection
mongoose.connection.on('connected', () => {
    console.log('Connected to mangodb at port : 27017');
});

//on error connection
mongoose.connection.on('error', (err) => {
    if (err) {
        console.log('Error to mangodb connexion : ' + err);
    }
});


//body - parser
app.use(bodyparser.json({

}));
app.use(bodyparser.urlencoded({
    extended: true
}));


app.set('view engine', 'ejs');

//adding middleware - cors
app.use(cors());


//routes
app.use('/api', route);

//testing Server
/*app.get('/test', (req, res) => {
    res.send('foobar');
});*/

app.get('/streaming/:file', (req, res) => {
    var film = req.params.file;

    var path = './films/' + film;
    var stat = fs.statSync(path);
    var total = stat.size;
    if (req.headers['range']) {
        var range = req.headers.range;
        var parts = range.replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];

        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : total-1;
        var chunksize = (end-start)+1;
        console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);


        var file = fs.createReadStream(path, {start: start, end: end});
        res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
        file.pipe(res);
    } else {
        console.log('ALL: ' + total);
        res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
        var file = fs.createReadStream(path);
        file.pipe(res);
    }
});

app.get('/streaming/:directory/:file', (req, res) => {
    var film = req.params.file;

    var path = './films/'  + req.params.directory + '/' + film;
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1
        const chunksize = (end-start)+1
        const file = fs.createReadStream(path, {start, end})
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
})

app.listen(port, ()=>{
    console.log('Server started atport:' + port);
});
