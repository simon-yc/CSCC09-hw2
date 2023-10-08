import { createServer } from "http";
import express from "express";
import Datastore from "nedb";
import multer from "multer";
import { rmSync } from "fs";
import { join } from "path";

const PORT = 3000;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("static"));

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

let images = new Datastore({
  filename: "db/images.db",
  autoload: true,
  timestampData: true,
});

let comments = new Datastore({
  filename: "db/comments.db",
  autoload: true,
  timestampData: true,
});

/*  ******* Data types (new to be done code) *******
    image objects must have at least the following attributes:
        - (String) _id 
        - (String) title
        - (String) author
        - (String) picture
        - (Date) date

    comment objects must have the following attributes
        - (String) _id
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date

****************************** */

const upload = multer({ dest: "uploads/" });

// Create

app.post("/api/images/", upload.single("picture"), function (req, res, next) {
  const { title, author } = req.body;
  images.insert(
    {
      title,
      author,
      picture: req.file,
      date: new Date(),
    },
    function (err, image) {
      if (err) return res.status(500).end(err);
      return res.json(image);
    }
  );
});

app.post("/api/comments/", function (req, res, next) {
  const { imageId, author, content } = req.body;

  images.findOne({ _id: imageId }, function (err, image) {
    if (err) return res.status(500).end(err);
    if (!image)
      return res
        .status(404)
        .end("Image with ID:" + imageId + " does not exist");

    comments.insert(
      {
        imageId: imageId,
        author: author,
        content: content,
        date: new Date(),
      },
      function (err, comment) {
        if (err) return res.status(500).end(err);
        return res.json(comment);
      }
    );
  });
});

// Read

app.get("/api/images/:id/", function (req, res, next) {
  images.findOne({ _id: req.params.id }, function (err, image) {
    if (err) return res.status(500).end(err);
    if (!image)
      return res
        .status(404)
        .end("Image id #" + req.params.id + " does not exist");
    return res.json(image);
  });
});

app.get("/api/images/:id/picture/", function (req, res, next) {
  images.findOne({ _id: req.params.id }, function (err, image) {
    if (err) return res.status(500).end(err);
    if (!image)
      return res.status(404).end("Image:" + req.params.id + " does not exist");
    res.setHeader("Content-Type", image.picture.mimetype);
    res.sendFile(image.picture.path, { root: "." });
  });
});

app.get("/api/images/:id/status/isOldest", function (req, res, next) {
  images
    .find({})
    .sort({ createdAt: 1 })
    .exec(function (err, oldestImages) {
      if (err) return res.status(500).end(err);
      const isOldestImage = oldestImages[0]._id === req.params.id;
      return res.json({ isOldestImage });
    });
});

app.get("/api/images/:id/status/isLatest", function (req, res, next) {
  images
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, latestImages) {
      if (err) return res.status(500).end(err);
      const isLatestImage = latestImages[0]._id === req.params.id;
      return res.json({ isLatestImage });
    });
});

// Find the image created directly before the specified image
app.get("/api/images/:id/previous", function (req, res, next) {
  const imageId = req.params.id;
  images
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, allImages) {
      if (err) return res.status(500).end(err);
      for (let i = 0; i < allImages.length; i++) {
        if (allImages[i]._id === imageId){
          if (i === 0) return res.status(404).end("No previous image");
          else return res.json(allImages[i - 1]);
        }
      }
    });
});

// Find the image created directly after the specified image
app.get("/api/images/:id/next", function (req, res, next) {
  const imageId = req.params.id;
  images
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, allImages) {
      if (err) return res.status(500).end(err);
      for (let i = 0; i < allImages.length; i++) {
        if (allImages[i]._id === imageId) {
          if (i === allImages.length - 1)
            return res.status(404).end("No next image");
          else return res.json(allImages[i + 1]);
        }
      }
    });
});

app.get("/api/comments/:imageId/:page/", function (req, res, next) {
  const imageId = req.params.imageId;
  const page = parseInt(req.params.page, 10);
  const perPage = 10;

  comments
    .find({ imageId: imageId })
    .sort({ date: -1 })
    .exec(function (err, imageComments) {
      if (err) return res.status(500).end("Internal Server Error");
      if (!imageComments) return res.json([]);
      const startIndex = page * perPage;
      const endIndex = startIndex + perPage;
      const commentsForPage = imageComments.slice(startIndex, endIndex);
      return res.json(commentsForPage);
    });
});

// app.get("/api/comments/:imageId/", function (req, res, next) {
//   comments.find({ imageId: imageId }, function (err, imageComments) {
//     if (err) return res.status(500).end("Internal Server Error");
//     if (!imageComments) return res.json([]);
//     return res.json(imageComments);
//   });
// });

app.get("/api/comments/:imageId/:page/isLastPage/", function (req, res, next) {
  const imageId = req.params.imageId;
  const page = parseInt(req.params.page, 10);
  const perPage = 10;

  comments.find({ imageId: imageId }, function (err, imageComments) {
    if (err) return res.status(500).end("Internal Server Error");
    if (!imageComments)
      return res.status(404).end("Image or comments not found");
    const totalComments = imageComments.length;
    const startIndex = page * perPage;
    const endIndex = startIndex + perPage;
    const isLastPage = endIndex >= totalComments;
    res.json({ isLastPage });
  });
});

// for testing purposes, get all images
app.get("/api/images/", function (req, res, next) {
  images
    .find({})
    .sort({ date: -1 })
    .exec(function (err, images) {
      if (err) return res.status(500).end("Internal Server Error");
      return res.json(images);
    });
});

// Delete

app.delete("/api/images/:id/", function (req, res, next) {
  images.findOne({ _id: req.params.id }, function (err, image) {
    if (err) return res.status(500).end(err);
    if (!image)
      return res
        .status(404)
        .end("Image id #" + req.params.id + " does not exists");
    images.remove({ _id: image._id }, { multi: false }, function (err, num) {
      if (err) return res.status(500).end(err);
      rmSync(image.picture.path, { recursive: true, force: true });
    });

    comments.remove(
      { imageId: image._id },
      { multi: true },
      function (err, num) {
        if (err) return res.status(500).end(err);
        return res.json(image);
      }
    );
  });
});

app.delete("/api/comments/:id/", function (req, res, next) {
  comments.findOne({ _id: req.params.id }, function (err, comment) {
    if (err) return res.status(500).end(err);
    if (!comment)
      return res
        .status(404)
        .end("Comment id #" + req.params.id + " does not exists");
    comments.remove(
      { _id: comment._id },
      { multi: false },
      function (err, num) {
        res.json(comment);
      }
    );
  });
});

// This is for testing purpose only
export function createTestDb(db) {
  images = new Datastore({
    filename: join("testdb", "images.db"),
    autoload: true,
    timestampData: true,
  });
  comments = new Datastore({
    filename: join("testdb", "comments.db"),
    autoload: true,
    timestampData: true,
  });
}

// This is for testing purpose only
export function deleteTestDb(db) {
  rmSync("testdb", { recursive: true, force: true });
}

// This is for testing purpose only
export function getImages(callback) {
  return images
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, images) {
      if (err) return callback(err, null);
      return callback(err, images);
    });
}

// This is for testing purpose only
export function getComments(callback) {
  return comments
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, comments) {
      if (err) return callback(err, null);
      return callback(err, comments);
    });
}

export const server = createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
