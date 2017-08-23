#!/usr/bin/env node

/*eslint no-process-exit: 0, no-console: 0, camelcase:0, strict:0*/
"use strict";
require("babel/register");
const _ = require("lodash");
const baby = require("babyparse"); 
const client = require("../db-connection").default;
const fs = require("fs");
const knex = require("knex");
const defaultDB = 'b2c';
const inputFile = 'CSV.csv';


let db;
let filename;

const parseArgs = function(args) {

    if (args.length < 2 || args.includes('-h') || args.includes('--help')) {
        console.log(`usage: update-awards [db] [csv filename]`);
        process.exit(0);
    } 

    db = args[0]
    filename = args[1]
};

parseArgs(process.argv.slice(2));

console.log(`Preparing to update ${ db || defaultDB } ... `);  
console.log('Parsing "awards_file.csv" ...');


var parse = require('csv-parse');
var async = require('async');



var parser = parse({delimiter: ','}, function (err, data) {
    // console.log(data);
  const updates = data.filter(line => {
      return line[0] !== '';
  });
   var index = updates.length - 1;
    // var index = 2;
   var runQuery = function() {
    //    if (Number(updates[index][0]) == 65440) {
       console.log('GOING TO UPDATE:');
       console.log(updates[index][1]); 
       var value = updates[index][1].replace('awards', '"awards"');
       var newAwardId = 0;

    console.log('Proj ID: ' + Number(updates[index][0]));

    

    

       client('projects').select('*').where({id: Number(updates[index][0])})
       .then(proj => {
           var meta = {awards: []};
           if (JSON.parse(proj[0].json_meta).awards && JSON.parse(proj[0].json_meta).awards.length > 0) {
                var projAwards = JSON.parse(proj[0].json_meta).awards;
                projAwards.forEach(aw => {
                    meta.awards.push(aw);
                })
                meta.awards.push(JSON.parse(value).awards[0]);
                return client.update({json_meta: JSON.stringify(meta)}).into("projects").where("id", Number(updates[index][0]));
                       
            } else {
                return client.update({json_meta: value}).into("projects").where("id", Number(updates[index][0]));
            }

           
       })
       .then(data => {
            var obj = JSON.parse(value);
            return client('awards').insert({hackathon_id: 1074, project_id: Number(updates[index][0]), name: obj.awards[0].name, json_meta: '{}'})
            })
            .then(response => {
                newAwardId = response[0];
                var arrayToInsert = [];

                arrayToInsert.push({award_id: newAwardId, award_category_id: Number(updates[index][2])});
                if (updates[index][3] !== '') {
                    arrayToInsert.push({award_id: newAwardId, award_category_id: Number(updates[index][3])});
                }
                return client('awards_award_categories').insert(arrayToInsert);
            })
            .then(res => {
                console.log('---------DONE');
                console.log(res);
                index--;
                if (index >= 0) {
                    runQuery();
                } else {
                    console.log('DONE!!!!');
                }
            })

   }
   runQuery();

});

fs.createReadStream(inputFile).pipe(parser);




