var azure = require('azure-storage');
var blobSvc = azure.createBlobService();
var async = require('async');
const fs = require('fs');




// var allNames = require('./names');
// var names = [];
// var allEvents = [];
// var counter = 0;
// var wstream = fs.createWriteStream('events.txt');
// var seriesToRun = [];
// var aHundred = [];

// var getBlobByName = function(name, callback) {
//     blobSvc.getBlobToText('customevents', name, function(error, result, response) {
//         if (!error) {
//             wstream.write(result);
//             console.log(counter);
//             counter++;
//             callback(null, 'Done');
//         } else {
//             callback(null, 'Error');
//         }
//     });
// }

// var runAll = function(array) {
//     if (index > 0) {
//         var aHundredToRun = [];
//         for (var i = 0; i < 200; i++) {
//             if (index > 0) {
//                 aHundredToRun.push(array[index]);
//                 index--;
//             }
//         }

//         async.parallel(aHundredToRun, function(err, results) {
//             console.log('====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
//             runAll(seriesToRun);
//         });
//     } else {
//         console.log('DONE DONE DONE');
//         wstream.end();
//     }
// }

// allNames.forEach((name) => {
//     if (name.includes('/Event/2017-05') || name.includes('/Event/2017-06') || name.includes('/Event/2017-07') || name.includes('/Event/2017-08')) {
//         seriesToRun.push(getBlobByName.bind(null, name));
//     }
// })

// console.log(seriesToRun.length);
// var index = seriesToRun.length - 1;

// runAll(seriesToRun);






//++++++++++++++++++++++++++++++++++++++++++++++++
//GET LIST OF ALL FILE NAMES AND STORE TO THE FILE
//++++++++++++++++++++++++++++++++++++++++++++++++

// var getResults = function(token) {
//     blobSvc.listBlobsSegmented('customevents', token ? token : null, function(error, result, response){
//     if(!error){
//         result.entries.forEach((blob) => {
//             names.push(blob.name);
//             console.log(blob.name);   
//         })
//         console.log('Names length: ' + names.length);
//         if (result.continuationToken) {
//             getResults(result.continuationToken);
//         } else {
//             const content = JSON.stringify(names);
//             fs.writeFile('names.json', content, 'utf8', function (err) {
//                 if (err) {
//                     return console.log(err);
//                 }
//                 console.log("The file was saved!");
//             });
//         } 
//     }
//     });
// }
// getResults();



//++++++++++++++++++++++++++++++++++
//STREAM EVENTS FROM txt FILE TO CSV
//++++++++++++++++++++++++++++++++++
// var csvWriter = require('csv-write-stream')
// var writer = csvWriter();
// var names = {};
// writer.pipe(fs.createWriteStream('out.csv'));

// var lineReader = require('readline').createInterface({
//   input: require('fs').createReadStream('events.txt')
// });
// var count = 0;
// lineReader.on('line', function (line) {
//   var obj = JSON.parse(line);
  
//   if (obj.event[0].name.includes('ProjectChange_')) {
//       writer.write({name: obj.event[0].name, time: obj.context.data.eventTime, id: obj.context.custom.dimensions[0].id});
//       count++;
//       console.log(count);
//   }
  
// });

// lineReader.on('close', function (line) {
//     writer.end();
//     console.log(names);
// });