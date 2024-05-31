const router = require('express').Router();
const { User, Post, Comment } = require('../models');

// Route to get all posts for the homepage
router.get('/', async (req, res) => {
  try {
    const userPostData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['username']
        }
      ]
    });

    // Serialize the data 
    const posts = userPostData.map((post) => post.get({ plain: true }));

    // Send the rendered Handlebars.js template back as the response
    res.render('homepage', { posts, logged_in: req.session.logged_in });
  } catch (err) {
    console.error('Error fetching posts for homepage:', err);
    res.status(500).json({ message: 'Internal server error', error: err });
  }
});

// Route to get a specific blog post by ID
router.get('/post/:id', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['username']
        },
        {
          model: Comment,
          include: {
            model: User,
            attributes: ['username']
          }
        }
      ]
    });

    if (!postData) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const post = postData.get({ plain: true });
    res.render('post', { post, logged_in: req.session.logged_in });
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: 'Internal server error', error: err });
  }
});

// Route to get all posts for the dashboard
router.get('/dashboard', async (req, res) => {
  if (req.session.logged_in) {
    try {
      const userPostData = await Post.findAll({
        where: { user_id: req.session.user_id },
        include: [
          {
            model: User,
            attributes: ['username']
          }
        ]
      });

      const posts = userPostData.map((post) => post.get({ plain: true }));
      res.render('dashboard', { posts, logged_in: req.session.logged_in });
    } catch (err) {
      console.error('Error fetching dashboard posts:', err);
      res.status(500).json({ message: 'Internal server error', error: err });
    }
  } else {
    res.redirect('/api/users/');
  }
});

// Route to render the new blog post page
router.get('/new-post', (req, res) => {
  if (req.session.logged_in) {
    try {
      res.render('new-blog-post', { logged_in: req.session.logged_in });
    } catch (err) {
      console.error('Error rendering new blog post page:', err);
      res.status(500).json({ message: 'Internal server error', error: err });
    }
  } else {
    res.redirect('/api/users/');
  }
});

module.exports = router;
