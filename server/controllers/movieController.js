const Movie = require('../models/Movie');

// @desc    Get all movies with filtering, search, and sorting
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, type, status, sort, minRating } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { genre: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (genre && genre !== 'all' && genre !== '') {
      query.genre = { $regex: new RegExp(`^${genre}$`, 'i') };
    }

    if (language && language !== 'all' && language !== '') {
      query.language = { $regex: new RegExp(`^${language}$`, 'i') };
    }

    if (type && type !== 'all' && type !== '') {
      query.type = type.toLowerCase();
    }

    if (status && status !== 'all' && status !== '') {
      query.status = status.toLowerCase();
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'recent' || sort === 'newest') {
      sortOption = { uploadDate: -1, createdAt: -1 };
    } else if (sort === 'ratingDesc') {
      sortOption = { rating: -1 };
    } else if (sort === 'ratingAsc') {
      sortOption = { rating: 1 };
    } else if (sort === 'yearDesc') {
      sortOption = { releaseYear: -1 };
    } else if (sort === 'titleAsc') {
      sortOption = { title: 1 };
    }

    const movies = await Movie.find(query).sort(sortOption);
    res.json(movies);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID (supports MongoDB _id or legacy integer ID)
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let movie;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(id);
    } else {
      movie = await Movie.findOne({ legacyId: parseInt(id) });
    }

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      genre,
      language,
      releaseYear,
      rating,
      duration,
      description,
      poster,
      trailer,
      status,
      type,
      watchLinks,
    } = req.body;

    if (!title || !genre || !releaseYear || !poster || !description || !description.trim()) {
      return res.status(400).json({ message: 'Title, genre, release year, poster URL, and description are required' });
    }

    const movie = await Movie.create({
      title: title.trim(),
      genre: genre.trim(),
      language: language ? language.trim() : 'English',
      releaseYear: Number(releaseYear),
      rating: rating ? Number(rating) : 0,
      duration: duration ? duration.trim() : '120 min',
      description: description.trim(),
      poster: poster.trim(),
      trailer: trailer ? trailer.trim() : '',
      status: status || 'released',
      type: type || 'movie',
      uploadDate: new Date(),
      watchLinks: watchLinks || {
        youtube: 'https://www.youtube.com',
        netflix: 'https://www.netflix.com',
        hotstar: 'https://www.hotstar.com',
      },
    });

    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    if (req.body.description !== undefined && typeof req.body.description === 'string' && !req.body.description.trim()) {
      return res.status(400).json({ message: 'Movie description cannot be empty' });
    }

    const { id } = req.params;
    let movie;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(id);
    } else {
      movie = await Movie.findOne({ legacyId: parseInt(id) });
    }

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const fields = [
      'title',
      'genre',
      'language',
      'releaseYear',
      'rating',
      'duration',
      'description',
      'poster',
      'trailer',
      'status',
      'type',
      'watchLinks',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'releaseYear' || field === 'rating') {
          movie[field] = Number(req.body[field]);
        } else {
          movie[field] = req.body[field];
        }
      }
    });

    const updatedMovie = await movie.save();
    res.json(updatedMovie);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    let movie;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(id);
    } else {
      movie = await Movie.findOne({ legacyId: parseInt(id) });
    }

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await Movie.deleteOne({ _id: movie._id });
    res.json({ message: 'Movie removed successfully', id: movie._id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
