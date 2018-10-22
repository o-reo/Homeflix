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
const route_comments = require('./routes/comments');
const route_comment = require('./routes/comment');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();

const DIR = './profil_pictures';

let app = express();

const port = 3000;

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname));
    }
});
let upload = multer({storage: storage});

//static files
app.use(express.static(path.join(__dirname, 'public')));


mongoose.set('useCreateIndex', true);

//connect to mongodb
mongoose.connect(config.database, {useNewUrlParser: true});

//on connection
mongoose.connection.on('connected', () => {
    console.log('Log: Mongodb connected on port:', '27017');
});

app.get('/', function (req, res) {
    res.end('file catcher example');
});

app.post('/upload',upload.single('photo'), function (req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false
        });

    } else {
        console.log('file received');
        return res.send({
            success: true
        })
    }
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
app.use('/comment', route_comment);
app.use('/comments', route_comments);

app.listen(port, () => {
    console.log('Log: Server listening on port: ' + port);
});
