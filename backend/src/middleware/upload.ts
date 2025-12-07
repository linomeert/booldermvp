import multer from "multer";
import path from "path";
import fs from "fs";

const AVATAR_UPLOAD_PATH = path.join(__dirname, "../../uploads/avatars");

// Ensure the upload directory exists
if (!fs.existsSync(AVATAR_UPLOAD_PATH)) {
  fs.mkdirSync(AVATAR_UPLOAD_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, AVATAR_UPLOAD_PATH);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

export const avatarUpload = multer({ storage, fileFilter });
