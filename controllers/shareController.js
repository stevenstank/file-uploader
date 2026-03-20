const { v4: uuidv4 } = require("uuid");
const prisma = require("../lib/prisma");

exports.createShareLink = async (req, res) => {
  const { folderId } = req.params;
  const days = Number(req.body.days);

  if (!Number.isInteger(days) || days <= 0 || days > 365) {
    return res.redirect(`/dashboard?shareError=Invalid+duration`);
  }

  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      userId: req.user.id,
    },
    select: { id: true },
  });

  if (!folder) {
    return res.redirect("/folders?error=Folder+not+found");
  }

  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const shareLink = await prisma.shareLink.create({
    data: {
      id: uuidv4(),
      folderId: folder.id,
      expiresAt,
    },
  });

  const absoluteShareUrl = `${req.protocol}://${req.get("host")}/share/${shareLink.id}`;

  return res.redirect(
    `/dashboard?shareSuccess=Link+created&shareLink=${encodeURIComponent(absoluteShareUrl)}`
  );
};

exports.getSharedFolder = async (req, res) => {
  const shareLink = await prisma.shareLink.findUnique({
    where: { id: req.params.id },
    include: {
      folder: {
        include: {
          files: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!shareLink || !shareLink.folder) {
    return res.status(404).render("shared-folder", {
      expired: true,
      notFound: true,
      folder: null,
      expiresAt: null,
    });
  }

  if (shareLink.expiresAt.getTime() < Date.now()) {
    return res.status(410).render("shared-folder", {
      expired: true,
      notFound: false,
      folder: shareLink.folder,
      expiresAt: shareLink.expiresAt,
    });
  }

  return res.render("shared-folder", {
    expired: false,
    notFound: false,
    folder: shareLink.folder,
    expiresAt: shareLink.expiresAt,
  });
};
