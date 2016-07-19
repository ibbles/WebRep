const express = require('express');
const router = express.Router();

const filesystem = require('fs');
const readline = require('readline');

/* GET users listing. */
router.get('/', function(req, res) {
    const recipeName = "Potatismos för Plankstek.txt";
    //const recipeName = 'test.txt';
    console.log('Reading recipe "'+recipeName+'" from "'+process.cwd()+'".');

    const input = filesystem.createReadStream(recipeName);

    if (input) {
        console.log('"input" is something.');
    } else {
        console.log('"input" is undefined.');
    }

    const reader = readline.createInterface({
        input: input,
        terminal: false
    });

    var wholeFile = '';
    reader.on('line', function(line) {
        console.log('Line from file: ', line);
        wholeFile += line + '\n';
    });
    reader.on('close', function() {
        console.log('End of file, sending response.');
        res.send(wholeFile);
    });

});

module.exports = router;
