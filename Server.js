var express = require("express");
var path = require("path");
var glob = require("glob");

//Set application variables
var title = "Single Page Application";
var homeDirectory = "directory";

//Use the application off of express and set port
var app = express();
app.use(express.static(__dirname));
var port = 3000;

//Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Render HTMl files
app.engine("html", require("ejs").renderFile);

//Get list of files and folders in test directory

var filesAndFolders = glob.sync(homeDirectory + "/**/*");

console.log("the files:");
console.log(filesAndFolders);

//Define the route for "/"
app.get("/", function (request, response) {
  //Show this file when the "/" is requested
  response.render("Index.html", {
    title: title,
    contents: filesAndFolders,
  });
});

//Start the server
app.listen(port, () => {
  console.log(title + " listening on port " + port);
});
