const prisma = require("../lib/prisma");

const getOwnedFile = (fileId, userId) => {
  return prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });
};

exports.uploadFile = async (req, res) => {
  const wantsJson =
    req.headers.accept?.includes("application/json") ||
    req.headers["x-requested-with"] === "XMLHttpRequest";

  try {
    const file = req.file;
    const folderId = req.body.folderId || null;

    if (!file) {
      if (wantsJson) {
        return res.status(400).json({ ok: false, error: "No file uploaded" });
      }
      return res.send("No file uploaded");
    }

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: req.user.id,
        },
        select: { id: true },
      });

      if (!folder) {
        if (wantsJson) {
          return res.status(400).json({ ok: false, error: "Invalid folder" });
        }
        return res.redirect("/dashboard?error=Invalid+folder");
      }
    }

    await prisma.file.create({
      data: {
        name: file.originalname,
        size: file.size,
        url: file.path || null,
        folderId,
        userId: req.user.id,
      },
    });

    if (wantsJson) {
      return res.json({ ok: true });
    }

    return res.redirect("/dashboard");
  } catch (error) {
    if (wantsJson) {
      return res.status(500).json({ ok: false, error: "Upload failed" });
    }
    return res.redirect("/dashboard?error=Upload+failed");
  }
};

exports.getFileById = async (req, res) => {
  try {
    const file = await getOwnedFile(req.params.id, req.user.id);

    if (!file) {
      return res.redirect("/folders?error=File+not+found");
    }

    return res.render("file-details", { file });
  } catch (error) {
    return res.redirect("/folders?error=Unable+to+load+file");
  }
};

exports.downloadFileById = async (req, res) => {
  try {
    const file = await getOwnedFile(req.params.id, req.user.id);

    if (!file) {
      return res.redirect("/folders?error=File+not+found");
    }

    if (!file.url) {
      return res.redirect("/dashboard?error=File+URL+missing");
    }

    return res.redirect(file.url);
  } catch (error) {
    return res.redirect("/folders?error=Unable+to+download+file");
  }
};

exports.deleteFileById = async (req, res) => {
  try {
    const file = await getOwnedFile(req.params.id, req.user.id);

    if (!file) {
      return res.redirect("/dashboard?error=File+not+found");
    }

    await prisma.file.delete({
      where: { id: file.id },
    });

    return res.redirect("/dashboard");
  } catch (error) {
    return res.redirect("/dashboard?error=Unable+to+delete+file");
  }
};
