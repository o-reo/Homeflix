let express = require('express');
let mongoose = require('mongoose');
let bodyparser = require('body-parser');
let cors = require('cors');
let path = require('path');
const passport = require('passport');
const config = require('./config/database');
const route_user = require('./routes/user');
const route_torrent = require('./routes/torrent');
const route_torrents = require('./routes/torrents');
const route_subtitles = require('./routes/subtitles');

let app = express();

const port = 3000;

//static files
app.use(express.static(path.join(__dirname, 'public')));


mongoose.set('useCreateIndex', true);

//connect to mongodb
mongoose.connect(config.database, {useNewUrlParser: true});

//on connection
mongoose.connection.on('connected', () => {
    console.log('Log: Mongodb connected on port:', '27017');
});

//on error connection
mongoose.connection.on('error', (err) => {
    if (err) {
        console.log('Log: Mongodb connection error: ' + err);
    }
});


//body - parser
app.use(bodyparser.json({}));
app.use(bodyparser.urlencoded({
    extended: true
}));

// Passport Middleware
app.use(passport.initialize({}));
app.use(passport.session({}));

require('./config/passport_setup')(passport);

//adding middleware - cors for cross origin
app.use(cors());

//routes
app.use('/torrent', route_torrent);
app.use('/torrents', route_torrents);
app.use('/subtitles', route_subtitles);
app.use('/user', route_user);

app.listen(port, () => {
    console.log('Log: Server listening on port: ' + port);
});