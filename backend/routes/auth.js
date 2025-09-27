const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ msg: 'All fields are required' });

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'User already exists' });

    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ msg: 'All fields are required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    
    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          // UPDATED: Now returns all user details, including homeLocation
          user: { 
            name: user.name, 
            email: user.email, 
            favorites: user.favorites,
            homeLocation: user.homeLocation 
          },
        });
      }
    );
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- USER DETAILS & PREFERENCES ---

// NEW: GET current user's full details
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// NEW: SET a user's home location
router.post('/user/home', authMiddleware, async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ msg: 'City is required' });
  }

  try {
    const user = await User.findById(req.user.id);
    // Ensure the city is a favorite before setting it as home
    if (!user.favorites.includes(city)) {
      return res.status(400).json({ msg: 'City must be in favorites to be set as home.' });
    }
    user.homeLocation = city;
    await user.save();
    res.json(user); // Return updated user object
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


// --- FAVORITES ROUTES ---

router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/favorites', authMiddleware, async (req, res) => {
  const { city } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (user.favorites.includes(city)) {
      return res.status(400).json({ msg: 'City already in favorites' });
    }
    user.favorites.push(city);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/favorites', authMiddleware, async (req, res) => {
  const { city } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(fav => fav !== city);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- NEW: HISTORY ROUTES ---

// GET current user's history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.history);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ADD a city to history
router.post('/history', authMiddleware, async (req, res) => {
  const { city } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const filteredHistory = user.history.filter(h => h.toLowerCase() !== city.toLowerCase());
    const newHistory = [city, ...filteredHistory];
    user.history = newHistory.slice(0, 20); // Keep only the 20 most recent
    await user.save();
    res.json(user.history);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// REMOVE a city from history
router.delete('/history', authMiddleware, async (req, res) => {
  const { city } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.history = user.history.filter(h => h !== city);
    await user.save();
    res.json(user.history);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

