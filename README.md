# Hackathon API

This is a node.js api server written using [hapi](http://hapijs.com) framework. 

It's written in ES6 transpiled with Babel to allow full ES6 support. In order to use all of the ES6 features we're using [babel.js](https://babeljs.io) transpiler via the [require hook](https://babeljs.io/docs/usage/require/) as can be seen in index.js.


## Running Locally

```
npm install
npm start
open http://localhost:3000
```

## API documentation

The API is set up to generate its own documentation based on metadata provided with each server route. Since the documentation is generated from the actual route data itself, that helps mitigate out-of-date documentation. 

You can see the list of routes by running the server as described above and visiting: `/docs` in a browser. 

## Linting setup and config

Currently using [AirBnB's style guide and linting rules](https://github.com/airbnb/javascript) with only a few tweaks as can be seen in `.eslintrc`

## Running scripts

Run `npm run` to see all available scripts.

`npm run lint` will run linting tests on the whole project

## Running tests

`npm test`