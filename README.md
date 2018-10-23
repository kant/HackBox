# HackBox API

This is a node.js api server written using [hapi](http://hapijs.com) framework.

It's written in ES6 transpiled with Babel to allow full ES6 support. In order to use all of the ES6 features we're using [babel.js](https://babeljs.io) transpiler via the [require hook](https://babeljs.io/docs/usage/require/) as can be seen in server.js.

## Getting Started

+ Install [node](https://nodejs.org), version [4.2.1](https://nodejs.org/dist/v4.2.1/) or newer (note: `4.2.1` is the serverside node version we run with).
+ Install [mysql](https://dev.mysql.com/downloads/installer/)
+ From the project directory, run `npm install`
+ Modify [the development config](./config/development.json) to match your mysql database values (if needed)
+ From the project directory, run `npm start`
+ Visit http://localhost:3000/documentation from a browser


## Troubleshooting

Make sure MySQL is installed and running locally, then create a database called `hackbox`. If you use these settings for your local DB you won't have to mess with configs:

```json
{
  "database": "hackbox",
  "host": "localhost",
  "user": "root",
  "password": "pass"
}
```

## Testing

> Note: Running the tests will migrate the `hackbox` database to the latest schema, and also seed the DB with test data.

From the project directory, run the tests with `npm test`.

Further information is available in the [development][] docs.

## Remote Deployment

Deploys are done via Git. Every user deploying needs to have access to the Azure portal to acquire Git access.

See the [production][] docs for more information on gaining access and setting up a production git remote.

Deploys are done with a simple Git push:

```sh
$ git push production master production:master
```

It's a secondary goal to make it configured to the point where it could be deployed by anybody from GitHub using a [Deploy to Azure button](http://www.bradygaster.com/post/the-deploy-to-azure-button).

The deployed API is available at:
https://hackbox-api.azurewebsites.net/documentation

The staging API is available at:
https://hackbox-api-stage.azurewebsites.net/documentation

Production logs are available:
https://hackbox-api.scm.azurewebsites.net/api/vfs/LogFiles/Application/index.html

With access, the website is deployed at:
https://hackbox-stage.azurewebsites.net/

## API Documentation

The API is generates its own documentation based on metadata provided with each route. Since the documentation is generated from the actual route data itself, that helps mitigate out-of-date documentation.

To see it, run the server as described above and visit: `http://localhost:3000/documentation` in a browser.

It's using Swagger UI which also includes a test client so you can query the API from the browser:

![screenshot of docs page](https://cldup.com/1HYizp2fQc.png)

## Database Documentation

The best source of truth for the database is to inspect the schema directly, and/or consult the migrations.

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

## How to update data/msft.json file

There is a script file `scripts/msft-fte-list-update.js`
Usually I update this file after updating feedstore column in DB.

+ Point your app to the production database (env variables)
+ Just run this script with node: node scripts/msft-fte-list-update.js
+ Wait. It usualy takes 20-30 secs
+ After successful process script will create msft.json file in scripts folder
+ Replace msft.json in `./data` folder with newly created file. I did not want to overwrite existing because I want to see the diffs first and doublecheck that all latest data is there 


## How to add awards to winner projects

+ Usually we get a list of awards in xls file. Compose the final list of first and second level categories from xls file. 
+ Go to award_categories table and manually create categories with new hackathon id. 
+ Prepare a csv file with 4 columns: project id, value to insert into the project, categorie id (manually insert to the file from previous task), 1st place categorie id if appliccable.
+ Value to insert should look like following (find colors manually, they are different only for first level of awards_categories):
```sh
{awards:[{"name":"Advertisers  - 3rd Place","color":"#7030a0"}]}
```
+ Copy csv file and name it CSV.csv
+ Run script from here `script/update-awards.js`. This will read the file and insert all values and awards and id's to the db.
+ Also, you need to update id's and category names in filters in CLient app. HackBoxClient/lib/main/components/filterableLists/filters.directive.js

[development]: ./DEVELOPMENT.md
[production]: ./PRODUCTION.md
