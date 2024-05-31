const router = require('express').Router();
const { Post, Comment } = require('../../models');

// Route to create a new post
router.post('/new', async (req, res) => {
  try {
    const { user_id } = req.session;
    const postData = await Post.create({ ...req.body, user_id });
    res.status(200).json(postData);
  } catch (err) {
    res.status(400).json({ message: 'Unable to create new post. Please try again.', error: err });
  }
});

// Route to create a new comment
router.post('/new-comment', async (req, res) => {
  try {
    const { user_id } = req.session;
    const commentData = await Comment.create({ ...req.body, user_id });
    res.status(200).json(commentData);
  } catch (err) {
    res.status(400).json({ message: 'Unable to add comment. Please try again.', error: err });
  }
});

// Route to retrieve a post for editing
router.get('/edit-get/:id', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id);
    if (!postData) {
      res.status(404).json({ message: 'Post not found. Please check the post ID.' });
      return;
    }

    if (postData.user_id !== req.session.user_id) {
      res.status(403).json({ message: 'Access denied. You do not have permission to edit this post.' });
      return;
    }

    const post = postData.get({ plain: true });
    res.render('update-blog-post', { post, logged_in: req.session.logged_in });
  } catch (err) {
    res.status(400).json({ message: 'Failed to retrieve post for editing. Please try again.', error: err });
  }
});

// Route to update a post
router.put('/update', async (req, res) => {
  try {
    const { user_id } = req.session;
    const { text, postId } = req.body;

    const postData = await Post.update(
      { text },
      {
        where: {
          id: postId,
          user_id,
        },
      }
    );

    if (!postData[0]) {
      res.status(404).json({ message: 'Post update failed. Post not found or user not authorized.' });
      return;
    }

    res.status(202).json({ message: 'Post successfully updated.' });
  } catch (err) {
    res.status(400).json({ message: 'Error updating post. Please try again.', error: err });
  }
});

// Route to delete a post
router.delete('/delete', async (req, res) => {
  try {
    const { target: postId } = req.body;
    const postData = await Post.findByPk(postId);

    if (!postData) {
      res.status(404).json({ message: 'Unable to delete. Post not found.' });
      return;
    }

    if (postData.user_id !== req.session.user_id) {
      res.status(401).json({ message: 'Unauthorized action. You do not have permission to delete this post.' });
      return;
    }

    await Post.destroy({
      where: {
        id: postData.id,
      },
    });

    res.status(202).json({ message: 'Post successfully deleted.' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting post. Please try again.', error: err });
  }
});

module.exports = router;
