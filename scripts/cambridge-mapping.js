"use strict";

const client = require("../db-connection").default;
const fs = require("fs");
const knex = require("knex");

const file = 'data/some-sorted-file-using-emails-only.csv';

/*
    This script was used for cleaning old data where users with city 'Cambridge' were always identified
    as having country 'United States', when many of them should have country 'United Kingdom'.
*/

fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    var obj = data.split('\r\n');
    
    obj.forEach(function(email) {
        const query1 = client("users")
            .select('users.id', 'users.email', 'users.city', 'users.country')
            .join('participants', 'participants.user_id', 'users.id')
            .where("users.alias", email)
            .orderBy('updated_at');

        query1.then((dataaa) => {
            if (dataaa.length > 0) {
                if(dataaa[0].city === 'Cambridge') {
                    if(dataaa[0].country === 'United States') {
                            const query2 = client("users")
                                .where("users.alias", email)
                                .update({
                                    country: 'United Kingdom'
                                });

                            query2.then(() => {
                                console.log('It is: ', email)
                            });
                    }
                }
            }
        });
    });
});
