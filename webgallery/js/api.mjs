/*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) _id 
        - (String) title
        - (String) author
        - (Date) date

    comment objects must have the following attributes
        - (String) _id
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date

****************************** */

// add an image to the gallery
export function addImage(title, author, file, callback) {}

// delete an image from the gallery given its imageId
export function deleteImage(imageId, callback) {}

// add a comment to an image
export function addComment(imageId, author, content, callback) {}

// delete a comment to an image
export function deleteComment(commentId, callback) {}
