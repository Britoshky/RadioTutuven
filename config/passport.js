const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true // Pasa el objeto req a la función de verificación
}, async function(req, email, password, done) {
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            console.log("usuario no encontrado")
            req.flash('error', 'User not found');
            return done(null, false);
        }
        const match = await user.matchPassword(password);
        if (match) {
            return done(null, user);
        } else {
            console.log("contraseña incorrecta")
            req.flash('error', 'Incorrect password');
            return done(null, false);
        }
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;
