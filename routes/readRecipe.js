const express = require('express');
const router = express.Router();

const filesystem = require('fs');
const readline = require('readline');

// The iconv library is used to convert between character encodings.
// We may decide to convert all on-disk recipies from whatever encoding
// they happen to have into UTF-8.
const iconv = require("iconv-lite");

/* GET users listing. */
router.get('/', function(req, res) {
    // const recipeName = "Recipes/Potatismos för Plankstek_utf8.txt";
    const recipeName = 'Recipes/Makaronilåda.txt';
    //const recipeName = 'test.txt';
    console.log('Reading recipe "'+recipeName+'" from "'+process.cwd()+'".');

    var fileContents = filesystem.readFileSync(recipeName);
    const indexOfUtf8Failure = iconv.decode(fileContents, 'utf8').indexOf('�');
    const isIsoMaybe = indexOfUtf8Failure >= 0;
    const encoding = isIsoMaybe ? 'iso-8859-15' : "utf8";
    console.log('Decoding using "' + encoding + '" since failure index is ' + indexOfUtf8Failure + '.');

    const input = filesystem.createReadStream(recipeName).pipe(iconv.decodeStream(encoding));

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
        // line = iconv.decode(line, 'iso-8859-14');
        console.log('Line from file: ', line);
        wholeFile += line + '<br>\n';
    });
    reader.on('close', function() {
        console.log('End of file, sending response.');
        res.header("Content-Type", "text/html; charset=iso-8859");
        res.send(wholeFile);
    });

});

module.exports = router;
