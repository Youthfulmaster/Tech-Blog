const router = require('express').Router();
const { User } = require('../../models');

// Route to render the login page
router.get('/', async (req, res) => {
  try {
    res.render('login');
    res.status(200);
  } catch (err) {
    res.status(400).json({ message: 'Error rendering login page', error: err });
  }
});

// Route to handle user sign-up
router.post('/', async (req, res) => {
  try {
    const userData = await User.create(req.body);

    // Save session and set user_id and logged_in status
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.status(200).json({ message: 'User successfully signed up', userData });
    });
  } catch (err) {
    res.status(400).json({ message: 'Failed to sign up user', error: err });
  }
});

// Route to handle user login
router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { username: req.body.username.toLowerCase() } });

    if (!userData) {
      res.status(400).json({ message: 'Username not found. Please try again.' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res.status(400).json({ message: 'Incorrect password. Please try again.' });
      return;
    }

    // Save session and set user_id and logged_in status
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.status(200).json({ message: 'Login successful', user: userData.username });
    });

  } catch (err) {
    res.status(500).json({ message: 'Internal server error during login', error: err });
  }
});

// Route to handle user logout
router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).json({ message: 'Logout successful' }).end();
    });
  } else {
    res.status(404).json({ message: 'No user logged in' }).end();
  }
});

module.exports = router;
