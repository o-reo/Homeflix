let express = require('express');
let mongoose = require('mongoose');
let bodyparser = require('body-parser');
let cors = require('cors');
let path = require('path');
let session = require('express-session');
const fs = require('fs');
let jsonwebtoken = require('jsonwebtoken');

const api = require('./routes/api');

let app = express();

const port = 3000;

app.use(function (req, res, next) {
    console.log('Log: API is being accessed');
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', function (err, decode) {
            if (err) req.user = undefined;
            req.user = decode;
            next();
        });
    } else {
        req.user = undefined;
        next();
    }
});

//static files
app.use(express.static(path.join(__dirname, 'public')));

//Use express session support for OAuth2 require it
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

mongoose.set('useCreateIndex', true);

//connect to mongodb
mongoose.connect('mongodb://localhost:27017/contactlist', {useNewUrlParser: true});

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


app.set('view engine', 'ejs');

//adding middleware - cors for cross origin
app.use(cors());

//routes
app.use('/api', api);

app.listen(port, () => {
    console.log('Log: Server listening on port: ' + port);
});