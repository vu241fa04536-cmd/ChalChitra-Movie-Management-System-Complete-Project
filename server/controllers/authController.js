const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'chalchitra_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const userExists = await User.findOne({ username: username.trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this username' });
    }

    const user = await User.create({
      username: username.trim(),
      password,
      email: email ? email.trim() : undefined,
      role: 'user',
      watchlist: [],
      favorites: [],
    });

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      watchlist: user.watchlist,
      favorites: user.favorites,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.trim() });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken({ id: user._id, role: user.role });
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        watchlist: user.watchlist,
        favorites: user.favorites,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Admin authentication (password check)
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const { password } = req.body;
    const requiredPassword = process.env.ADMIN_PASSWORD || 'ranjna@123';

    if (password === requiredPassword) {
      const token = generateToken({ role: 'admin', username: 'Admin' });
      res.json({
        role: 'admin',
        username: 'Admin',
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid admin password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile with populated watchlist & favorites
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    if (req.user.role === 'admin' && !req.user._id) {
      return res.json({ role: 'admin', username: 'Admin' });
    }

    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('watchlist')
      .populate('favorites');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  adminLogin,
  getMe,
};
