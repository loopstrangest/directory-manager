//Set root directory and default directory-in-focus
var rootDirectory = "admin";
var activeDirectory = rootDirectory;

//Import packages
var express = require("express");
var fs = require("fs");
var multer = require("multer");
var bodyParser = require("body-parser");

//Set express, bodyParser, port
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var port = process.env.port || 3000;

//Get folder counts and file sizes
function getItemDetails(content) {
  var folderList = [];
  var fileList = [];
  var testObj = {};
  for (var i = 0; i < content.length; i++) {
    var entry = content[i];
    var bytes = fs.statSync(entry).size;
    var isFile = fs.statSync(entry).isFile();
    var isDirectory = fs.statSync(entry).isDirectory();
    if (isDirectory) {
      var dir = "./" + entry;
      //Get number of items in each directory
      var numItems = fs.readdirSync(dir).length;
      var itemText = numItems == 1 ? " item" : " items";
      folderList.push({
        folderName: entry,
        itemCount: numItems + itemText,
      });
    } else if (isFile) {
      //Get size of each file
      var size;
      if (bytes < 1024) {
        size = bytes + " B";
      } else {
        size = Math.round(bytes / 1024) + " KB";
      }
      fileList.push({
        fileName: entry,
        fileSize: size,
      });
    }
  }
  testObj.path = activeDirectory;
  testObj.folders = folderList;
  testObj.files = fileList;
  return testObj;
}

//Always show Index.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/Index.html");
});

//Test function
/*
app.post("/dataTest", (req, res, next) => {
  res.json({
    status: "success",
    first: req.body.firstName,
    last: req.body.lastName,
  });
});
*/

//Post requests
//When a folder in the directory is list is clicked, show that folder's contents
app.post("/changeFolderView", (req, res) => {
  if (fs.existsSync(req.body.folder)) {
    activeDirectory = req.body.folder;
  } else {
    activeDirectory = rootDirectory;
  }
  var content = fs.readdirSync(activeDirectory);
  content.forEach((item, index) => {
    content[index] = activeDirectory + "/" + item;
  });
  var jsonObj = getItemDetails(content);
  res.json(jsonObj);
});

//Show the root directory when app initializes and when URL has no 'view' param
app.post("/getRootView", (req, res) => {
  var content = fs.readdirSync(rootDirectory);
  content.forEach((item, index) => {
    content[index] = rootDirectory + "/" + item;
  });
  var jsonObj = getItemDetails(content);
  res.json(jsonObj);
});

//Create storage object for file upload
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

//Upload files to current view
app.post("/upload", upload.array("selectedFiles"), (req, res) => {
  //Refresh page to show updated directory list
  res.redirect("back");
  //return res.json({ status: "ok", uploaded: req.files.length });
});

//Use other static files: JS scripts
app.use(express.static(__dirname));

//Start the server
var http = require("http").createServer(app);
http.listen(port, () => {
  console.log("application listening on port " + port);
});
