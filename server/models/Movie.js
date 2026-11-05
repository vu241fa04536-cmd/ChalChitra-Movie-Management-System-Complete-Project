const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    legacyId: {
      type: Number,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'English',
      trim: true,
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    duration: {
      type: String,
      default: '120 min',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    poster: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    trailer: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['released', 'upcoming'],
      default: 'released',
    },
    type: {
      type: String,
      enum: ['movie', 'webseries', 'cartoon', 'short'],
      default: 'movie',
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    watchLinks: {
      youtube: { type: String, default: 'https://www.youtube.com' },
      netflix: { type: String, default: 'https://www.netflix.com' },
      hotstar: { type: String, default: 'https://www.hotstar.com' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Movie', movieSchema);
