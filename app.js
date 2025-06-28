require('dotenv').config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");

// Routes
const customerRoutes = require("./routes/dairy2");
const dairyRoutes = require("./routes/dairy");
const milkmanRoutes = require("./routes/milkman");
const authRoutes = require("./routes/auth");
const otherRoutes = require("./routes/others");
const customerrs=require("./routes/customerrs");

const app = express();
const port = 8080;


//const dbUrl ="mongodb://127.0.0.1:27017/Milkman";

const dbUrl=process.env.db
console.log(dbUrl)
// Database Connection

async function main(){
    await mongoose.connect(dbUrl)
}

main().then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ DB Error:", err));

// Session Configuration
const sessionOptions = {
    secret:process.env.secretcode,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 2,
        maxAge: 1000 * 60 * 60 * 24 * 2,
        httpOnly: true,
    },
};

// App Configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionOptions));
app.use(flash());


// Auth middle ware

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Flash Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser=req.session.user;
    next();
});




// Routes
app.use("/", authRoutes);
app.use("/customers", customerRoutes);
app.use("/dairy", dairyRoutes);
app.use("/milkman", milkmanRoutes);
app.use("/", otherRoutes);
app.use("/customerrs",customerrs);

// Home Page
app.get("/", (req, res) => {
    res.render("user/front");
});

// Server Start
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});




    

    
