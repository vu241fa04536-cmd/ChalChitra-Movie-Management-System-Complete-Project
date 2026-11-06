const User = require('../models/User');
const Movie = require('../models/Movie');

// Helper to resolve movie ID (whether MongoDB ObjectId or legacy integer ID)
const resolveMovie = async (movieId) => {
  if (!movieId) return null;
  const strId = String(movieId).trim();
  if (strId.match(/^[0-9a-fA-F]{24}$/)) {
    return await Movie.findById(strId);
  }
  const parsedInt = parseInt(strId, 10);
  if (!Number.isNaN(parsedInt)) {
    return await Movie.findOne({ legacyId: parsedInt });
  }
  return null;
};

// @desc    Get current user's watchlist
// @route   GET /api/users/watchlist
// @access  Private (User)
const getWatchlist = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required to view your watchlist' });
    }
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Personal cinephile account required. Administrator accounts do not hold personal watchlists.' });
    }

    const user = await User.findById(req.user._id).populate('watchlist');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(user.watchlist || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle movie in watchlist (add if absent, remove if present)
// @route   POST /api/users/watchlist/:movieId
// @access  Private (User)
const toggleWatchlist = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required to modify your watchlist' });
    }
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Personal cinephile account required. Administrator accounts do not hold personal watchlists.' });
    }

    const { movieId } = req.params;
    const movie = await resolveMovie(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found in cinematic archive' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    user.watchlist = user.watchlist || [];
    const index = user.watchlist.findIndex((id) => id && id.toString() === movie._id.toString());

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
      message: isAdded ? 'Movie added to your watchlist' : 'Movie removed from your watchlist',
      isAdded,
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's favorites
// @route   GET /api/users/favorites
// @access  Private (User)
const getFavorites = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required to view your favorites' });
    }
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Personal cinephile account required. Administrator accounts do not hold personal favorites.' });
    }

    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(user.favorites || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle movie in favorites (add if absent, remove if present)
// @route   POST /api/users/favorites/:movieId
// @access  Private (User)
const toggleFavorites = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required to modify your favorites' });
    }
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Personal cinephile account required. Administrator accounts do not hold personal favorites.' });
    }

    const { movieId } = req.params;
    const movie = await resolveMovie(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found in cinematic archive' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    user.favorites = user.favorites || [];
    const index = user.favorites.findIndex((id) => id && id.toString() === movie._id.toString());

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
      message: isAdded ? 'Movie added to your favorites' : 'Movie removed from your favorites',
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
