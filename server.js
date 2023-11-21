const express = require("express");
const multer = require("multer");
const cors = require("cors");

const fs = require("fs");

const { removeBackground } = require("@imgly/background-removal-node");

const app = express();

app.use(cors("*"));

const storageEngine = multer.diskStorage({
  destination: "./images",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

const upload = multer({
  storage: storageEngine,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("processed"));

const uploadFiles = async (req, res) => {
  const image = req.file;

  if (!image) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log(image);

  let config = {
    debug: true,

    fetchArgs: {
      mode: "no-cors",
    },
  };

  removeBackground(image.path, config).then(async (blob) => {
    console.log(blob);
    const bufferData = Buffer.from(await blob.arrayBuffer());

    const filePath =
      image.filename.substring(0, image.filename.lastIndexOf(".")) + ".png";

    fs.writeFile("processed\\" + filePath, bufferData, (err) => {
      if (err) {
        console.log("Error saving PNG file:", err);
      } else {
        console.log("PNG file saved successfully!");
      }
    });
    res.json({ imageUrl: filePath });
  });
};

app.post("/upload_files", upload.single("image"), uploadFiles);

app.get("/", (req, res) => {
  res.json({ test: "Hello" });
});

app.listen(5000, () => {
  console.log("Server started....");
});
