if (!localStorage.getItem("gallery")) {
  localStorage.setItem(
    "gallery",
    JSON.stringify({ currImageId: -1, currCommentPage: 0 })
  );
}

/*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) _id 
        - (String) title
        - (String) author
        - (String) file
        - (Date) date

    comment objects must have the following attributes
        - (String) _id
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date

****************************** */

function sendFiles(method, url, data, callback) {
  const formdata = new FormData();
  Object.keys(data).forEach(function (key) {
    const value = data[key];
    formdata.append(key, value);
  });
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status !== 200)
      callback("[" + xhr.status + "]" + xhr.responseText, null);
    else callback(null, JSON.parse(xhr.responseText));
  };
  xhr.open(method, url, true);
  xhr.send(formdata);
}

function send(method, url, data, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status !== 200)
      callback("[" + xhr.status + "]" + xhr.responseText, null);
    else callback(null, JSON.parse(xhr.responseText));
  };
  xhr.open(method, url, true);
  if (!data) xhr.send();
  else {
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
  }
}

// check if the current image is the first image in the gallery
export function isFirstImage(callback) {
  const gallery = JSON.parse(localStorage.getItem("gallery"));
  send(
    "GET",
    "/api/images/" + gallery.currImageId + "/status/isLatest/",
    null,
    function (err, value) {
      if (err) return callback(err, null);
      return callback(null, value.isLatestImage);
    }
  );
}

// check if the current image is the last image in the gallery
export function isLastImage(callback) {
  const gallery = JSON.parse(localStorage.getItem("gallery"));
  send(
    "GET",
    "/api/images/" + gallery.currImageId + "/status/isOldest/",
    null,
    function (err, value) {
      if (err) return callback(err, null);
      return callback(null, value.isOldestImage);
    }
  );
}

// get current image from the gallery
export function getCurrentImage(callback) {
  const gallery = JSON.parse(localStorage.getItem("gallery"));
  if (gallery.currImageId === -1) return callback(null, null);
  send(
    "GET",
    "/api/images/" + gallery.currImageId,
    null,
    function (err, image) {
      if (err) return callback(err, null);
      return callback(null, image);
    }
  );
}

// get previous image from the gallery
export function getPreviousImage(callback) {
  const gallery = JSON.parse(localStorage.getItem("gallery"));
  send(
    "GET",
    "/api/images/" + gallery.currImageId + "/previous",
    null,
    function (err, image) {
      if (err) return callback(err, null);
      gallery.currImageId = image._id;
      gallery.currCommentPage = 0;
      localStorage.setItem("gallery", JSON.stringify(gallery));
      return callback(null, image);
    }
  );
}

// get next image from the gallery
export function getNextImage(callback) {
  const gallery = JSON.parse(localStorage.getItem("gallery"));
  send(
    "GET",
    "/api/images/" + gallery.currImageId + "/next",
    null,
    function (err, image) {
      if (err) return callback(err, null);
      gallery.currImageId = image._id;
      gallery.currCommentPage = 0;
      localStorage.setItem("gallery", JSON.stringify(gallery));
      return callback(null, image);
    }
  );
}

// add an image to the gallery
export function addImage(title, author, picture, callback) {
  const gallery = JSON.parse(localStorage.getItem("gallery"));
  sendFiles(
    "POST",
    "/api/images/",
    { title: title, author: author, picture: picture },
    function (err, res) {
      if (err) return callback(err, null);
      gallery.currImageId = res._id;
      gallery.currCommentPage = 0;
      localStorage.setItem("gallery", JSON.stringify(gallery));
      return callback(null, res);
    }
  );
}

// delete an image from the gallery given its imageId
export function deleteImage(imageId, callback) {
  isFirstImage(function (err, isFirstImage) {
    if (err) return callback(err, null);
    isLastImage(function (err, isLastImage) {
      if (err) return callback(err, null);
      if (isFirstImage && isLastImage) {
        const gallery = JSON.parse(localStorage.getItem("gallery"));
        gallery.currImageId = -1;
        gallery.currCommentPage = 0;
        localStorage.setItem("gallery", JSON.stringify(gallery));
        send("DELETE", "/api/images/" + imageId + "/", null, function (err, res) {
          if (err) return callback(err, null);
          return callback(null, res);
        });
      }
      else if (isFirstImage) {
        getNextImage(function (err, res) {
          if (err) return callback(err, null);
          const gallery = JSON.parse(localStorage.getItem("gallery"));
          gallery.currCommentPage = 0;
          localStorage.setItem("gallery", JSON.stringify(gallery));
          send("DELETE", "/api/images/" + imageId + "/", null, function (err, res) {
            if (err) return callback(err, null);
            return callback(null, res);
          });
        });
      } else {
        getPreviousImage(function (err, res) {
          if (err) return callback(err, null);
          const gallery = JSON.parse(localStorage.getItem("gallery"));
          gallery.currCommentPage = 0;
          localStorage.setItem("gallery", JSON.stringify(gallery));
          send("DELETE", "/api/images/" + imageId + "/", null, function (err, res) {
            if (err) return callback(err, null);
            return callback(null, res);
          });
        });
      }
    });
  });
}

// add a comment to an image
export function addComment(author, content, callback) {
    const gallery = JSON.parse(localStorage.getItem("gallery"));
    const imageId = gallery.currImageId;
  send(
    "POST",
    "/api/comments/",
    { imageId: imageId, author: author, content: content },
    function (err, res) {
      if (err) return callback(err, null);
      return callback(null, res);
    }
  );
}

// delete a comment to an image
export function deleteComment(commentId, callback) {
  send("DELETE", "/api/comments/" + commentId + "/", null, function (err, res) {
    if (err) return callback(err, null);
    return callback(null, res);
  });
}

// get current page of comments
export function getCommentsPage(callback) {
  const gallery = JSON.parse(localStorage.getItem("gallery"));
  const imageId = gallery.currImageId;
  const page = gallery.currCommentPage;
  send(
    "GET",
    "/api/comments/" + imageId + "/" + page + "/",
    null,
    function (err, comments) {
      if (err) return callback(err, null);
      return callback(null, comments);
    }
  );
}

// get next page of comments
export function getNextCommentsPage(callback) {
  const gallery = JSON.parse(localStorage.getItem("gallery"));
  gallery.currCommentPage++;
  localStorage.setItem("gallery", JSON.stringify(gallery));
  return getCommentsPage(callback);
}

// get previous page of comments
export function getPreviousCommentsPage(callback) {
  const gallery = JSON.parse(localStorage.getItem("gallery"));
  gallery.currCommentPage--;
  localStorage.setItem("gallery", JSON.stringify(gallery));
  return getCommentsPage(callback);
}

// see if we are on the first page of comments
export function isFirstCommentsPage(callback) {
  const gallery = JSON.parse(localStorage.getItem("gallery"));
  return callback(null, gallery.currCommentPage === 0);
}

// see if we are on the last page of comments
export function isLastCommentsPage(callback) {
  const gallery = JSON.parse(localStorage.getItem("gallery"));
  const imageId = gallery.currImageId;
  const page = gallery.currCommentPage;
  send(
    "GET",
    "/api/comments/" + imageId + "/" + page + "/isLastPage/",
    null,
    function (err, value) {
      if (err) return callback(err, null);
      return callback(null, value.isLastPage);
    }
  );
}
