const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const path = require('path');
const schedule = require('node-schedule');
const setup = require('./controllers/setup');

const route_user = require('./routes/user');
const route_users = require('./routes/users');
const route_torrent = require('./routes/torrent');
const route_torrents = require('./routes/torrents');
const route_subtitles = require('./routes/subtitles');
const route_setup = require('./routes/setup');

let app = express();

const port = 3000;

//static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));


//body - parser
app.use(bodyparser.json({}));
app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(require('morgan')('combined'));

//adding middleware - cors for cross origin
app.use(cors());

//routes
app.use('/torrent', route_torrent);
app.use('/user', route_user);
app.use('/users', route_users);
app.use('/torrents', route_torrents);
app.use('/subtitles', route_subtitles);
app.use('/setup', route_setup);

app.get('*', function(req, res){
    res.sendfile('server/public/index.html');
});

// Empty current ffmpeg process array
global.PROCESS_ARRAY = {};

app.listen(port, () => {
    console.log('Log: Server listening on port:', port);
});

// HLS Server for streaming movies
let HLSServer = require('hls-server');
let http = require('http');

let server = http.createServer();

let hls = new HLSServer(server, {
    path: '/streams', // Base URI to output HLS streams
    dir: 'films' // Directory that input files are stored
});

server.listen(8000, () => {
    console.log('Log: Streaming server listens on port:', 8000);
});

let cleaning = schedule.scheduleJob({hour: 12, minute: 0}, () => {
        console.log('TASK: Cleaning old movies');
        setup.cleanMovies();
});