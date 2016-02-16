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

This means that you'll can't just send more data and expect it to be available inside your route handlers.

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

## DB diagram

Created with [Mondraw](http://monodraw.helftone.com/) original file in `/graphics`


```
┌─────────────────────────────────┐   ┌───────────────────┐     ┌───────────────────┐
│ projects                        │   │ hackathons        │     │ hackathon_admins  │
├───────────────────────          │   ├───────────────────┤    ╱├───────────────────┤╲
│ id                              │   │ id                │  ┌──│ user_id           │──┐
│ owner_id                        │   │ name              │  │ ╲│ hackathon_id      │╱ │
│ hackathon_id                    │   │ slug              │  │  └───────────────────┘  │
│ title                           │   │ tagline           │  │                         │
│ tagline                         │   │ description       │  │  ┌───────────────────┐  │
│ status                          │   │ judges            │  │  │ participants      │  │
│ description                     │   │ rules             │  │ ╱├───────────────────┤╲ │
│ image_url                       │   │ schedule          │  ├──│ user_id           │──┤
│ code_repo_url                   │   │ quick_links       │  │ ╲│ hackathon_id      │╱ │
│ prototype_url                   │   │ resources         │  │  └───────────────────┘  │
│ supporting_files_url            │   │ logo_url          │  │                         │
│ inspiration                     │   │ header_image_url  │  │  ┌───────────────────┐  │
│ how_it_will_work                │   │ start_at          │  │  │ users             │  │
│ needs_hackers                   │ ┌┼│ end_at            │┼─┘  ├───────────────────┤  │
│ writing_code                    │ │ │ org               │     │ id                │  │
│ existing                        │╲│ │ city              │     │ name              │  │
│ external_customers              │─┘ │ country           │     │ family_name       │  │
│ needed_role                     │╱  │ color_scheme      │     │ given_name        │  │
│ json_needed_expertise           │   │ created_at        │     │ email             │  │
│ product_focus                   │   │ updated_at        │     │ bio               │  │
│ json_windows_focus              │   │ show_name         │     │ country           │  │
│ json_devices_focus              │   │ show_judges       │     │ created_at        │┼─┘
│ json_dynamics_focus             │   │ show_rules        │     │ updated_at        │
│ json_third_party_platforms_focus│   │ show_schedule     │     │ deleted           │
│ json_cloud_enterprise_focus     │   │ deleted           │     │ json_working_on   │
│ json_consumer_services_focus    │   │ is_public         │     │ json_expertise    │
│ json_office_focus               │   │ is_published      │     │ primary_role      │
│ json_misc_focus                 │   │ json_meta         │     │ product_focus     │
│ json_other_focus                │   └───────────────────┘     │ json_profile      │
│ customer_type                   │             ┼               │ json_meta         │
│ json_tags                       │    ┌────────┴────────┐      │ json_interests    │
│ video_id                        │    │                 │      └───────────────────┘
│ created_at                      │    │                ╱│╲               ┼
│ updated_at                      │    │       ┌───────────────────┐      │
│ deleted                         │    │       │ members           │      │
└─────────────────────────────────┘    │       ├───────────────────┤      │
                 ┼                     │      ╱│ user_id           │╲     │
             ┌───┴─────────────────────┼──┬────│ project_id        │──────┤
            ╱│╲                        │  │   ╲│ hackathon_id      │╱     │
┌─────────────────────────┐            │  │    │ joined_at         │      │
│ awards                  │            │  │    └───────────────────┘      │
├─────────────────────────┤            │  │    ┌───────────────────┐      │
│ id                      │            │  │    │ comments          │      │
│ hackathon_id            │            │  │    ├───────────────────┤      │
│ project_id              │            │  │   ╱│ id                │╲     │
│ name                    │            │  ├────│ user_id           │──────┤
│ json_meta               │            │  │   ╲│ project_id        │╱     │
└─────────────────────────┘            │  │    │ body              │      │
             ┼                         │  │    │ created_at        │      │
             │                         │  │    └───────────────────┘      │
            ╱│╲                        │  │    ┌───────────────────┐      │
┌─────────────────────────┐            │  │    │ likes             │      │
│ awards_award_categories │            │  │   ╱├───────────────────┤╲     │
├─────────────────────────┤            │  ├────│ user_id           │──────┤
│ award_id                │            │  │   ╲│ project_id        │╱     │
│ award_category_id       │            │  │    │ created_at        │      │
└─────────────────────────┘            │  │    └───────────────────┘      │
            ╲│╱                        │  │    ┌───────────────────┐      │
             │                         │  │    │ shares            │      │
             ┼                         │  │   ╱├───────────────────┤╲     │
┌─────────────────────────┐            │  ├────│ user_id           │──────┤
│ award_categories        │            │  │   ╲│ project_id        │╱     │
├─────────────────────────┤            │  │    │ created_at        │      │
│ id                      │╲           │  │    └───────────────────┘      │
│ hackathon_id            │────────────┘  │    ┌───────────────────┐      │
│ parent_id               │╱              │    │ views             │      │
│ name                    │               │   ╱├───────────────────┤╲     │
│                         │               └────│ user_id           │──────┘
└─────────────────────────┘                   ╲│ project_id        │╱
                                               │ created_at        │
                                               └───────────────────┘
```
