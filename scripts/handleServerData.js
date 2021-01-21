//When a folder in the list is clicked, show its contents
async function changeFolderView(folder, clearDownloads) {
  var data = { folder };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/changeFolderView", options);
  const json = await response.json();
  if (clearDownloads) {
    clearDownloadParam();
  }
  updateViewParam(folder);
  receiveDirectoryContent(json);
}

//When the app is initiated, show the default directory items
async function getInitialView() {
  const options = { method: "POST" };
  const response = await fetch("/getInitialView", options);
  const json = await response.json();
  receiveDirectoryContent(json);
}

//Show appropriate directory based on URL view parameter
if (getViewFromURL()) {
  changeFolderView(getViewFromURL(), false);
} else {
  getInitialView();
}

//Test function
/*
async function apiTest() {
  var firstName = document.getElementById("firstName").value;
  var lastName = document.getElementById("lastName").value;
  var data = { firstName, lastName };
  console.log(firstName);
  console.log(lastName);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/dataTest", options);
  const json = await response.json();
}
*/
