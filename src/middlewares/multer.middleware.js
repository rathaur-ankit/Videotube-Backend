import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, safeName);
  },
});

const upload = multer({ storage });

export { upload };
