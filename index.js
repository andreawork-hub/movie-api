const express = require('express');
const bodyParser = require('body-parser'),
    methodOverride = require('method-override');
const morgan = require('morgan');
const app = express();

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
app.use(express.static('public'));
app.use(morgan('common'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());





app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// listen for requests 
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
}); 
