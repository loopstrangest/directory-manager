var express = require("express");
var fs = require("fs");
var multer = require("multer");
var glob = require("glob");
var bodyParser = require("body-parser");
var url = require("url");

//Set default directory-in-focus
var activeDirectory = "directory";

//Create file storage object
var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, activeDirectory);
  },
  filename: (req, file, callback) => {
    const { originalname } = file;
    callback(null, originalname);
  },
});
var upload = multer({ storage });

//Set express, bodyParser, port
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var port = process.env.port || 3000;

//Get folder counts and file sizes
function getItemDetails(content) {
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

//Express routes: get
app.get("/", function (req, res) {
  //update activeDirectory based on home URL
  homeParam = req.query.home ? true : false;
  activeDirectory = homeParam ? req.query.home : "directory";
  res.sendFile(__dirname + "/Index.html");
});

//Use other static files: JS scripts
app.use(express.static(__dirname));

//Handle file upload and home selection
app.post("/upload", upload.array("selectedFiles"), (req, res) => {
  //Refresh page to reflect up-to-date file list
  res.redirect("back");
  //return res.json({ status: "ok", uploaded: req.files.length });
});

app.post("/getHome", function (req, res) {
  //Refresh page to reflect up-to-date home folder
  activeDirectory = req.body.home;
  res.redirect("back");
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
  //Get list of files and folders in active directory
  var content = glob.sync(activeDirectory + "/**/*");
  client.emit("sendContent", content, getItemDetails(content));
});
