const { v4: uuidv4 } = require("uuid");
const prisma = require("../lib/prisma");

const getExpiryFromDays = (days) => {
  if (!Number.isInteger(days) || days <= 0 || days > 365) {
    return null;
  }

  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

exports.createShareLink = async (req, res) => {
  const { folderId } = req.params;
  const days = Number(req.body.days);

  const expiresAt = getExpiryFromDays(days);
  if (!expiresAt) {
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

  const shareLink = await prisma.shareLink.create({
    data: {
      id: uuidv4(),
      fileId: null,
      folderId: folder.id,
      expiresAt,
    },
  });

  const absoluteShareUrl = `${req.protocol}://${req.get("host")}/share/${shareLink.id}`;

  return res.redirect(
    `/dashboard?shareSuccess=Link+created&shareLink=${encodeURIComponent(absoluteShareUrl)}`
  );
};

exports.createFileShareLink = async (req, res) => {
  const { fileId } = req.params;
  const days = Number(req.body.days);

  const expiresAt = getExpiryFromDays(days);
  if (!expiresAt) {
    return res.redirect(`/dashboard?shareError=Invalid+duration`);
  }

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId: req.user.id,
    },
    select: { id: true },
  });

  if (!file) {
    return res.redirect("/dashboard?shareError=File+not+found");
  }

  const shareLink = await prisma.shareLink.create({
    data: {
      id: uuidv4(),
      fileId: file.id,
      folderId: null,
      expiresAt,
    },
  });

  const absoluteShareUrl = `${req.protocol}://${req.get("host")}/share/${shareLink.id}`;

  return res.redirect(
    `/dashboard?shareSuccess=Link+created&shareLink=${encodeURIComponent(absoluteShareUrl)}`
  );
};

exports.getSharedResource = async (req, res) => {
  const shareLink = await prisma.shareLink.findUnique({
    where: { id: req.params.id },
    include: {
      file: true,
      folder: {
        include: {
          files: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!shareLink || (!shareLink.folderId && !shareLink.fileId)) {
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

  if (shareLink.fileId && shareLink.file) {
    return res.render("shared-file", {
      expired: false,
      notFound: false,
      file: shareLink.file,
      expiresAt: shareLink.expiresAt,
    });
  }

  if (shareLink.fileId && !shareLink.file) {
    return res.status(404).render("shared-file", {
      expired: true,
      notFound: true,
      file: null,
      expiresAt: null,
    });
  }

  if (!shareLink.folder) {
    return res.status(404).render("shared-folder", {
      expired: true,
      notFound: true,
      folder: null,
      expiresAt: null,
    });
  }

  return res.render("shared-folder", {
    expired: false,
    notFound: false,
    folder: shareLink.folder,
    expiresAt: shareLink.expiresAt,
  });
};
