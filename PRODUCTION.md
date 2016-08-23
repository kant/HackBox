# Production

The API is deployed on the Azure platform backed by a MySQL VM.  Access to the [Azure portal](https://ms.portal.azure.com) (https://ms.portal.azure.com) is required.

Managing the app requires at minimum an `@outlook.com` address and access to the API's resources in the [Azure portal](https://ms.portal.azure.com).
Front-end access to the site and ownership of Azure resources requires an `@microsoft.com` email address, followed by inclusion in the site's ACL and granting of owner privileges in Azure.


## Creating a `@outlook.com` account

All users must have an `@outlook.com` account to be granted access. Create one by signing up for a Microsoft account and clicking the small "Get a new email address" link below the "User name" field to choose a username for your new account:

https://signup.live.com/


## Setting up the production Git remote

1. From the [Azure Portal](https://ms.portal.azure.com), click on the `hackbox-api` resource.
2. Under "Deployment Slots", select the `hackbox-api-staging` deployment slot.
3. Under "Deployment credentials", ensure that a username and password are set (and that you know them). If needed, you can change the username and password, but be aware that it will break anyone else's extant git remote.
4. Find and click on "Properties" in the rightmost panel under "General".
4. Copy the "GIT URL"
5. Set up a git remote locally from the root of your project with:

```sh
$ git remote add staging COPIED_GIT_URL
```

## Deploying to Production

First, commit approved changes to `master`.

When preparing to deploy, merge needed commits from `master` to `production`.

If migrations need to be run, populate your `config/production.json` and `config/staging.json` files with the appropriate credentials. The DB credentials should be the same, with the **important exception** of the DB name:
- **Staging DB**: `hackboxstage`
- **Production DB**: `hackboxdb`

First, run any migrations on staging:
```sh
$ NODE_ENV=staging npm run migrate
```

Deploy by pushing to the staging Git remote from the production branch.

```sh
$ git push staging production:master
```

This will take several minutes, and the staging API will remain unresponsive for a couple of minutes after the push appears to have completed. Hard refresh until the staging documentation page loads.

Verify all changes in staging at https://hackbox-api-staging.azurewebsites.net/documentation and/or through the staging front end.  If all looks good, you're ready to go to production!

If migrations were needed, run them on the prod DB:
```sh
$ NODE_ENV=production npm run migrate
```

Next, from the [Azure Portal](https://ms.portal.azure.com), find the `hackbox-api` webapp once more. On the top of the Overview page, there is a Swap button. Click Swap, then click OK on the next pane to swap `production` and `staging`.  Changes should be available on prod within a minute, and with little or no downtime.
If something goes wrong in this step, swapping `production` and `staging` again will restore the previous working version of the site. If you ran migrations on `production`, you'll have to manually back those out.

After changes are again verified on the production API (https://hackbox-api.azurewebsites.net/documentation) or website (https://garagehackbox.azurewebsites.net/), and you are sure you won't need to revert to the previous version, push your code to the staging remote again to keep production and staging at parity.

Congrats! You've pushed to production!
Don't forget to undo any changes made to `config/production.json` and `config/staging.json` afterwards to prevent saving DB credentials to Git.


## Managing MySQL

MySQL run on an Ubuntu VM in Azure. Login credentials available from Mahendra or Steve
```sh
$ ssh hackboxadmin@13.88.29.145 -P
```



