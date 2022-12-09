const express = require('express'),
    morgan = require('morgan');
// fs = require('fs'), //import built in node modules fs and path
// path = require('path');
const res = require("express/lib/response");

const app = express();
const bodyParser = require('body-parser'),
    methodOverride = require('method-override');
const res = require('express/lib/response');
// create a write stream (in append mode)
// a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })


let topMovies = [
    {
        title: 'The Holiday',
        genre: 'Romance/Comedy',
        director: 'Nancy Meyers'
    },
    {
        title: 'Eternal Sunshine of the Spotless Mind',
        genre: 'Romance/Sci-fi',
        director: 'Michel Gondry'
    },
    {
        title: 'Dark Shadows',
        genre: 'Fantasy/Comedy',
        director: 'Tim Burton'
    },
    {
        title: 'Inception',
        genre: 'Action/Sci-fi',
        director: 'Christopher Nolan'
    },
    {
        title: 'Interstellar',
        genre: 'Sci-fi/Adventure',
        director: 'Christopher Nolan'
    },
    {
        title: 'The Wolf of Wall Street ',
        genre: 'Comedy/Drama',
        director: 'Martin Scorsese'
    },
    {
        title: 'Doctor Strange',
        genre: 'Action/Adventure',
        director: 'Scott Derrickson'
    },
    {
        title: 'Miss Sloane',
        genre: 'Thriller/Drama',
        director: 'John Madden'
    },
    {
        title: 'American Beauty',
        genre: 'Romance/Drama',
        director: 'Sam Mendes'
    },
    {
        title: 'Something\'s Gotta Give',
        genre: 'Romance/Comedy',
        director: 'Nancy Meyers'
    },
];

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
//setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
});

app.use('/movies', express.static('public'));

// GET requests
app.get('/movies ', (req, res) => {
    res.json(topMovies);
});

app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies ', (req, res) => {
    res.json(topMovies);
});
//

// listen for requests 
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
}); 
