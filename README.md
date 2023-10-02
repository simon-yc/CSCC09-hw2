[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/bgsG8hha)
# Web Gallery: The Backend

The objective of these assignments is to build an application called _The Web Gallery_ where users can share
pictures and comments. This application is similar to existing web applications such as Facebook, Instagram
or Google Photos.

In this second assignment, you will concentrate on the backend. More specifically, you are going to build a Web API
following the REST design principles.

## Instructions

For this assignment, you should use Node.js, the Express web framework and the embedded NoSQL database NeDB to build your back-end. Fee free to use any additional Node.js utility packages as needed. Make sure that all of these required packages are recorded in the `package.json` file. You should not need more than the packages that were introduced in the labs. Make sure that all of these required packages are recorded in the `package.json` file.

### Code quality and organization

All of your work should be well organized. This directory should be organized as follows:

- `webgallery/app.mjs`: the main file
- `webgallery/package.json` and `package-lock.json`: the Node.js package file
- `webgallery/static/`: your frontend developed for assignment 1 (HTML, CSS, Javascript and UI media files)
- `webgallery/db/`: the NeDB database files
- `webgallery/uploads/`: the uploaded files
- `webgallery/test/`: the unit test files
- `.gitignore`: list of files that should not be committed to github

Your code must be of good quality and follow all guidelines given during lectures and labs. Remember, any code found online and improperly credited can constitute an academic violation.

### Submission

You should submit your work to your Github course repository and Gradescope.

Before submitting your final version. You are strongly recommended checking that your code is portable. To do so:

- push your work to Github
- clone it into a new directory
- install all packages with the single command `npm install` that will install all packages found in the `package.json` file
- run the unit tests with the command `npm run test`
- start the app with the command `npm run prod`

## Implementing and testing the Web API

In this part, you are going to implement a Web API for your gallery and the corresponding unit tests. This api should follow the REST design principles
seen in class. This means that the api should define CRUD operations (Create, Read, Update, Delete) on collections and
elements. For your application, users should be able to:

- add a new image to the gallery by uploading a file
- retrieve and delete a given image
- add a comment to a given image
- retrieve comments for a given image (a subset of comment at a time but not all comments at once)
- delete a given comment

As the previous assignment, we provide a starter file called `api.mjs` for the **the Frontend API**. This api must be re-implemented. Instead of storing data locally, the *the Frontend API** should call the Web API using Ajax. Therefore, all api methods are now asynchronous and take a callback method as parameter. 

Make sure that your unit tests are exhaustive. They should properly test your API.

## Integrating the frontend

This part of the assignment is worth 10% only and builds on top of what you have already built for assignment 1.

In this part, you are going to update your frontend to work with the Web API. As done in assignment 1, this frontend
must be a [Single-Page Application (SPA)](https://en.wikipedia.org/wiki/Single-page_application) that loads a single
HTML webpage. This webpage is updated dynamically as the user interacts with it. The page does not reload nor transfer
control to another page (except for the credits page that you keep separated). All features written for assignment 1
should be updated or completed to push and pull data from the API.

## Deployment

This part is still TBD. The instructor will post an update on Piazza in the next few days. 