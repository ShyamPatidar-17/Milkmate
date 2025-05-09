// middleware/auth.js
function isLoggedIn(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.locals.user = req.session.user; // Makes user available in views
    console.log(req.session.user);
    next();
}

module.exports = { isLoggedIn };
