import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import session from "express-session";
import flash from "connect-flash";
import methodOverride from "method-override";
import MongoStore from "connect-mongo";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";

// Firebase Initialization & Seeder
import { db } from "./config/firebase.js";
import seedFirebase from "./config/seedFirebase.js";

import customerRoutes from "./routes/dairy2.js";
import dairyRoutes from "./routes/dairy.js";
import milkmanRoutes from "./routes/milkman.js";
import authRoutes from "./routes/auth.js";
import otherRoutes from "./routes/others.js";
import customerrs from "./routes/customerrs.js";
import cartRoutes from "./routes/cart.js";
import productRoutes from "./routes/product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Initialize Firebase Seed Data
seedFirebase().catch(err => console.error("Firebase Seeder Notice:", err.message));

// Session Options
const sessionSecret = process.env.SESSION_SECRET || "milkmatesecretcode";
const dbUrl = process.env.MONGO_URI;

let sessionStore = null;
if (dbUrl) {
  try {
    sessionStore = MongoStore.create({
      mongoUrl: dbUrl,
      collectionName: "sessions",
      ttl: 24 * 60 * 60 // 1 day
    });
  } catch (e) {
    console.warn("⚠️ MongoStore session warning, falling back to MemoryStore");
  }
}

const sessionOptions = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore || undefined,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionOptions));
app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.session.user || null;
  res.locals.currUser = req.session.user;

  if (!req.session.cart) {
    req.session.cart = [];
  }
  res.locals.cart = req.session.cart;

  next();
});

app.use("/", authRoutes);
app.use("/customers", customerRoutes);
app.use("/dairy", dairyRoutes);
app.use("/milkman", milkmanRoutes);
app.use("/", otherRoutes);
app.use("/customerrs", customerrs);
app.use("/cart", cartRoutes);
app.use("/product", productRoutes);

app.get("/", (req, res) => {
  res.render("user/front");
});

app.listen(port, () => {
  console.log(`🚀 MilkMate Server running at http://localhost:${port}`);
  console.log(`🔥 Active Data Storage: Firebase Firestore (milkmate-7ee57)`);
});

export default app;



if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
