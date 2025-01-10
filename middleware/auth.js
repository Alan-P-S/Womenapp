// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
        res.redirect('/login'); // User is not authenticated, redirect to login
    }
}

function ensureRole(role) {
    return (req, res, next) => {
      if (req.isAuthenticated() && req.user.role === role) {
        return next();
      }
      res.status(403).send('Access denied');
    };
  }

module.exports = {ensureRole};

module.exports = { isAuthenticated };
