const prisma = require("../lib/prisma");

const getOwnedFile = (fileId, userId) => {
  return prisma.file.findFirst({
    where: {
      id: fileId,
      folder: { userId },
    },
  });
};

exports.uploadFile = async (req, res) => {
  const file = req.file;
  const { folderId } = req.body;

  if (!file) {
    return res.send("No file uploaded");
  }

  if (!folderId) {
    return res.send("Folder not selected");
  }

  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      userId: req.user.id,
    },
    select: { id: true },
  });

  if (!folder) {
    return res.send("Folder not selected");
  }

  await prisma.file.create({
    data: {
      name: file.originalname,
      size: file.size,
      url: file.path,
      folderId: folderId,
    },
  });

  return res.redirect("/dashboard");
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

    return res.redirect(file.url);
  } catch (error) {
    return res.redirect("/folders?error=Unable+to+download+file");
  }
};
