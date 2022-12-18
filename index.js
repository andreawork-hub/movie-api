const express = require('express');
const bodyParser = require('body-parser');

const uuid = require('uuid');
const morgan = require('morgan');
const app = express();

app.use(bodyParser.json());

let users = [
    {
        Id: 1,
        Name: 'Anna',
        FavoriteMovies: ['The Holiday']

    },
    {
        Id: 2,
        Name: 'Peter',
        FavoriteMovies: ['Interstellar']

    },
]

let topMovies = [
    {
        Title: 'The Holiday',
        Genre: {
            Name: 'Romance',
            Description: 'Lorem Ipsum '
        },
        Director: {
            Name: 'Nancy Meyers',
            Description: 'Lorem Ipsum '
        },
    },
    {
        Title: 'Eternal Sunshine of the Spotless Mind',
        Genre: {
            Name: 'Sci-fi',
            Description: 'Lorem Ipsum '
        },
        Director: {
            Name: 'Michel Gondry',
            Description: 'Lorem Ipsum '
        },
    },
    {
        Title: 'Dark Shadows',
        Genre: {
            Name: 'Fantasy',
            Description: 'Lorem Ipsum '
        },
        Director: {
            Name: 'Tim Burton',
            Description: 'Lorem Ipsum '
        },
    },
    {
        Title: 'Inception',
        Genre: {
            Name: 'Sci-fi',
            Description: 'Lorem Ipsum '
        },
        Director: {
            Name: 'Christopher Nolan',
            Description: 'Lorem Ipsum '
        },
    },
    {
        Title: 'Interstellar',
        Genre: {
            Name: 'Sci-fi',
            Description: 'Lorem Ipsum '
        },
        Director: {
            Name: 'Christopher Nolan',
            Description: 'Lorem Ipsum '
        },
    },
    {
        Title: 'The Wolf of Wall Street',
        Genre: {
            Name: 'Comedy',
            Description: 'Lorem Ipsum '
        },
        Director: {
            Name: 'Martin Scorsese',
            Description: 'Lorem Ipsum '
        },
    },
    {
        Title: 'Doctor Strange',
        Genre: {
            Name: 'Adventure',
            Description: 'Lorem Ipsum '
        },
        Director: {
            Name: 'Scott Derrickson',
            Description: 'Lorem Ipsum '
        },
    },
    {
        Title: 'Miss Sloane',
        Genre: {
            Name: 'Thriller',
            Description: 'Lorem Ipsum '
        },
        Director: {
            Name: 'John Madden',
            Description: 'Lorem Ipsum '
        },
    },
    {
        Title: 'American Beauty',
        Genre: {
            Name: 'Drama',
            Description: 'Lorem Ipsum '
        },
        Director: {
            Name: 'Sam Mendes',
            Description: 'Lorem Ipsum '
        },
    },
    {
        title: 'Something\'s Gotta Give',
        Genre: {
            Name: 'Comedy',
            Description: 'Lorem Ipsum '
        },
        Director: {
            Name: 'Nancy Meyers',
            Description: 'Lorem Ipsum '
        },
    }
];
app.use(express.static('public'));
app.use(morgan('common'));

app.use(bodyParser.urlencoded({
    extended: true
}));






app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

// CREATE USER 
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.Name) {
        newUser.Id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    } else {
        res.status(400).send('users need names');
    }
})

// UPDATE USER 
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.Id == id);

    if (user) {
        user.Name = updatedUser.Name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user');
    }
})

// CREATE MOVIE TITLE 
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;


    let user = users.find(user => user.Id == id);

    if (user) {
        user.FavoriteMovies.push(movieTitle);
        res.status(200).send('${movieTitle} has been added to user ${id}\'s array');
    } else {
        res.status(400).send('no such user');
    }
})


// DELETE MOVIE TITLE 
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;


    let user = users.find(user => user.Id == id);

    if (user) {
        user.FavoriteMovies = user.FavoriteMovies.filter(title => title !== movieTitle);
        res.status(200).send('${movieTitle} has been removed from ${id}\'s array');
    } else {
        res.status(400).send('no such user');
    }
})

// DELETE MOVIE TITLE 
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;


    let user = users.find(user => user.Id == id);

    if (user) {
        users = users.filter(user => user.Id != id);
        res.status(200).send('user ${id} has been deleted');
    } else {
        res.status(400).send('no such user');
    }
})

// READ ALL MOVIES 
app.get('/movies', (req, res) => {
    res.status(200).json(topMovies);
})
// READ BY TITLE 
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = topMovies.find(movie => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).json('no such movie')
    }
})
// READ BY GENRE
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = topMovies.find(movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).json('no such genre')
    }
})
// READ BY DIRECTOR
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = topMovies.find(movie => movie.Director.Name === directorName).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).json('no such director')
    }
})

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
