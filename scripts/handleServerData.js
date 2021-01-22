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
  //Clear downloads when specified
  if (clearDownloads) {
    clearDownloadParam();
  }
  //Update view param depending on whether the path is the root directory
  if (json.pathIsRoot) {
    clearViewParam();
  } else {
    updateViewParam(folder);
  }
  updateCurrentView(json.path, json.pathIsRoot);
  receiveDirectoryContent(json);
}

//When the app is initialized, show the root directory content
async function getRootView() {
  const options = { method: "POST" };
  const response = await fetch("/getRootView", options);
  const json = await response.json();
  updateCurrentView(json.path, json.pathIsRoot);
  receiveDirectoryContent(json);
}

//Show appropriate directory based on URL view parameter
if (getViewFromURL()) {
  changeFolderView(getViewFromURL(), false);
} else {
  getRootView();
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
