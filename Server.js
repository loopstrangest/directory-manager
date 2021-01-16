var express = require("express");

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
console.log(content);

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

//socket.io setup to send content from server to client
var io = require("socket.io")(http);
io.on("connection", (client) => {
  console.log("connected");
  client.emit("sendContent", content);
});
