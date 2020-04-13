# Interactive Map
Interactive map is an application that allows users to sign up and create markers on a map. Feel free to fork and use for your own crowd-sourced mapping projects!

## Overview

Interactive Map is setup using the popular MERN stack: a NodeJS/Express backend, a React frontend, and a MongoDB database. The application serves a set of API routes as well as an interface which displays a map that anyone can view and that registered users can add to. The project currently includes a TravisCI pipeline that is configured to automatically deploy to Carolina Cartography's infrastructure, but this will be better abstracted in the future.

## Model

Interactive Map relies on the following data structures:
- *User*: User objects help organize who is adding places to a map. To prevent abuse, only users can add places to a map. Users can register with an email address and password.
- *Place*: A Place is a point on a map. It is owned by a User. Only the User or a map administrator can edit or delete a place once it has been created. A place has a title, description and other metadat.
- *Map*: A Map is a collection of places.

Coming soon:
* *Shape*: A Shape is an area on a Map. It has the same properties as a Place.

## Basic Introduction

Here's an overview of the structure of the application and how it fits together. It's written for folks that are familiar with the basics of web development with HTML and Javascript, but haven't worked with APIs or React.

### API
All creation and querying of objects in the MongoDB database is handled by the API, contained in the `/api` folder. The API is organized around the following file structure:
- *model*: The model is a set of database object definitions. Each object has a schema (a list of properties), and a set of static methods and instance methods. Instance methods refer to a particular instance of an object (such as edit, which updates a particular user object), while static methods are not (such as create, which is called when you want to create a particular instance).
- *routes*: Routes are a set of functions which allow for interaction with the objects. The routes are responsible for validating interactions, like making sure a user is allowed to edit or delete a place, or that a user's password is correct. Routes are used to _get_, _set_, or _delete_ objects.
- *tools*: The Tools folder contains sets of reusable functions used throughout the model functions and route functions.

### UI
The user interface is a React application contained in the `/app` folder. One of React's popular features is that it allows JavaScript functions to return HTML, so the creation of new views and features all takes place within the Javascript. However, React code needs to be compiled in order to be viewed in the browser, so we'll never directly open an HTML file either. Instead, when working locally, vist http://localhost:3000 (where 3000 is the port provided as an environment variable) to view the site.

The UI is organized around the following file structure:
- *index.js*: Initializes the React application
- *App.js*: Configures the application's different views. This is also a good place to put code that belongs outside a given view, like navigation.
- *components*: Components are the building blocks of a React app - they contains a `render()` function which outputs HTML, and other functions which are called when a component is "mounted".
- *views*: Views are the top-level React components displayed by `App.js`
- *scss*: Application styles live here.

To learn more about React, visit React's official walkthrough here: https://reactjs.org/tutorial/tutorial.html#overview

## Setup

To get started locally, clone the repo and run `npm install`  

Set the following environment variables:
```
port: port which Express server listens on
secret: secret used for authentication
mongo_host: MongoDB host address
mongo_name: MongoDB database name
mongo_user: MongoDB username
mongo_pass: MongoDB password
```

## Run
`npm run dev` to watch serve and watch UI and API in paralell  
`npm run start` to start application