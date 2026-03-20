const prisma = require("../lib/prisma");
const path = require("path");
const https = require("https");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getOwnedFile = (fileId, userId) => {
  return prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });
};

const isRemoteUrl = (value) => /^https?:\/\//i.test(value || "");

const buildDownloadName = (file) => {
  const storedName = (file.name || "").trim();
  if (storedName && path.extname(storedName)) {
    return storedName;
  }

  try {
    const parsed = new URL(file.url);
    const ext = path.extname(parsed.pathname || "");
    if (storedName && ext) {
      return `${storedName}${ext}`;
    }
  } catch (_error) {
    // If URL parsing fails, fall back to storedName or default.
  }

  return storedName || "downloaded-file";
};

// ✅ FIXED UPLOAD (MANUAL CLOUDINARY)
exports.uploadFile = async (req, res) => {
  const wantsJson =
    req.headers.accept?.includes("application/json") ||
    req.headers["x-requested-with"] === "XMLHttpRequest";

  try {
    const file = req.file;
    const folderId = (req.body.folderId || "").trim() || null;

    if (!file) {
      if (wantsJson) {
        return res.status(400).json({ ok: false, error: "No file uploaded" });
      }
      return res.send("No file uploaded");
    }

    // Validate folder
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

    // 🔥 Decide correct Cloudinary type
    const isImage = file.mimetype.startsWith("image/");
    const resourceType = isImage ? "image" : "raw";

    // 🔥 Upload using buffer
    const uploadFromBuffer = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "file-uploader",
            resource_type: resourceType,
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    };

    const result = await uploadFromBuffer();

    // Save file in DB
    await prisma.file.create({
      data: {
        name: file.originalname,
        size: file.size,
        url: result.secure_url,
        folderId,
        userId: req.user.id,
      },
    });

    if (wantsJson) {
      return res.json({ ok: true });
    }

    return res.redirect("/dashboard");
  } catch (error) {
    console.error(error);

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

    if (!file || !file.url) {
      return res.status(404).send("File not found");
    }

    if (!isRemoteUrl(file.url)) {
      return res.status(400).send("Invalid file URL");
    }

    const downloadName = buildDownloadName(file).replace(/"/g, "");

    return https
      .get(file.url, (response) => {
        if ((response.statusCode || 500) >= 400) {
          return res.status(502).send("Failed to fetch file from storage");
        }

      res.setHeader(
        "Content-Disposition",
          `attachment; filename="${downloadName}"`
      );
        res.setHeader("Content-Type", "application/octet-stream");

        response.on("error", () => {
          if (!res.headersSent) {
            return res.status(502).send("Failed to stream file");
          }
          res.end();
        });

        response.pipe(res);
      })
      .on("error", () => {
        if (!res.headersSent) {
          return res.status(502).send("Failed to download file");
        }
        res.end();
      });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Download failed");
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