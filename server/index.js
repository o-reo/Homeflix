const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const path = require('path');

const route_user = require('./routes/user');
const route_users = require('./routes/users');
const route_torrent = require('./routes/torrent');
const route_torrents = require('./routes/torrents');
const route_subtitles = require('./routes/subtitles');
const route_setup = require('./routes/setup');

let app = express();

global.PROCESS_ARRAY = {};

const port = 3000;

//static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));
app.use('/streams', express.static(path.join(__dirname, 'streams')));


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

app.listen(port, () => {
    console.log('Log: Server listening on port:', port);
});