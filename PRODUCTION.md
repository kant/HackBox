# Production

The API is deployed on the Azure platform with ClearDB as the MySQL provider.

Managing the app requires an `@outlook.com` address and access to the API's resources in the [Azure portal][].


## Creating a `@outlook.com` account

All users must have an `@outlook.com` account to be granted access. Create one by signing up for a Microsoft account and clicking the small "Get a new email address" link below the "User name" field to choose a username for your new account:

https://signup.live.com/


## Setting up the production Git remote

1. From the Azure Portal, click on the "hackbox-api" resource.
2. Find and click on "Properties" in the rightmost panel under "General".
3. Copy the "GIT URL"
4. Set up a git remote locally from the root of your project with:

```sh
$ git remote add production COPIED_GIT_URL
```

## Deploying to Production

Deploy by pushing to the production Git remote.

```sh
$ git push production master
```

You'll see a lot of errors and it will take a long time, but trust it will happen and it'll eventually finish.

If you have any migrations to run, update your `config/production.json` file temporarily with the production DB credentials and run:

```sh
$ NODE_ENV=production npm run migrate
```

Don't forget to undo any changes made to `config/production.json` afterwards to prevent saving DB credentials to Git.


## Managing MySQL

MySQL is managed via ClearDB in the Azure Portal. The resource is called "HackboxDB".

TODO: Figure out how to access the ClearDB management portal. This is a very difficult thing to find.


[Azure portal]: https://ms.portal.azure.com
