var express = require('express');

var app = express.createServer(express.logger());

var fs = require('fs');
var file_content = fs.readFileSync("index.html");
var file_content_str = file_content.toString("utf-8");


app.get('/', function(request, response) {
  response.send(file_content_str);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
