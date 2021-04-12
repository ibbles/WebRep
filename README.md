# WebRep

A web server used to store, search, view and edit recipes using a browser.


## Tools

WebRep uses NodeJS, a server-side JavaScript runner using Google's V8.
- [Node.js Tutorial for beginners](https://www.youtube.com/watch?v=-u-j7uqU7sI) by thenewboston.
- [Node.js Tutorial in Visual Studio Code](https://code.visualstudio.com/docs/nodejs/nodejs-tutorial).

MongoDB is used for persistent storage.  
- [NodeJS MongoDB Tutorial](https://www.youtube.com/watch?v=Do_Hsb_Hs3c) by Derek Banas.

The NodeJS module Express is used for project generation and application structure.

## Sever Setup

Steps:
- Install NodeJS.
- Install NPM.
- Install MongoDB.
- Install Git.
- Checkout the repository.
- Use npm to install dependencies.
- Start the database server.
- Start the web server.
- Point your browser to [http://localhost:3000/](http://localhost:3000/).


### Ubuntu

```
$ sudo apt install nodejs npm
$ sudo apt install mongodb
```

### Windows

[Getting started with NodeJS and ExpressJS in Windows 10](https://medium.com/@zibon/getting-started-with-nodejs-and-expressjs-2018-51689dae024b)  
[How to install NodeJS and NPM on Windows](https://phoenixnap.com/kb/install-node-js-npm-on-windows)

Install NodeJS from [nodejs.org](https://nodejs.org/en/download/).  
Install MongoDB from [mongodb.com](https://www.mongodb.com/download-center?jmp=nav#community).  
Install Git from [git-scm.com](https://git-scm.com/downloads).



### Install and run WebRep

Start MongoDB:
```
$ LC_ALL="C.UTF-8" mongod --dbpath <PATH_TO_DATABASE_DIRECTORY> --journal
```

Use Git to clone the WebRep repository to the desired installation directory:
```
$ git clone https://github.com/ibbles/WebRep.git
```

Install the NPM dependencies used by WebRep. This is only needed once.
```
$ cd <WEBREP_PATH>
$ npm install
```

Start the web server.
```
$ cd <WEBREP_PATH>
$ node ./bin/www
```


## Developer Setup


Steps:
- Install NodeJS.
- Install NPM.
- Install MongoDB.
- Install Git.
- Checkout the repository.
- Use npm to install dependencies.
- Start the database server.
- Start the web server.
- Point your browser to [http://localhost:3000/](http://localhost:3000/).


### Ubuntu

Install NodeJS and NPM:
```
$ sudo apt install nodejs npm
```

Change to the projects directory in which the WebRep directory should be
created and install Express Generator:
```
$ cd <projects directory>
$ sudo npm install -g express-generator
```

Generate the WebRep project:
```
$ express --view="ejs" WebRep
$ cd WebRep
```

Install NPM dependencies:
```
$ npm install --save monk@^7.1.2 mongodb@^3.5.4
$ npm install
```

Test that the NodeJS + Express installation is working by running
```
$ npm start
```
and open `localhost:3000` in a web browser.


Install MongoDB:
```
$ sudo apt install mongodb
```

We can either use the default MongoDB instance created automatically, or close
that and launch a new one with out own database path.

If you want to disable the default MongoDB instance, do the following:
```
$ sudo systemctl stop mongodb
$ sudo systemctl disable mongodb
($ sudo update-rc.d mongodb disable) Not so sure about this one, the systemctl stuff should be enough.
```

Open a new terminal and start the MongoDB server with
```
LC_ALL="C.UTF-8" mongod --dbpath <PATH_TO_DATABASE_DIRECTORY> --journal
```


### Windows

[Getting started with NodeJS and ExpressJS in Windows 10](https://medium.com/@zibon/getting-started-with-nodejs-and-expressjs-2018-51689dae024b)  
[How to install NodeJS and NPM on Windows](https://phoenixnap.com/kb/install-node-js-npm-on-windows)

Install NodeJS from [nodejs.org](https://nodejs.org/en/download/).  
Install MongoDB from [mongodb.com](https://www.mongodb.com/download-center?jmp=nav#community).  
Install Git from [git-scm.com](https://git-scm.com/downloads).




### Initial setup

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



### MongoDB

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


## Troubleshooting

### Test the environment

Test NodeJS:
```
$ node
> console.log("Hello, World!")
Hello, World!
undefined
> process.exit(0);
```

Test MongoDB:
- Create folder for temporary database.
- Go to MongoDB installation folder in cmd prompt
- Use cmd prompt to run `bin/mongod --dbpath <temporary database path>`

