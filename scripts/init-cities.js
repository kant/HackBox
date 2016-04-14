/*eslint no-process-exit: 0*/
require("babel/register");
const client = require("../db-connection").default;
const Promise = require("bluebird");

const cities = require("../data/cities").cities;

const initCities = () => {
  return client.insert(cities).into("cities")
  .then(() => {
    process.exit();
  });
};

initCities();
