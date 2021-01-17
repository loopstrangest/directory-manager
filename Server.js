var express = require("express");
var fs = require("fs");

//Use the application off of express and set port
var app = express();
app.use(express.static(__dirname));
var port = process.env.port || 3000;

//GLOB
var glob = require("glob");
//Set directory
var homeDirectory = "directory";
//Get list of files and folders in test directory
var content = glob.sync(homeDirectory + "/**/*");
//console.log(content);

//Get folder counts and file sizes
function getItemDetails() {
  var itemDetails = [];
  for (var i = 0; i < content.length; i++) {
    var entry = content[i];
    var bytes = fs.statSync(entry).size;
    //Item with size == 0 is a folder
    if (bytes == 0) {
      var dir = "./" + entry;
      var numItems = fs.readdirSync(dir).length;
      var itemText = numItems == 1 ? " item" : " items";
      itemDetails[i] = numItems + itemText;
    }
    //Item with size > 0 is a file
    else if (bytes < 1024) {
      itemDetails[i] = bytes + " B";
    } else {
      itemDetails[i] = Math.round(bytes / 1024) + " KB";
    }
  }
  return itemDetails;
}

//Express routes
app.get("/", function (req, res) {
  //Show Index.html when the "/" is requested
  res.sendFile("Index.html");
});

app.get("/\\?search=:searchterm", function (req, res) {
  res.sendFile("Index.html");
});

app.get("/scripts", function (req, res) {
  //Show this file when the "/" is requested
  res.sentData;
});

//Start the server
var http = require("http").createServer(app);
http.listen(port, () => {
  console.log("application listening on port " + port);
});

//Have socket.io send data from server to client
var io = require("socket.io")(http);
io.on("connection", (client) => {
  console.log("connected");
  client.emit("sendContent", content, getItemDetails());
});
