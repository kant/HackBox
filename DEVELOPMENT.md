# Development

## Testing

All tests for this app are stored in `test/` and include both full REST api tests and Unit tests.

Run tests with:

```sh
$ npm run test
```

**IMPORTANT NOTE:** For simplicity of seeding the database, your local development database will be deleted and re-created on every test run.


## Data

### MySQL Database

This app uses MySQL for its database. In development, you will need to create a database with the same credentials listed in `config/development.json`.

Running tests deletes and re-creates your local DB every time the tests are run so be aware data set up in development is ephemeral.

### Fixed data sources

There are some fixed data sources, such as valid country names, etc.

These are all located in `/data/fixed-data` and available through the API using the `/data-sets/*` routes.

Clients using the api should retrieve the available options from the API when rendering UI to users. So that there's only one source of truth for what should be considered valid options for countries, participant roles, etc.

### Migrations

Migrations are generated and managed with [knex][].

knex can be run either with
```sh
./node_modules/.bin/knex
```
or by aliasing your PATH to include `node_modules/.bin`.

Create a new migration with:

```sh
$ knex migrate:make NAME_OF_MIGRATION
```

See `migrations/` for examples.

Once your migration is ready, migrate with:

```sh
$ npm run migrate
```

**PRODUCTION NOTE:** migrations will not be automatically be run after deploying to production. See [production][] notes for info on running migrations in production.

### Adding JSON or Boolean database fields

There is a fancy express plugin at `plugins/expand-meta.js` which does two main things:

1. Manages fields w/ JSON content so the API users don't need to know how the data is stored
2. Converts `0`/`1` boolean values for boolean fields between `true`/`false`

Whenever a new boolean field or JSON-accepting field is added to the database, you need to add that new field name to the constants defined in the plugin.

See the [plugin](./plugins/expand-meta.js) for additional documentation.


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


## How configs are handled

Any time you need access to config items within code simply require the `/.config.js` file at the project root.

It will pull in the configuration file from the `config` directory with the same name as the current value of the `NODE_ENV` envronment variable. If `NODE_ENV` is not defined, `./config/development.json` will be used.  It is best practice to set `NODE_ENV=development` in your `~/.bashrc` to enable development shortcuts in the code, e.g. auth.

Please note that all sensitive data is expected to be passed via environment variables rather than checked into this codebase.

To support this, the config reading module will replace any strings in the config that look like this: `$HELLO_WORLD` with the corresponding value from `process.env`. If the value doesn't exist, the module will throw an error letting you know what's missing.

This allows us to check-in all the config files, allows configs to have arbitrary structure, and allows all non-sensitive configuration changes to be checked into the repo.

To repeat: **please avoid putting any sensitive data** into this code repository.


## CORS

In order to support easily building web clients to interract with this API, the **C**ross **O**rigin **R**esource **S**haring policy for the API is open to all domains.


[knex]: http://knexjs.org/
[production]: ./PRODUCTION.md
