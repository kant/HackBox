# HackBox API

This is a node.js api server written using [hapi](http://hapijs.com) framework. 

It's written in ES6 transpiled with Babel to allow full ES6 support. In order to use all of the ES6 features we're using [babel.js](https://babeljs.io) transpiler via the [require hook](https://babeljs.io/docs/usage/require/) as can be seen in index.js.

## Questions

1. Can one user ever be on multiple projects in the same hackathon?
2. Can the owner of a project change?
3. Do projects ever exist outside of a hackathon, or in multiple hackathons? (I'm assuming not)
4. I mentioned previously that if open sourcing this project is a goal, we may want to use the [knex](http://knexjs.org/) SQL builder because it's quite popular and supports more databases than any other such node.js library that I'm aware of. Unfortunately there's no official SQL Server support. Azure supports MySQL and that *is* supported. Should we use MySQL?
5. In the same vein as #4 auth should ideally also be pluggable/flexible. To that end, I'd suggest the [Hapi.js "bell" library](https://github.com/hapijs/bell) which supports Microsoft Live auth, which is what we'd use here, but would also make it easy for people to use other auth providers like: GitHub, Google, Twitter, etc. It deals with normalizing user profiles between providers, and it would let us leverage existing Live profiles without having to do the manual DB dump/sync that was described. 

## Running Locally

```
npm install
npm start
open http://localhost:3000
```

## API documentation

The API is set up to generate its own documentation based on metadata provided with each server route. Since the documentation is generated from the actual route data itself, that helps mitigate out-of-date documentation. 

You can see the list of routes by running the server as described above and visiting: `/docs` in a browser. 

## Hairbrained Ideas/Suggestions

- Get this configured to the point where it could be deployed by anybody from GitHub using a [Deploy to Azure button](http://www.bradygaster.com/post/the-deploy-to-azure-button).

## Linting setup

Currently using [Walmart's eslint config for ES6-node](https://github.com/walmartlabs/eslint-config-defaults) with only a few tweaks as can be seen in `.eslintrc` there are some modifications in the `data` folder to allow for `snake_case` key names for API output.

## How configs are handled

Any time you need access to config items within code simply require the `/.config.js` file at the project root.

It will pull in the configuration file from the `config` directory with the same name as the current value of the `NODE_ENV` envronment variable. If `NODE_ENV` is not defined, `./config/development.json` will be used.

Please note that all sensitive data is expected to be passed via environment variables rather than checked into this codebase.

To support this, the config reading module will replace any strings in the config that look like this: `$HELLO_WORLD` with the corresponding value from `process.env`. If the value doesn't exist, the module will throw an error letting you know what's missing.

This allows us to check-in all the config files, allows configs to have arbitrary structure, and allows all non-sensitive configuration changes to be checked into the repo.

To repeat: **please avoid putting any sensitive data** into this code repository. 

## Running scripts

Run `npm run` to see all available scripts.

`npm run lint` will run linting tests on the whole project.

`npm run init-db` will create and seed a local SQLite3 database to use for development.


## RESTful routes

Draft of potential routes. 

The actual registered routes can be seen by running the server and visiting `/docs`.

```
// managing hackathons (editing would be admin-only functionality)
GET    /hackathons (paginated list)
POST   /hackathons
PUT    /hackathons/{id}
DELETE /hackathons/{id}
GET    /hackathons/{id}

// edits to users would happen as a root resource
GET    /users (paginated, filterable list)
POST   /users
PUT    /users/{id}
DELETE /users/{id}
GET    /users/{id}

// filtered user lists would still be available 
// through hackathon resource but editing would happen
// at root level for `/users`
GET    /hackathons/{id}/participants (paginated, filterable list)
POST   /hackathons/{id}/participants/{user_id}
DELETE /hackathons/{id}/participants/{user_id}

// managing projects in hackathons
GET    /hackathons/projects (paginated, filterable list)
POST   /hackathons/projects
PUT    /hackathons/projects/{id}
DELETE /hackathons/projects/{id}
GET    /hackathons/projects/{id}

// manage project members
// owner is fixed
POST   /hackathons/{id}/projects/{id}/members/{user_id}
DELETE /hackathons/{id}/projects/{id}/members/{user_id}

// project comments
GET    /hackathons/{id}/projects/{id}/comments/ (list, possibly paginated?)
POST   /hackathons/{id}/projects/{id}/comments/
DELETE /hackathons/{id}/projects/{id}/comments/{id} (is this desired functinality?)
PUT    /hackathons/{id}/projects/{id}/comments/{id} (is this desired functinality?)

// project likes/shares/stats
POST   /hackathons/{id}/projects/{id}/likes
DELETE /hackathons/{id}/projects/{id}/likes
POST   /hackathons/{id}/projects/{id}/views
POST   /hackathons/{id}/projects/{id}/shares


```

## CORS

In order to support easily building web clients to interract with this API, the **C**ross **O**rigin **R**esource **S**haring policy for the API is open to all domains.

## Potentially existing/fixed data sources

These were all pulled from search/filter pages of the staging site. 

Is this what should exist? Should these be fixed, or editable?

- Hack Venue Country list
  - USA
  - India
  - China
  - UK
  - Brazil
  - Czech Republic
  - Denmark
  - Estonia
  - Finland
  - France
  - Hong Kong SAR
  - Ireland
  - Israel
  - Russia
  - Serbia
  - Sweden
  - Switzerland
  - Taiwan
  - S4
  - TechReady
- Participant roles:
  - Developer
  - Services
  - PM
  - IT operations
  - Sales
  - Marketing
  - Service Eng
  - Sales
  - Design
  - Content Publishing
  - Data Science
  - Design Research
  - Business Programs & Ops
  - Supply Chain & Ops
  - Evangelism
  - HW Engineering
  - HR
  - Legal & Corporate Affairs
  - Finance
- Project categories
  - Azure
  - Office
  - Bing
  - Windows 10
  - Skype
  - Dynamics
  - Xbox
  - SQL
  - Visual Studio
  - HoloLens
  - Windows Phone
  - Cortana
  - SQL
  - MSIT
  - Exchange
  - Power BI
  - Machine Learning
  - Mobile
  - Intune
  - Yammer
- Expertise Types
  - JavaScript
  - Azure
  - Android
  - C#
  - IoT
  - Python
  - Cortana
  - iOS
  - Skype
- Product/service types
  - Windows
  - Devices
  - Consumer Services
  - Cloud + Enterprise
  - Office
  - Dynamics
  - 3rd Party Platforms
  - Misc
  - Other
- Customer Types
  - Consumers
  - MS Employees/Culture
  - Developers
  - Business
  - Students/Schools
  - IT Pros
  - Millennnials
  - MS Groups
  - Tech for Good
  - Advertisers
  - Industries
  - Other


## basic structure


```
┌──────────────────────┐     ┌───────────────────┐    ┌───────────────────┐
│ projects             │     │ hackathons        │    │ users             │
├──────────────────────┤     ├───────────────────┤    ├───────────────────┤
│ id                   │     │ id                │    │ id                │
│ owner_id             │     │ name              │    │ email             │
│ hackathon_id         │     │ slug              │    │ display_name      │
│ venue_id             │     │ location (text)   │    │ super_user (bool) │
│ video_id             │     │ description       │    │ created_at        │
│ title                │  ┌─┼│ logo_url          │    │ updated_at        │
│ tagline              │  │  │ start_date        │    │ meta (JSON)       │
│ status (need info)   │  │  │ end_date          │    │ profile (JSON):   │
│ description          │  │  │ contact_name      │    │   (not enforced)  │
│ image_url            │  │  │ contact_email     │    │   first_name      │
│ code_repository_url  │╲ │  │ created_at        │    │   preferred_first │
│ prototype_url        │──┘  │ updated_at        │ ┌─┼│   last_name       │
│ supporting_files     │╱    └───────────────────┘ │  │   username        │
│ inspiration          │               ┼           │  │   bio             │
│ how_it_will_work     │               │           │  │   job_title       │
│ needs_hackers        │              ╱│╲          │  │   company_name    │
│ tags                 │     ┌───────────────────┐ │  │   discipline      │
│ created_at           │     │ participants      │ │  │   profession      │
│ updated_at           │     ├───────────────────┤╲│  │   area            │
│ roles_needed         │     │ user_id           │─┘  │   reports_to      │
│ skills_needed        │     │ hackathon_id      │╱   │   photo           │
│ views                │     └───────────────────┘    │   city            │
│ meta (JSON)          │                              │   state           │
│                      │     ┌───────────────────┐    │   country         │
└──────────────────────┘     │ comments          │    │   twitter         │
            ┼                ├───────────────────┤    └───────────────────┘
            │               ╱│  id               │╲             ┼
            ├────────────────│  user_id          │──────────────┤
            │               ╲│  project_id       │╱             │
            │                │  text             │              │
            │                │  created_at       │              │
            │                └───────────────────┘              │
            │                ┌───────────────────┐              │
            │                │ members           │              │
            │               ╱├───────────────────┤╲             │
            ├────────────────│ user_id           │──────────────│
            │               ╲│ project_id        │╱             │
            │                └───────────────────┘              │
            │                ┌───────────────────┐              │
            │                │ likes             │              │
            │               ╱├───────────────────┤╲             │
            ├────────────────│ user_id           │──────────────┤
            │               ╲│ project_id        │╱             │
            │                └───────────────────┘              │
            │                ┌───────────────────┐              │
            │                │ shares            │              │
            │               ╱├───────────────────┤╲             │
            ├────────────────│ user_id           │──────────────┤
            │               ╲│ project_id        │╱             │
            │                └───────────────────┘              │
            │                ┌───────────────────┐              │
            │                │ views             │              │
            │               ╱├───────────────────┤╲             │
            └────────────────│ user_id           │──────────────┘
                            ╲│ project_id        │╱
                             └───────────────────┘
```

## Running tests

`npm test`