# Hackathon API

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

## Linting setup and config

Currently using [Walmart's eslint config for ES6-node](https://github.com/walmartlabs/eslint-config-defaults) with only a few tweaks as can be seen in `.eslintrc` there are some modifications in the `data` folder to allow for `snake_case` key names for API output.

## Running scripts

Run `npm run` to see all available scripts.

`npm run lint` will run linting tests on the whole project


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

**note this is quite rough** 

This is not meant to be a full DB schema, just trying to wrap my head around the data

```
   ┌──────────────────────┐
   │ projects             │
   ├──────────────────────┤
   │ id                   │
   │ owner_id             │
   │ venue_id             │                                ┌───────────────────┐
   │ video_id             │     ┌───────────────────┐      │ users             │
   │ title                │     │ hackathons        │      ├───────────────────┤
   │ tagline              │     ├───────────────────┤      │ id                │
   │ status (need info)   │     │ id                │      │ name              │
   │ description          │     │ start_date        │      │ username          │
   │ image_url            │     │ end_date          │      │ email             │
   │ code_repository_url  │╲    │ num_participants  │      │ bio               │
┌─┼│ prototype_url        │────┼│ num_cities        │      │ job_title         │
│  │ supporting_files     │╱    │ num_countries     │      │ company_name      │
│  │ inspiration          │     │ num_first_timers  │  ┌──┼│ registration_date │◇─┐
│  │ how_it_will_work     │     │ num_unique_skills │  │   │ photo             │  │
│  │ needs_hackers        │     │ num_projects      │  │   │ address_1         │  │
│  │ tags                 │     │ num_open_projects │  │   │ address_2         │  │
│  │ stat_likes           │     └───────────────────┘  │   │ city              │  │
│  │ stat_shares          │               ┼            │   │ state             │  │
│  │ stat_comments        │               │            │   │ country           │  │
│  │ stat_views           │               │            │   │ twitter           │  │
│  │ stat_views_uniq      │               │            │   │ facebook          │  │
│  │ stat_videoviews      │               │            │   │ linkedin          │  │
│  │ stat_videoviews_uniq │               │            │   └───────────────────┘  │
│  └──────────────────────┘               │            │             ◇            │
│              ┼                         ╱│╲           │             │            │
│              │                ┌───────────────────┐  │             │            │
│              │                │ participants      │  │             │            │
│              │                ├───────────────────┤╲ │             │            │
│              │                │ user_id           │──┘             │            │
│              │                │ hackathon_id      │╱               │            │
│              │                └───────────────────┘                │            │
│              │                                                     │            │
│              │                ┌───────────────────┐                │            │
│              │                │ comments          │                │            │
│              │                ├───────────────────┤                │            │
│              │               ╱│ id                │╲               │            │
│              └────────────────│ text              │────────────────┘            │
│                              ╲│ participant_id    │╱                            │
│                               │ created_date      │                             │
│                               └───────────────────┘                             │
│                                                                                 │
│                               ┌───────────────────┐                             │
│                               │ members           │                             │
│                              ╱├───────────────────┤╲                            │
└───────────────────────────────│ user_id           │─────────────────────────────┘
                               ╲│ project_id        │╱
                                └───────────────────┘
```

## Running tests

`npm test`