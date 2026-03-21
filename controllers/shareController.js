const prisma = require("../lib/prisma");
const http = require("http");
const https = require("https");

const getExpiryFromDays = (days) => {
  if (!Number.isInteger(days) || days <= 0 || days > 365) {
    return null;
  }

  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const streamDownloadFromUrl = (res, fileUrl, fileName) => {
  const parsedUrl = new URL(fileUrl);
  const client = parsedUrl.protocol === "http:" ? http : https;

  return client
    .get(fileUrl, (fileStream) => {
      if ((fileStream.statusCode || 500) >= 400) {
        return res.status(502).send("Failed to fetch file");
      }

      const safeFileName = fileName.replace(/"/g, "");
      const encodedFileName = encodeURIComponent(safeFileName);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`
      );
      res.setHeader("Content-Type", "application/octet-stream");

      fileStream.on("error", () => {
        if (!res.headersSent) {
          return res.status(502).send("Failed to stream file");
        }
        return res.end();
      });

      return fileStream.pipe(res);
    })
    .on("error", () => {
      if (!res.headersSent) {
        return res.status(502).send("Failed to download file");
      }
      return res.end();
    });
};

exports.createShareLink = async (req, res) => {
  try {
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
        folderId: folder.id,
        expiresAt,
      },
    });

    const absoluteShareUrl = `${req.protocol}://${req.get("host")}/share/${shareLink.id}`;

    return res.redirect(
      `/dashboard?shareSuccess=Link+created&shareLink=${encodeURIComponent(absoluteShareUrl)}`
    );
  } catch (err) {
    console.error(err);
    return res.redirect("/dashboard?shareError=Unable+to+create+share+link");
  }
};

exports.getSharedResource = async (req, res) => {
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

  if (!shareLink || !shareLink.folderId) {
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
    shareId: shareLink.id,
  });
};

exports.downloadSharedFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        name: true,
        url: true,
      },
    });

    if (!file || !file.url) {
      return res.status(404).send("File not found");
    }

    const fileName = (file.name || "downloaded-file").trim() || "downloaded-file";
    return streamDownloadFromUrl(res, file.url, fileName);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Download failed");
  }
};
