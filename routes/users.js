const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const { isAuthenticated } = require("../helpers/auth");
const bcrypt = require('bcryptjs');
const helpers = require('../helpers/auth');


//redirecciona a la pagina de iniciar sesion
router.get('/users/signin', (req, res) => {
  res.render('users/signin');
});

//redirecciona a la pagina editar usuario
router.get("/users/edit", isAuthenticated, async (req, res) => {
  try {
    // Assuming you have a unique identifier for the user, for example, user ID
    const userId = req.user.id;

    // Find the user based on the authenticated user ID
    const user = await User.findOne({ _id: userId })
      .lean();

    // Check if the user was found
    if (!user) {
      req.flash("error_msg", "User not found");
      return res.redirect("/panel"); // Redirect to a suitable page
    }
    res.render("users/edit", { user });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error fetching user");
    res.redirect("/panel"); // Redirect to a suitable page
  }
});

//editar usuario
router.put("/users/edit/:id", isAuthenticated, async (req, res) => {
  const { name, email, password, passwordNew, passwordNew2 } = req.body;

  try {
    // Assuming you have a unique identifier for the user, for example, user ID
    const userId = req.params.id;

    // Find the user by user ID
    const user = await User.findById(userId).lean();

    if (!user) {
      // Handle the case where the user with the specified ID is not found
      req.flash("error", "User not found");
      return res.redirect("/panel");
    }

    // Compare the entered password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Passwords do not match
      req.flash("error", "Invalid credentials");
      return res.redirect("/users/edit");
    }

    // Hash the new password before updating
    const hashedPasswordNew = await bcrypt.hash(passwordNew, 10);

    // Construct the update object with the fields you want to update
    const updateFields = {
      name,
      email,
      password: hashedPasswordNew, // Update the hashed password
    };

    // Update the user based on the user ID
    await User.findByIdAndUpdate(userId, updateFields);

    req.flash("success_msg", "User Updated Successfully");
    res.redirect("/panel");
  } catch (error) {
    console.error(error);
    req.flash("error", "Error updating user");
    res.redirect("/panel");
  }
});




router.post('/users/signin', passport.authenticate('local', {
  successRedirect: '/panel',
  failureRedirect: '/users/signin',
  failureFlash: true,
  badRequestMessage: 'Usuario o contraseña incorrecta', //missing credentials
}));

router.get('/users/signup', (req, res) => {
  res.render('users/signup');
});

router.post('/users/signup', async (req, res) => {
  const { name, email, password, confirm_password } = req.body;
  const errors = [];
  if (name.length <= 0) {
    errors.push({ text: 'Please Insert your Name' });
  }
  if (password != confirm_password) {
    errors.push({ text: 'Password do not match' });
  }
  if (password.length < 4) {
    errors.push({ text: 'Password must be at least 4 characters' });
  }
  if (errors.length > 0) {
    res.render('users/signup', { errors, name, email, password, confirm_password });
  } else {
    const emailUser = await User.findOne({ email: email });
    if (emailUser) {
      req.flash('error', 'The Email is already in use');
      res.redirect('/users/signup');
    } else {
      const newUser = new User({ name, email, password });
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      req.flash('success_msg', 'You are registered');
      res.redirect('/users/signin');
    }
  }
});

router.get('/users/logout', helpers.logoutAndRedirect, async (req, res) => {
  // If the user is loggedin
  if (req.session.loggedin) {
    req.session.loggedin = false;
    res.redirect('/');
  } else {
    // Not logged in
    res.redirect('/users/signin');
  }
});

module.exports = router;