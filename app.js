require('dotenv').config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");

const customerRoutes = require("./routes/dairy2");
const dairyRoutes = require("./routes/dairy");
const milkmanRoutes = require("./routes/milkman");
const authRoutes = require("./routes/auth");
const otherRoutes = require("./routes/others");
const customerrs = require("./routes/customerrs");

const app = express();
const port = process.env.PORT || 8080;

const dbUrl = process.env.MONGO_URI;
if (!dbUrl) {
    console.error("❌ MONGO_URI is missing from environment variables.");
    process.exit(1);
}


async function main() {
    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}
main()
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ DB Error:", err));


const sessionOptions = {
    secret: process.env.SESSION_SECRET || 'defaultFallbackSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 2,
        maxAge: 1000 * 60 * 60 * 24 * 2,
        httpOnly: true,
    },
};


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.user = req.session.user || null;
    res.locals.currUser = req.session.user;
    next();
});


app.use("/", authRoutes);
app.use("/customers", customerRoutes);
app.use("/dairy", dairyRoutes);
app.use("/milkman", milkmanRoutes);
app.use("/", otherRoutes);
app.use("/customerrs", customerrs);


app.get("/", (req, res) => {
    res.render("user/front");
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
