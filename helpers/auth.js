const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error_msg", "No autorizado");
  res.redirect("/users/signin");
};

helpers.logoutAndRedirect = (req, res, next) => {
  req.logout(function(err) { // Proporcionar una función de devolución de llamada
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "Has cerrado sesión correctamente.");
    res.redirect("/users/signin"); // Redirigir a la página de inicio de sesión
  });
};

module.exports = helpers;
