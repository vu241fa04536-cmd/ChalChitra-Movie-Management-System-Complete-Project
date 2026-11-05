const User = require('../models/User');
const Movie = require('../models/Movie');

// Helper to resolve movie ID (whether mongo ObjectId or legacyId)
const resolveMovie = async (movieId) => {
  if (movieId.match(/^[0-9a-fA-F]{24}$/)) {
    return await Movie.findById(movieId);
  }
  return await Movie.findOne({ legacyId: parseInt(movieId) });
};

// @desc    Get current user's watchlist
// @route   GET /api/users/watchlist
// @access  Private
const getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('watchlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.watchlist || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle movie in watchlist (add if not present, remove if present)
// @route   POST /api/users/watchlist/:movieId
// @access  Private
const toggleWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const movie = await resolveMovie(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const user = await User.findById(req.user._id);
    const index = user.watchlist.findIndex((id) => id.toString() === movie._id.toString());

    let isAdded = false;
    if (index > -1) {
      user.watchlist.splice(index, 1);
      isAdded = false;
    } else {
      user.watchlist.push(movie._id);
      isAdded = true;
    }

    await user.save();
    res.json({
      message: isAdded ? 'Movie added to watchlist' : 'Movie removed from watchlist',
      isAdded,
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.favorites || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle movie in favorites (add if not present, remove if present)
// @route   POST /api/users/favorites/:movieId
// @access  Private
const toggleFavorites = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const movie = await resolveMovie(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const user = await User.findById(req.user._id);
    const index = user.favorites.findIndex((id) => id.toString() === movie._id.toString());

    let isAdded = false;
    if (index > -1) {
      user.favorites.splice(index, 1);
      isAdded = false;
    } else {
      user.favorites.push(movie._id);
      isAdded = true;
    }

    await user.save();
    res.json({
      message: isAdded ? 'Movie added to favorites' : 'Movie removed from favorites',
      isAdded,
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWatchlist,
  toggleWatchlist,
  getFavorites,
  toggleFavorites,
};
