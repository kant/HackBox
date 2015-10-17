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


## basic structure

**note this is quite rough** 

This is not meant to be a full DB schema, just trying to wrap my head around the data

```
┌──────────────────────┐
│ projects             │
├────────────────────  │                                     ┌───────────────────┐
│ id                   │        ┌───────────────────┐        │ participants      │
│ title                │        │ hackathons        │        ├───────────────────┤
│ tagline              │        ├───────────────────┤        │ id                │
│ status               │        │ id                │        │ name              │
│ description          │        │ start_date        │        │ username          │
│ owner_id             │        │ end_date          │        │ email             │
│ venue_id             │╲       │ num_participants  │        │ bio               │
│ stat_likes           │───────┼│ num_cities        │        │ job_title         │
│ stat_shares          │╱       │ num_countries     │        │ company_name      │
│ stat_comments        │        │ num_first_timers  │        │ registration_date │◇─┐
│ stat_views           │        │ num_unique_skills │        │ photo             │  │
│ stat_views_uniq      │        │ num_projects      │        │ address_1         │  │
│ stat_videoviews      │        │ num_open_projects │        │ address_2         │  │
│ stat_videoviews_uniq │        └───────────────────┘        │ city              │  │
│ resources            │                  ┼                  │ state             │  │
│ participant_ids []   │                  │                  │ country           │  │
└──────────────────────┘                  │                  │ twitter           │  │
            ┼                             │                  │ facebook          │  │
            │                             │                  │ linkedin          │  │
            │                             │                  └───────────────────┘  │
            │                             │                            ┼            │
            │                             │                            │            │
            │                             │    ┌───────────────────┐   │            │
            │                             │    │ attended_events   │   │            │
            │                             │   ╱├───────────────────┤╲  │            │
            │                             └────│ participant_id    │───┘            │
            │                                 ╲│ hackathon_id      │╱               │
            │                                  └───────────────────┘                │
            │                                                                       │
            │                                                                       │
            │                                                                       │
            │                     ┌───────────────────┐                             │
            │                     │ comments          │                             │
            │                     ├───────────────────┤                             │
            │                    ╱│ id                │╲                            │
            └─────────────────────│ text              │─────────────────────────────┘
                                 ╲│ participant_id    │╱
                                  │ created_date      │
                                  └───────────────────┘
```

## Running tests

`npm test`