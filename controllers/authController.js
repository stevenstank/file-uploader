const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

exports.getRegister = (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  return res.render("register", { error: null });
};

exports.postRegister = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).render("register", { error: "Name, email and password are required" });
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
        name,
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
  return exports.dashboard(req, res);
};

exports.dashboard = async (req, res) => {
  const error = req.query.error || null;
  const success = req.query.success || null;
  const files = await prisma.file.findMany({
    where: {
      OR: [
        { userId: req.user.id },
        {
          folder: {
            userId: req.user.id,
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return res.render("dashboard", { user: req.user, files, error, success });
};

exports.register = async (req, res) => {
  return exports.postRegister(req, res);
};

exports.postUpload = async (req, res) => {
  const folderId = req.body.folderId || null;
  const file = req.file;

  if (!file) {
    return res.redirect("/dashboard?error=Please+select+a+file");
  }

  try {
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: req.user.id,
        },
        select: { id: true },
      });

      if (!folder) {
        return res.redirect("/dashboard?error=Invalid+folder");
      }
    }

    await prisma.file.create({
      data: {
        name: file.originalname,
        size: file.size,
        url: file.path,
        folderId,
        userId: req.user.id,
      },
    });

    return res.redirect("/dashboard?success=File+uploaded");
  } catch (error) {
    return res.redirect("/dashboard?error=Upload+failed");
  }
};
