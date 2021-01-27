//Import packages
var express = require("express");
var fs = require("fs");
var multer = require("multer");
var bodyParser = require("body-parser");

//Set root directory and default displayed directory
var rootDirectory = "directory";
var activeDirectory = rootDirectory;

//Replace bad root directory with a default directory
if (!fs.existsSync(rootDirectory)) {
  rootDirectory = "directory";
}

//Set express, bodyParser, port
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var port = process.env.port || 3000;

//Get folder counts and file sizes
function getItemDetails(directoryItems) {
  var folderList = [];
  var fileList = [];
  var directoryJsonObj = {};

  for (var i = 0; i < directoryItems.length; i++) {
    //Each item in the direcotry is a file or folder
    var item = directoryItems[i];
    var isFile = fs.statSync(item).isFile();
    var isDirectory = fs.statSync(item).isDirectory();

    if (isDirectory) {
      var dir = "./" + item;
      //Get number of items in each directory
      var numItems = fs.readdirSync(dir).length;
      var itemText = numItems == 1 ? " item" : " items";
      folderList.push({
        folderName: item,
        itemCount: numItems + itemText,
      });
    } else if (isFile) {
      //Get size of each file
      var itemSizeInBytes = fs.statSync(item).size;
      if (itemSizeInBytes < 1024) {
        size = itemSizeInBytes + " B";
      } else {
        size = Math.round(itemSizeInBytes / 1024) + " KB";
      }
      fileList.push({
        fileName: item,
        fileSize: size,
      });
    }
  }

  directoryJsonObj.path = activeDirectory;
  directoryJsonObj.pathIsRoot = activeDirectory == rootDirectory ? true : false;
  directoryJsonObj.folders = folderList;
  directoryJsonObj.files = fileList;
  return directoryJsonObj;
}

function formatDirectoryItems(directoryItems) {
  directoryItems.forEach((item, index) => {
    directoryItems[index] = activeDirectory + "/" + item;
  });
  return getItemDetails(directoryItems);
}

//Show Index.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/Index.html");
});

//When a directory is requested, show that directory's contents
app.post("/getList", (req, res) => {
  //Set the requested directory
  activeDirectory = fs.existsSync(req.body.directory)
    ? req.body.directory
    : rootDirectory;
  res.json(formatDirectoryItems(fs.readdirSync(activeDirectory)));
});

//Delete an item from the directory
app.delete("/deleteItem", (req, res) => {
  item = req.body.item;
  if (fs.statSync(item).isFile()) {
    fs.unlinkSync(item);
  } else if (fs.statSync(item).isDirectory()) {
    fs.rmdirSync(item, { recursive: true });
  }
  res.json(formatDirectoryItems(fs.readdirSync(activeDirectory)));
});

//Create storage object for file upload
var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, activeDirectory);
  },
  filename: (req, file, callback) => {
    //Replace filename characters that prevent file deletion
    var uploadName = file.originalname.replace(/[- |&;$%@"<>()+,]/g, "_");
    callback(null, uploadName);
  },
});
var upload = multer({ storage });

//Upload files to current view
app.post("/upload", upload.array("selectedFiles"), (req, res) => {
  //Refresh page to show updated directory list
  res.redirect("back");
});

//Use static JavaScript files
app.use(express.static(__dirname));

//Start the server
var http = require("http").createServer(app);
http.listen(port, () => {
  console.log("application listening on port " + port);
});
