const path = require("path");
const prisma = require("../lib/prisma");

const getOwnedFile = (fileId, userId) => {
  return prisma.file.findFirst({
    where: {
      id: fileId,
      OR: [{ userId }, { folder: { userId } }],
    },
  });
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

    const storedFilename = path.basename(file.url);
    const absolutePath = path.join(process.cwd(), "uploads", storedFilename);

    return res.download(absolutePath, file.name);
  } catch (error) {
    return res.redirect("/folders?error=Unable+to+download+file");
  }
};
