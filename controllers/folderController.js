const prisma = require("../lib/prisma");

exports.getFolders = async (req, res) => {
  const error = req.query.error || null;
  const success = req.query.success || null;

  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { files: true },
        },
      },
    });

    return res.render("folders", { folders, error, success });
  } catch (err) {
    return res.redirect("/dashboard?error=Unable+to+load+folders");
  }
};

exports.postFolders = async (req, res) => {
  return exports.createFolder(req, res);
};

exports.createFolder = async (req, res) => {
  const name = (req.body.name || "").trim();

  if (!name) {
    return res.redirect("/folders?error=Folder+name+is+required");
  }

  try {
    await prisma.folder.create({
      data: {
        name,
        userId: req.user.id,
      },
    });

    return res.redirect("/folders?success=Folder+created");
  } catch (err) {
    return res.redirect("/folders?error=Unable+to+create+folder");
  }
};

exports.getFolderById = async (req, res) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: req.params.id },
      include: {
        files: true,
      },
    });

    if (!folder || folder.userId !== req.user.id) {
      return res.redirect("/folders?error=Folder+not+found");
    }

    const shareLink = req.query.shareLink || null;
    const shareSuccess = req.query.shareSuccess || null;
    const shareError = req.query.shareError || null;

    return res.render("folder-details", {
      folder,
      shareLink,
      shareSuccess,
      shareError,
    });
  } catch (err) {
    return res.redirect("/folders?error=Unable+to+load+folder");
  }
};

exports.postDeleteFolder = async (req, res) => {
  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      select: { id: true },
    });

    if (!folder) {
      return res.redirect("/folders?error=Folder+not+found");
    }

    await prisma.folder.delete({
      where: { id: folder.id },
    });

    return res.redirect("/folders");
  } catch (err) {
    return res.redirect("/folders?error=Unable+to+delete+folder");
  }
};
