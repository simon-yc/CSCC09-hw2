import chai from "chai";
import chaiHttp from "chai-http";
import {
  server,
  createTestDb,
  deleteTestDb,
  getImages,
  getComments,
} from "../app.mjs";

const expect = chai.expect;
chai.use(chaiHttp);

describe("Image and Comment API Testing", () => {
  before(function () {
    createTestDb();
  });

  after(function () {
    deleteTestDb();
    server.close();
  });

  // Test cases for Image APIs
  describe("Test cases for Image APIs", () => {
    let imageId;

    it("should create a image with a title, author, and picture", function (done) {
      chai
        .request(server)
        .post("/api/images/")
        .field("title", "test-title")
        .field("author", "test-author")
        .attach("picture", "test/picture/test-picture.png")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("title", "test-title");
          expect(res.body).to.have.property("author", "test-author");
          expect(res.body).to.have.property("picture");
          imageId = res.body._id;
          getImages(function (err, images) {
            expect(images).to.have.lengthOf(1);
            done();
          });
        });
    });

    it("it should retrieve an image by ID", function (done) {
      chai
        .request(server)
        .get(`/api/images/${imageId}/`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("title", "test-title");
          expect(res.body).to.have.property("author", "test-author");
          done();
        });
    });

    it("should retrieve an image's picture by ID", function (done) {
      chai
        .request(server)
        .get(`/api/images/${imageId}/picture/`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.have.header("content-type", "image/png");
          done();
        });
    });

    it("should retrieve the status if an image is the oldest", function (done) {
      chai
        .request(server)
        .get(`/api/images/${imageId}/status/isOldest`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("isOldestImage", true);
          done();
        });
    });

    it("should retrieve the status if an image is the latest", function (done) {
      chai
        .request(server)
        .get(`/api/images/${imageId}/status/isLatest`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("isLatestImage", true);
          done();
        });
    });

    let imageId2;
    it("should create another image with title, author, and picture", function (done) {
        chai
          .request(server)
          .post("/api/images/")
          .field("title", "test-title2")
          .field("author", "test-author2")
          .attach("picture", "test/picture/test-picture.png")
          .end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("title", "test-title2");
            expect(res.body).to.have.property("author", "test-author2");
            expect(res.body).to.have.property("picture");
            imageId2 = res.body._id;
            getImages(function (err, images) {
              expect(images).to.have.lengthOf(2);
              done();
            });
          });
      });

      it("should try to retrieve the previous image and succeed", function (done) {
        chai
            .request(server)
            .get(`/api/images/${imageId}/previous`)
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("_id", imageId2);
                expect(res.body).to.have.property("title", "test-title2");
                expect(res.body).to.have.property("author", "test-author2");
                done();
            });
    });

    it("should try to retrieve the previous image and fail", function (done) {
        chai
            .request(server)
            .get(`/api/images/${imageId2}/previous`)
            .end(function (err, res) {
                expect(res).to.have.status(404);
                expect(res.text).to.equal("No previous image");
                done();
            });
    });

    it("should retrieve the next image and succeed", function (done) {
        chai
            .request(server)
            .get(`/api/images/${imageId2}/next`)
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("_id", imageId);
                expect(res.body).to.have.property("title", "test-title");
                expect(res.body).to.have.property("author", "test-author");
                done();
            });
    });

    
    it("should try to retrieve the next image and fail", function (done) {
        chai
            .request(server)
            .get(`/api/images/${imageId}/next`)
            .end(function (err, res) {
                expect(res).to.have.status(404);
                expect(res.text).to.equal("No next image");
                done();
            });
    });

    it("should delete an image", function (done) {
      chai
        .request(server)
        .delete(`/api/images/${imageId}/`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          getImages(function (err, images) {
            expect(images).to.have.lengthOf(1);
            done();
          });
        });
    });

    it("should delete an image", function (done) {
        chai
          .request(server)
          .delete(`/api/images/${imageId2}/`)
          .end(function (err, res) {
            expect(res).to.have.status(200);
            getImages(function (err, images) {
              expect(images).to.have.lengthOf(0);
              done();
            });
          });
      });
  });

  // Test cases for Comment APIs
  describe("Test cases for Comment APIs", () => {
    let imageId;

    it("should create a image with a title, author, and picture", function (done) {
      chai
        .request(server)
        .post("/api/images/")
        .field("title", "test-title")
        .field("author", "test-author")
        .attach("picture", "test/picture/test-picture.png")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("title", "test-title");
          expect(res.body).to.have.property("author", "test-author");
          expect(res.body).to.have.property("picture");
          imageId = res.body._id;
          getImages(function (err, images) {
            expect(images).to.have.lengthOf(1);
            done();
          });
        });
    });

    let commentId;

    it("should create a comment with imageId from the previous test", function (done) {
      const newComment = {
        imageId: imageId,
        author: "test-author",
        content: "test-content",
      };

      chai
        .request(server)
        .post("/api/comments/")
        .send(newComment)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("imageId", imageId);
          expect(res.body).to.have.property("author", "test-author");
          expect(res.body).to.have.property("content", "test-content");
          commentId = res.body._id;
          getComments(function (err, comments) {
            expect(comments).to.have.lengthOf(1);
            done();
          });
        });
    });

    it("should retrieve a page of comments by imageId", function (done) {
      const page = 0;
      chai
        .request(server)
        .get(`/api/comments/${imageId}/${page}`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf(1);
          done();
        });
    });

    it("should retrieve the status if a comment is the last page", function (done) {
      chai
        .request(server)
        .get(`/api/comments/${imageId}/0/isLastPage/`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("isLastPage", true);
          done();
        });
    });

    it("should delete a comment", function (done) {
      chai
        .request(server)
        .delete(`/api/comments/${commentId}/`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          getComments(function (err, comments) {
            expect(comments).to.have.lengthOf(0);
            done();
          });
        });
    });

    it("should delete the image we created at the beginning", function (done) {
      chai
        .request(server)
        .delete(`/api/images/${imageId}/`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          getImages(function (err, images) {
            expect(images).to.have.lengthOf(0);
            done();
          });
        });
    });
  });
});
