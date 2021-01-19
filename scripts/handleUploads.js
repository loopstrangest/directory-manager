var fileUploader = document.getElementById("fileUploader");

function getFiles() {
  console.log("files sent");
  var fileList = fileUploader.files;
  socket.emit("uploadFiles", fileList);
}
