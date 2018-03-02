"use strict";

require("babel/register");
const client = require("../db-connection").default;
const fs = require("fs");
const knex = require("knex");
const request = require('request');

const file = 'data/unique-id.csv';

const apiRequestFactory = (path, token) => ({
    url: path,
    headers: {
        Authorization: token
    }
});

// const graphToken = 'Bearer graphTokenGoesHere'

// var count = 0;

// const newGraphCall = (user_id, token) => {
//     request({
//         url: `https://graph.microsoft.com/beta/users/${user_id}`,
//         headers: {
//             Authorization: token
//         }
//     }, function(err, res, body){
//         var bodyParsed = JSON.parse(body);
//         if (bodyParsed.error && bodyParsed.error.code === 'TooManyRequests') {
//             process.exit();
//         }
//         count++
//         console.log(count)
//             // const user = JSON.parse(body);

//             // var users = user.id + ';'
//             // users += user.displayName + ';'
//             // users += user.mail + ';'
//             // users += user.city + ';'
//             // users += 'n/a;'
//             // users += 'n/a;'
//             // users += 'n/a;'
//             // users += 'n/a;'
//             // users += 'n/a;'
//             // users += user.jobTitle + ';'
//             // users += '\r\n'
            
//             // fs.appendFile('unique-users.txt', users, 'utf8', function (err) {
//             //     console.log('writing')
//             //     if (err) {
//             //         console.log('error')
//             //     }
//             // });
//     });
// }

fs.readFile(file, 'utf8', (err, data) => {
    var users = [];    
    if (err) throw err;
    var obj = data.split('\r\n');
    
    obj.forEach(function(id) {
        const query1 = client("users")
            .select('*')
            .where("users.id", id);

        query1.then((user) => {

            // if(!user[0]) {
            //     newGraphCall(id, graphToken);
            // }

            if (user[0]) {
                var users = user[0].id + ';'
                users += user[0].name + ';'
                users += user[0].email + ';'
                users += user[0].city + ';'
                users += user[0].created_at + ';'
                users += user[0].updated_at + ';'
                users += user[0].alias + ';'
                users += user[0].profession + ';'
                users += user[0].discipline + ';'
                users += user[0].job_title + ';'
                users += '\r\n'
                
                fs.appendFile('unique-users.txt', users, 'utf8', function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
            }
        });
    });
});