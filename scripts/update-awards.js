#!/usr/bin/env node

/*eslint no-process-exit: 0, no-console: 0, camelcase:0, strict:0*/
"use strict";
require("babel/register");
const _ = require("lodash");
const baby = require("babyparse"); const client = require("../db-connection").default;
const fs = require("fs");
const knex = require("knex");
const defaultDB = 'b2c';

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
fs.readFile(`./${filename}`,'utf8', parseCSV);

function parseCSV(err, data) {
    if (err) {
        if (err.code === 'ENOENT')
            return console.log(`File '${filename}' can't be found.`);

        throw err;
    }

    const AWARD_PLACE_NAME = 2;
    const PROJECT_ID = 4;

    const splitOn = delim => line => line.split(delim);
    const getValuesAtIndexes = (...indexes) => line => indexes.map(index => line[index]);
    const hasRequiredValues = line => line.every(Boolean); 

    let [ 

        header, 
        ...lines 

    ] = data
            .split('\r')
            .map(splitOn(','))
            .map(getValuesAtIndexes(PROJECT_ID, AWARD_PLACE_NAME))
            .filter(hasRequiredValues);

    console.log('updating database ... ');

    const updates = lines.map(line => {
        const [ projectId, awardDescription ] = line;
        return client.raw(`update ${db || defaultDB}.projects set json_meta = "${awardDescription}" where id = "${Number(projectId)}"`);
    });

    Promise.all(updates).then(values => {
        console.log("done!")
        process.exit(0);
    }).catch(e => {
        console.log(`Error: ${e.code}`);
        process.exit(0);
    });

};
