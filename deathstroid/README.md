# DEATHSTROID

Electron packager for Deathstroid game

## Requirements

* `nodejs`
* `yarn` (a better `npm`)
* `../batttle-pong`

## Instructions

### Make sure `battle-pong` is ready to go

Basically, this system encapsulates a processed & compiled version of `battle-pong` by placing it as a working web app inside of an Electron environment. So, `battle-pong` needs to be ready for us before we tackle anything here.

* **Head over to `../battle-pong`**, a.k.a. the place you'd normally find the game
* **Run `gulp build`**, even if `gulp watch` is running, just to be sure you get everything. This will process the HTML, CSS, and JavaScript needed to run the game, pass it through a compiler where appropriate, and output minified/uglified code, ready for production.

### Get this packaging system ready

* **Before doing anything with this system**, make sure you run `yarn` (which is just like `npm install`) to install all the dependencies we'll need to create the electron executable.
* Run `yarn prepare` to prepare the system, and bring a copy of `battle-pong` over to be used in the app.

### Make the app

* Any time you make a change to `battle-pong`, you'll want to bring those changes over here. So, make sure you run `yarn prepare` if you changed anything.
* Run `yarn dist`

Once `yarn dist` is finished, you will see a `dist` folder with distributable packages in it (e.g. a `dmg` for osx).

### Run it in dev mode

You can use `yarn dev` to run Electron without compiling. But, make sure you run `yarn prepare` first to bring changes over.

