#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";


var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};


var assertUrlExists = function(inurl) {
    var instr = inurl.toString();
    rest.get(instr).on('complete', function(result) {
	if (result instanceof Error) {
	    console.log("%s does not get. Exiting", instr);
	    process.exit(1);
	}
    });

    return instr;		       
};


var cheerioHtmlFile = function(htmlFile) {
    return cheerio.load(fs.readFileSync(htmlFile));
};


var loadChecks = function(checksFile) {
    return JSON.parse(fs.readFileSync(checksFile));
}


var checkHtmlFile = function(htmlFile, checksFile) {
    $ = cheerioHtmlFile(htmlFile);
    var checks = loadChecks(checksFile).sort();
    var out = {};
    for (var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }

    return out;
};

/*
var checkUrlFile = function(url, checksFile) {
    rest.get(url).on('complete', function(result) {
	fs.writeFileSync("tmp_url.html", result);
	checkHtmlFiel("tmp_url.html", checksFile);
    });
};
*/

var clone = function(fn) {
    return fn.bind({});
};


if (require.main == module) {
    program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url_link>', 'url to html file', clone(assertUrlExists), "")
    .parse(process.argv);

    if (program.url) {
	rest.get(program.url).on('complete', function(result) {
	    fs.writeFileSync('tmp_url.html', result);

	    program.file = 'tmp_url.html';
	    var checkJson = checkHtmlFile(program.file, program.checks);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	    //console.log("top\n");
	});
    } else {

	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
	// console.log("bottom\n");
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
