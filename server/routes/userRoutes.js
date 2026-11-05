const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  toggleWatchlist,
  getFavorites,
  toggleFavorites,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/watchlist', protect, getWatchlist);
router.post('/watchlist/:movieId', protect, toggleWatchlist);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:movieId', protect, toggleFavorites);

module.exports = router;
