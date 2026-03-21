require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./lib/prisma");
const passport = require("./config/passport");
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboardRoutes");
const folderRoutes = require("./routes/folders");
const fileRoutes = require("./routes/files");
const shareRoutes = require("./routes/share");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", folderRoutes);
app.use("/", fileRoutes);
app.use("/", shareRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
