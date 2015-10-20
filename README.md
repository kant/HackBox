# Hackathon API

This is a node.js api server written using [hapi](http://hapijs.com) framework. 

It's written in ES6 transpiled with Babel to allow full ES6 support. In order to use all of the ES6 features we're using [babel.js](https://babeljs.io) transpiler via the [require hook](https://babeljs.io/docs/usage/require/) as can be seen in index.js.

## Questions

1. Can one user ever be on multiple projects in the same hackathon?
2. Can the owner of a project change?
3. Do projects ever exist outside of a hackathon, or in multiple hackathons? (I'm assuming not)

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


## RESTful routes

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
POST   /hackathons/projects/{id}/members/{user_id}
DELETE /hackathons/projects/{id}/members/{user_id}

// project comments
GET    /hackathons/{id}/projects/{id}/comments/ (list, possibly paginated?)
POST   /hackathons/{id}/projects/{id}/comments/
DELETE /hackathons/{id}/projects/{id}/comments/{id} (is this desired functinality?)
PUT    /hackathons/{id}/projects/{id}/comments/{id} (is this desired functinality?)

```

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
├────────────────────  │
│ id                   │                                     ┌───────────────────┐
│ title                │        ┌───────────────────┐        │ participants      │
│ tagline              │        │ hackathons        │        ├───────────────────┤
│ status               │        ├───────────────────┤        │ id                │
│ description          │        │ id                │        │ name              │
│ owner_id             │        │ start_date        │        │ username          │
│ venue_id             │        │ end_date          │        │ email             │
│ stat_likes           │╲       │ num_participants  │        │ bio               │
│ stat_shares          │───────┼│ num_cities        │        │ job_title         │
│ stat_comments        │╱       │ num_countries     │        │ company_name      │
│ stat_views           │        │ num_first_timers  │        │ registration_date │◇─┐
│ stat_views_uniq      │        │ num_unique_skills │        │ photo             │  │
│ stat_videoviews      │        │ num_projects      │        │ address_1         │  │
│ stat_videoviews_uniq │        │ num_open_projects │        │ address_2         │  │
│ resources            │        └───────────────────┘        │ city              │  │
│ participant_ids []   │                  ┼                  │ state             │  │
│ needs_hackers        │                  │                  │ country           │  │
│ has_video            │                  │                  │ twitter           │  │
└──────────────────────┘                  │                  │ facebook          │  │
            ┼                             │                  │ linkedin          │  │
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