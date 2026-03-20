const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

exports.getRegister = (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  return res.render("register", { error: null });
};

exports.postRegister = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).render("register", { error: "Email and password are required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).render("register", { error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return res.redirect("/login");
  } catch (error) {
    return res.status(500).render("register", { error: "Something went wrong" });
  }
};

exports.getLogin = (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }

  const error = req.query.error ? "Invalid email or password" : null;
  return res.render("login", { error });
};

exports.getLogout = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    return res.redirect("/login");
  });
};

exports.getDashboard = (req, res) => {
  return res.render("dashboard", { user: req.user });
};
