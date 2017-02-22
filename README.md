# WebRep
A web server used to store, search, view and edit recipes using a browser.


## User Initial Setup
- Install NodeJS
- Install MongoDB
- Install Git
- Checkout the repository
- Use npm to install dependencies.
- Create symlink WebRep/public/RecipeImages -> WebRep/Recipes/Images/
- Start the database server.
- Start the web server.
- Point your browser to [http://localhost:3000/](http://localhost:3000/).

### NodeJS
Using NodeJS, a server-side JavaScript runner using Google's V8.
See "Node.js Tutorial for beginners" by thenewboston on YouTube.

> https://www.youtube.com/watch?v=-u-j7uqU7sI

Install NodeJS from

> https://nodejs.org/en/download/

Test that it works:
```
$ node
> console.log("Print this.")
Print this.
undefined
> process.exit(0);
```


### MongoDB

Install MongoDB from

> https://www.mongodb.com/download-center?jmp=nav#community

- Create folder for temporary database.
- Go to MongoDB installation folder in cmd prompt
- Use cmd prompt to run `bin/mongod --dbpath <temporary database path>`

### Git

Install Git from

> https://git-scm.com/downloads
> Use Git to clone existing repository from:
>   https://github.com/ibbles/WebRep.git


### CMD Prompt

- Go to repository folder in cmd prompt.
- Use cmd prompt to run `npm install` to download dependencies.
- Use cmd prompt to run `node ./bin/www` to start the server.


## Project dependencies and initial setup.

This section lists the external libraries that WebRep depends on and the steps that was used to initialize it.

These steps are not required when simply using or extending the application using the existing dependencies.

Dependencies:

- NodeJS
- MongoDB


### http
Using NodeJS module http for network management.
I think this is a core module.


### Connect
Using NodeJS module Connect for request management.
```
$ npm install connect
```


### Express
Using NodeJS module Express for project generation application structure.
```
$ npm install -g express-generator
$ cd <project folder>
$ express <project name> --ejs
$ cd <project name>
```


### MongoDB
Using MongoDB for storage.
See "NodeJS MongoDB Tutorial" by Derek Banas.

> https://www.youtube.com/watch?v=Do_Hsb_Hs3c

Edit package.json created by express.
In the "dependencies" scope, change
```
"serve-favicon": "~2.3.0"
```
to
```
"serve-favicon": "~2.3.0",
"kerberos": "~0.0.17",
"mongodb": "~2.0.33"
```
Unsure about the version numbers.


### Finalization
Download dependencies and created project structure using.
```
$ npm install
```
