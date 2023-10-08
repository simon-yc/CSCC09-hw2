import {
  getPreviousImage,
  isFirstImage,
  isLastImage,
  getCurrentImage,
  getNextImage,
  addImage,
  addComment,
  deleteComment,
  deleteImage,
  getCommentsPage,
  getNextCommentsPage,
  getPreviousCommentsPage,
  isFirstCommentsPage,
  isLastCommentsPage,
} from "/js/api.mjs";

function onError(err) {
  console.error("[error]", err);
  const error_box = document.querySelector("#error-box");
  error_box.innerHTML = err;
  error_box.style.visibility = "visible";
}

function update() {
  getCurrentImageAndDetails(function (err, image, isFirstImage, isLastImage) {
    if (err) return onError(err);
    if (image === null)
      document.querySelector("#image").innerHTML =
        "<p>No current images in the gallery.</p>";
    else displayImage(image, isFirstImage, isLastImage);
  });
}

function getCurrentImageAndDetails(callback) {
  getCurrentImage(function (err, image) {
    if (err) return callback(err);
    if (image === null) return callback(null, null, null, null);
    isFirstImage(function (err, isFirstImage) {
      if (err) return callback(err, null, null, null);
      isLastImage(function (err, isLastImage) {
        if (err) return callback(err, null, null, null);
        return callback(null, image, isFirstImage, isLastImage);
      });
    });
  });
}

function displayImage(image, isFirstImage, isLastImage) {
  const elmt = createImageElement(image, isFirstImage, isLastImage);
  createCommentsContainer(function (err, commentsContainer) {
    if (err) return onError(err);
    elmt.appendChild(commentsContainer);

    const imageContainer = document.querySelector("#image");
    imageContainer.innerHTML = "";
    imageContainer.appendChild(elmt);
    imageContainer.appendChild(commentsContainer);
  });
}

function createImageElement(image, isFirstImage, isLastImage) {
  const elmt = document.createElement("div");
  elmt.className = "image-container";
  elmt.innerHTML = `
        <div class="image">
            <div class="image_title">${image.title}</div>
            <div class="image_author">${image.author}</div>
            <img class="image_picture" src="/api/images/${
              image._id
            }/picture/" alt="${image.title}">
            <div class="image_date">${image.date}</div>
            <div class="image-buttons">
              <div class="image-previous-next-nav">
                ${
                  !isFirstImage
                    ? '<div class="previous-image-icon icon" id="prevImage"></div>'
                    : ""
                }
                ${
                  !isLastImage
                    ? '<div class="next-image-icon icon" id="nextImage"></div>'
                    : ""
                }
              </div>
              <div class="delete-image-icon icon" image-id="${image._id}"></div>
            </div>
        </div>
    `;

  const deleteImageIcon = elmt.querySelector(".delete-image-icon");
  deleteImageIcon.addEventListener("click", function (e) {
    const imageId = e.target.getAttribute("image-id");
    deleteImage(imageId, function (err, res) {
      if (err) return onError(err);
      update();
    });
  });

  if (!isFirstImage) {
    const prevImage = elmt.querySelector("#prevImage");
    prevImage.addEventListener("click", function (e) {
      getPreviousImage(function (err, res) {
        if (err) return onError(err);
        update();
      });
    });
  }

  if (!isLastImage) {
    const nextImage = elmt.querySelector("#nextImage");
    nextImage.addEventListener("click", function (e) {
      getNextImage(function (err, res) {
        if (err) return onError(err);
        update();
      });
    });
  }

  return elmt;
}

function getCurrentCommentsAndDetails(callback) {
  getCommentsPage(function (err, comments) {
    if (err) return callback(err);
    isFirstCommentsPage(function (err, isFirstCommentsPage) {
      if (err) return callback(err);
      isLastCommentsPage(function (err, isLastCommentsPage) {
        if (err) return callback(err);
        callback(null, comments, isFirstCommentsPage, isLastCommentsPage);
      });
    });
  });
}

function createCommentsContainer(callback) {
  getCurrentCommentsAndDetails(function (
    err,
    comments,
    isFirstCommentsPage,
    isLastCommentsPage
  ) {
    if (err) return onError(err);
    const commentsContainer = document.createElement("div");
    commentsContainer.className = "comments-container";
    commentsContainer.innerHTML = `
        <div class="comments-container">
        <div class="comments">
          <h3>Comments</h3>
          <ul class="comment-list">
            ${comments
              .map(
                (comment) => `
                  <li class="comment">
                    <div class="comment-metadata">
                      <div class="comment_author">${comment.author}</div>
                      <div class="comment_date">${comment.date}</div>
                    </div>
                    <div class="comment_content">${comment.content}</div>
                    <div class="delete-comment-icon icon" comment-id="${comment._id}"></div>
                  </li>
                `
              )
              .join("")}
          </ul>
          <div class="comment-nav-buttons">
            ${
              !isFirstCommentsPage
                ? '<div class="previous-comments-icon icon" id="previous-comments"></div>'
                : ""
            }
            ${
              !isLastCommentsPage
                ? '<div class="next-comments-icon icon" id="next-comments"></div>'
                : ""
            }
          </div>
          <form class="add-comment-form">
            <input id="comment-author" type="text" placeholder="Your name" class="comment-author" required>
            <input id= "comment-content" type="text" placeholder="Add a comment" class="comment-content" required>
            <button type="submit">Add Comment</button>
          </form>
        </div>
      </div>
      `;

    const addCommentForm = commentsContainer.querySelector(".add-comment-form");
    addCommentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const author = addCommentForm.querySelector(".comment-author").value;
      const content = addCommentForm.querySelector(".comment-content").value;
      addComment(author, content, function (err, res) {
        if (err) return onError(err);
        update();
      });
    });

    const deleteCommentIcon = commentsContainer.querySelectorAll(
      ".delete-comment-icon"
    );
    deleteCommentIcon.forEach((deleteIcon) => {
      deleteIcon.addEventListener("click", function (e) {
        const commentId = e.target.getAttribute("comment-id");
        deleteComment(commentId, function (err, res) {
          if (err) return onError(err);
          update();
        });
      });
    });

    if (!isFirstCommentsPage) {
      const prevComments =
        commentsContainer.querySelector("#previous-comments");
      prevComments.addEventListener("click", function (e) {
        getPreviousCommentsPage(function (err, res) {
          if (err) return onError(err);
          update();
        });
      });
    }

    if (!isLastCommentsPage) {
      const nextComments = commentsContainer.querySelector("#next-comments");
      nextComments.addEventListener("click", function (e) {
        getNextCommentsPage(function (err, res) {
          if (err) return onError(err);
          update();
        });
      });
    }

    return callback(null, commentsContainer);
  });
}

document
  .querySelector("#add_image_form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const title = document.getElementById("image_title").value;
    const author = document.getElementById("image_author").value;
    const picture = document.getElementById("image_picture").files[0];
    document.getElementById("add_image_form").reset();
    addImage(title, author, picture, function (err, res) {
      if (err) return onError(err);
      update();
    });
  });

document
  .querySelector("#toggle_image_form")
  .addEventListener("click", function (e) {
    const imageForm = document.querySelector("#add_image_form");
    imageForm.classList.toggle("hidden");
    imageForm.classList.toggle("slide-down");
  });

update();
