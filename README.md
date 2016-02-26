# HackBox API

This is a node.js api server written using [hapi](http://hapijs.com) framework.

It's written in ES6 transpiled with Babel to allow full ES6 support. In order to use all of the ES6 features we're using [babel.js](https://babeljs.io) transpiler via the [require hook](https://babeljs.io/docs/usage/require/) as can be seen in server.js.

## Getting Started

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

Run the tests with `npm test`.

Further information is available in the [development][] docs.

## Remote Deployment

Deploys are done via Git. Every user deploying needs to have access get access to the Azure portal to acquire Git access.

See the [production][] docs for more information on gaining access and setting up a production git remote.

Deploys are done with a simple Git push:

```sh
$ git push production master
```

It's a secondary goal to make it configured to the point where it could be deployed by anybody from GitHub using a [Deploy to Azure button](http://www.bradygaster.com/post/the-deploy-to-azure-button).

The deployed API is available at:
https://hackbox-api.azurewebsites.net/documentation

Production logs are available:
https://hackbox-api.scm.azurewebsites.net/api/vfs/LogFiles/Application/index.html

With access, the website is deployed at:
https://hackbox-stage.azurewebsites.net/

## API Documentation

The API is generates its own documentation based on metadata provided with each route. Since the documentation is generated from the actual route data itself, that helps mitigate out-of-date documentation.

To see it, run the server as described above and visit: `http://localhost:3000/documentation` in a browser.

It's using Swagger UI which also includes a test client so you can query the API from the browser:

![screenshot of docs page](https://cldup.com/1HYizp2fQc.png)


## Available Scripts

```
$ npm run

Lifecycle scripts included in hackathon:
  pretest
    npm run reset-db && npm run init-db
  start
    node server.js
  test
    AUTH_ENABLED=true node test/index | tap-spec && npm run lint

available via `npm run-script`:
  init-db
    npm run migrate && npm run seed-db
  lint
    eslint .
  migrate
    knex migrate:latest
  rollback
    knex migrate:rollback
  reset-db
    node reset-db.js
  seed-db
    knex seed:run
```


## Database diagram

Created with [Mondraw](http://monodraw.helftone.com/) original file in `/graphics`

```
┌─────────────────────────────────┐   ┌───────────────────┐     ┌───────────────────┐
│ projects                        │   │ hackathons        │     │ hackathon_admins  │
├─────────────────────────────────┤   ├───────────────────┤    ╱├───────────────────┤╲
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
│ json_devices_focus              │   │ show_judges       │     │ city              │  │
│ json_dynamics_focus             │   │ show_rules        │     │ created_at        │  │
│ json_third_party_platforms_focus│   │ show_schedule     │     │ updated_at        │┼─┘
│ json_cloud_enterprise_focus     │   │ deleted           │     │ deleted           │
│ json_consumer_services_focus    │   │ is_public         │     │ json_working_on   │
│ json_office_focus               │   │ is_published      │     │ json_expertise    │
│ json_misc_focus                 │   │ json_meta         │     │ primary_role      │
│ json_other_focus                │   └───────────────────┘     │ product_focus     │
│ customer_type                   │             ┼               │ profession        │
│ json_tags                       │    ┌────────┤               │ discipline        │
│ video_id                        │    │        │               │ alias             │
│ created_at                      │    │        └────────┐      │ json_profile      │
│ updated_at                      │    │                 │      │ json_meta         │
│ deleted                         │    │                 │      │ json_interests    │
└─────────────────────────────────┘    │                ╱│╲     └───────────────────┘
                 ┼                     │       ┌───────────────────┐      ┼
             ┌───┴────────────┐        │       │ members           │      │
            ╱│╲               │        │       ├───────────────────┤      │
┌─────────────────────────┐   │        │      ╱│ user_id           │╲     │
│ awards                  │   └────────┼──┬────│ project_id        │──────┤
├─────────────────────────┤            │  │   ╲│ hackathon_id      │╱     │
│ id                      │            │  │    │ joined_at         │      │
│ hackathon_id            │            │  │    └───────────────────┘      │
│ project_id              │            │  │    ┌───────────────────┐      │
│ name                    │            │  │    │ comments          │      │
│ json_meta               │            │  │    ├───────────────────┤      │
└─────────────────────────┘            │  │   ╱│ id                │╲     │
             ┼                         │  ├────│ user_id           │──────┤
             │                         │  │   ╲│ project_id        │╱     │
            ╱│╲                        │  │    │ body              │      │
┌─────────────────────────┐            │  │    │ created_at        │      │
│ awards_award_categories │            │  │    └───────────────────┘      │
├─────────────────────────┤            │  │    ┌───────────────────┐      │
│ award_id                │            │  │    │ likes             │      │
│ award_category_id       │            │  │   ╱├───────────────────┤╲     │
└─────────────────────────┘            │  ├────│ user_id           │──────┤
            ╲│╱                        │  │   ╲│ project_id        │╱     │
             │                         │  │    │ created_at        │      │
             ┼                         │  │    └───────────────────┘      │
┌─────────────────────────┐            │  │    ┌───────────────────┐      │
│ award_categories        │            │  │    │ shares            │      │
├─────────────────────────┤            │  │   ╱├───────────────────┤╲     │
│ id                      │╲           │  ├────│ user_id           │──────┤
│ hackathon_id            │────────────┘  │   ╲│ project_id        │╱     │
│ parent_id               │╱              │    │ created_at        │      │
│ name                    │               │    └───────────────────┘      │
│                         │               │    ┌───────────────────┐      │
└─────────────────────────┘               │    │ views             │      │
                                          │   ╱├───────────────────┤╲     │
                                          └────│ user_id           │──────┘
                                              ╲│ project_id        │╱
                                               │ created_at        │
                                               └───────────────────┘
```

[development]: ./DEVELOPMENT.md
[production]: ./PRODUCTION.md
