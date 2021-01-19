var express = require("express");
var fs = require("fs");
var multer = require("multer");
var glob = require("glob");

//Set directory-in-focus
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

//Use the application off of express and set port
var app = express();
app.use(express.static(__dirname));
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

//Express routes
app.get("/", function (req, res) {
  //Show Index.html when the "/" is requested
  res.sendFile("Index.html");
});

//Handle file upload
app.post("/upload", upload.array("selectedFiles"), (req, res) => {
  //Refresh page to reflect up-to-date file list
  res.redirect("back");
  //return res.json({ status: "ok", uploaded: req.files.length });
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
  //console.log(content);
  client.emit("sendContent", content, getItemDetails(content));
});
