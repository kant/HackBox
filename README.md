# HackBox API

This is a node.js api server written using [hapi](http://hapijs.com) framework. 

It's written in ES6 transpiled with Babel to allow full ES6 support. In order to use all of the ES6 features we're using [babel.js](https://babeljs.io) transpiler via the [require hook](https://babeljs.io/docs/usage/require/) as can be seen in server.js.

## Running Locally

Make sure MySQL is installed and running locally. If you use these settings for your local DB you won't have to mess with configs:

```json
{
  "database": "hackbox",
  "host": "localhost",
  "user": "root",
  "password": "pass"
}
```

Once it's up and running you can run the server with:

```
npm install
npm start
open http://localhost:3000/documentation
```

Running the tests will also seed the DB with test data.

Run the tests with `npm test`


## Remote deployment

As of this writing the API is deployed to Azure here: https://hackbox-api.azurewebsites.net/documentation

Production logs available here: https://hackbox-api.scm.azurewebsites.net/api/vfs/LogFiles/Application/index.html

## API documentation

The API is generates its own documentation based on metadata provided with each route. Since the documentation is generated from the actual route data itself, that helps mitigate out-of-date documentation. 

To see it, run the server as described above and visit: `http://localhost:3000/documentation` in a browser.

It's using Swagger UI which also includes a test client so you can query the API from the browser:

![screenshot of docs page](https://cldup.com/1HYizp2fQc.png)


## On route configs

As much as possible the routes are strictly validated. That means each API endpoint will only let data through that passes validation for that route. It uses [Joi](https://github.com/hapijs/joi/blob/master/API.md) for this.

All routes should have validation rules for anything it expects to trust.

There's a global server config **that will strip all unkown keys from the JSON payloads** of requests.

This means that you'll can't just send more data and expect it to be available inside you're route handlers.

This protects against issues like [mass assignment](http://brakemanscanner.org/docs/warning_types/mass_assignment/).

So if you're seeing things go missing from request payloads, it's because they're not being validated and therefore, ignored.


## Linting setup

This repo uses [Walmart's eslint config for ES6-node](https://github.com/walmartlabs/eslint-config-defaults) with only a few tweaks as can be seen in `.eslintrc` there are some modifications in the `data` folder to allow for `snake_case` key names for API output.

There are a few other exceptions specified via `/*eslint*/` comments in certain files.

Linting is automatically run after the test suite or can be run via `npm run lint`.

## Ops setup and deploy

This is deployed on Azure but is meant to be as flexible/configurable as possible. It's a secondary goal to make it configured to the point where it could be deployed by anybody from GitHub using a [Deploy to Azure button](http://www.bradygaster.com/post/the-deploy-to-azure-button).

## How configs are handled

Any time you need access to config items within code simply require the `/.config.js` file at the project root.

It will pull in the configuration file from the `config` directory with the same name as the current value of the `NODE_ENV` envronment variable. If `NODE_ENV` is not defined, `./config/development.json` will be used.

Please note that all sensitive data is expected to be passed via environment variables rather than checked into this codebase.

To support this, the config reading module will replace any strings in the config that look like this: `$HELLO_WORLD` with the corresponding value from `process.env`. If the value doesn't exist, the module will throw an error letting you know what's missing.

This allows us to check-in all the config files, allows configs to have arbitrary structure, and allows all non-sensitive configuration changes to be checked into the repo.

To repeat: **please avoid putting any sensitive data** into this code repository. 


## Running scripts

Run `npm run` to list all available scripts.

## CORS

In order to support easily building web clients to interract with this API, the **C**ross **O**rigin **R**esource **S**haring policy for the API is open to all domains.

## Fixed data sources

There are some fixed data sources, such as valid country names, etc.

These are all located in `/data/fixed-data` and available through the API using the `/data-sets/*` routes.

Clients using the api should retrieve the available options from the API when rendering UI to users. So that there's only one source of truth for what should be considered valid options for countries, participant roles, etc.

## db diagram

Created with [Mondraw](http://monodraw.helftone.com/) original file in `/graphics`


```
                               ┌───────────────────┐      ┌───────────────────┐
                               │ hackathons        │      │ hackathon_admins  │
┌──────────────────────┐       ├───────────────────┤     ╱├───────────────────┤╲
│ projects             │       │ id                │  ┌───│ user_id           │──┐
├──────────────────────┤       │ name              │  │  ╲│ hackathon_id      │╱ │
│ id                   │       │ slug              │  │   └───────────────────┘  │
│ owner_id             │       │ tagline           │  │                          │
│ hackathon_id         │       │ description       │  │   ┌───────────────────┐  │
│ title                │       │ judges            │  │   │ participants      │  │
│ tagline              │       │ rules             │  │  ╱├───────────────────┤╲ │
│ status               │       │ schedule          │  ├───│ user_id           │──┤
│ description          │       │ quick_links       │  │  ╲│ hackathon_id      │╱ │
│ image_url            │       │ resources         │  │   └───────────────────┘  │
│ code_repo_url        │       │ logo_url          │  │                          │
│ prototype_url        │       │ header_image_url  │  │   ┌───────────────────┐  │
│ supporting_files_url │╲      │ start_at          │  │   │ users             │  │
│ inspiration          │──────┼│ end_at            │┼─┘   ├───────────────────┤  │
│ how_it_will_work     │╱      │ org               │      │ id                │  │
│ needs_hackers        │       │ city              │      │ name              │  │
│ needed_role          │       │ country           │      │ family_name       │  │
│ json_needed_expertise│       │ color_scheme      │      │ given_name        │  │
│ product_focus        │       │ created_at        │      │ email             │  │
│ customer_type        │       │ updated_at        │      │ bio               │  │
│ json_tags            │       │ show_name         │      │ country           │  │
│ video_id             │       │ show_judges       │      │ created_at        │┼─┘
│ created_at           │       │ show_rules        │      │ updated_at        │
│ updated_at           │       │ show_schedule     │      │ deleted           │
│ deleted              │       │ deleted           │      │ json_working_on   │
│ json_meta            │       │ is_public         │      │ json_expertise    │
└──────────────────────┘       │ is_published      │      │ primary_role      │
            ┼                  │ json_meta         │      │ product_focus     │
            │                  └───────────────────┘      │ json_profile      │
            │                            │                │ json_meta         │
            │                            │                └───────────────────┘
            │                            │                          ┼
            │                            │                          │
            │                           ╱│╲                         │
            │                  ┌───────────────────┐                │
            │                  │ members           │                │
            │                  ├───────────────────┤                │
            │                 ╱│ user_id           │╲               │
            ├──────────────────│ project_id        │────────────────┤
            │                 ╲│ hackathon_id      │╱               │
            │                  │ joined_at         │                │
            │                  └───────────────────┘                │
            │                  ┌───────────────────┐                │
            │                  │ comments          │                │
            │                  ├───────────────────┤                │
            │                 ╱│  id               │╲               │
            ├──────────────────│  user_id          │────────────────┤
            │                 ╲│  project_id       │╱               │
            │                  │  body             │                │
            │                  │  created_at       │                │
            │                  └───────────────────┘                │
            │                  ┌───────────────────┐                │
            │                  │ likes             │                │
            │                 ╱├───────────────────┤╲               │
            ├──────────────────│ user_id           │────────────────┤
            │                 ╲│ project_id        │╱               │
            │                  │ created_at        │                │
            │                  └───────────────────┘                │
            │                  ┌───────────────────┐                │
            │                  │ shares            │                │
            │                 ╱├───────────────────┤╲               │
            ├──────────────────│ user_id           │────────────────┤
            │                 ╲│ project_id        │╱               │
            │                  │ created_at        │                │
            │                  └───────────────────┘                │
            │                  ┌───────────────────┐                │
            │                  │ views             │                │
            │                 ╱├───────────────────┤╲               │
            └──────────────────│ user_id           │────────────────┘
                              ╲│ project_id        │╱
                               │ created_at        │
                               └───────────────────┘
```
