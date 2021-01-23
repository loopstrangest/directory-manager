//***HANDLE SERVER DATA***
//Pass data between server and front end when the view changes

//On page load, show appropriate directory based on view parameter
if (getViewFromURL()) {
  changeFolderView(getViewFromURL(), false);
} else {
  getRootView();
}

//When a folder in the list is clicked or page load with a view parameter, show its contents
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
  //Update view parameter depending on whether the path is the root directory
  if (json.pathIsRoot) {
    clearViewParam();
  } else {
    updateViewParam(folder);
  }
  updateViewDescription(json.path, json.pathIsRoot);
  receiveDirectoryContent(json);
}

//When the app is initialized, show the root directory content
async function getRootView() {
  const options = { method: "POST" };
  const response = await fetch("/getRootView", options);
  const json = await response.json();
  updateViewDescription(json.path, json.pathIsRoot);
  receiveDirectoryContent(json);
}

//Delete a selected item from the directory
async function deleteItem(item) {
  console.log("to delete: " + item);
  var data = { item };
  const options = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/deleteItem", options);
  const json = await response.json();
  console.log(json);
  clearDownloadParam();
  receiveDirectoryContent(json);
}

//***HANDLE DIRECTORY CONTENT***
//Show and update directory content list for the current view

//Assign variables to content list elements
var searchBar = document.getElementById("searchBar");
var contentList = document.getElementById("contentList");
var fullItemObj = {};

function receiveDirectoryContent(directoryObj) {
  fullItemObj = JSON.parse(JSON.stringify(directoryObj));
  getSearchTermFromURL();
  updateList();
  getDownloadsFromURL();
}

//On page load, check for search parameter from URL and update UI
function getSearchTermFromURL() {
  var searchParams = new URLSearchParams(document.location.search);
  var searchTerm = searchParams.get("search");
  //Update search bar if URL contains a search parameter
  if (searchTerm) {
    searchBar.value = searchTerm;
  }
}

//Update directory list to reflect the search term
searchBar.oninput = function () {
  updateList();
  updateDownloadParam(getDownloadIndices());
};

//Display content list
function updateList() {
  var formattedList = formatContent(filterContent());
  contentList.innerHTML = formattedList;
  //After download elements display on page, access them
  getDownloadElements();
}

//Filter content list based on search criteria
function filterContent() {
  functionObj = JSON.parse(JSON.stringify(fullItemObj));
  var searchParams = new URLSearchParams(document.location.search);
  searchText = searchBar.value;
  //No search parameter in URL when search bar is empty
  if (searchText == "") {
    searchParams.delete("search");
  } else {
    //Filter directory items based on the search bar text
    var filteredFolders = functionObj.folders.filter(
      (obj) => obj.folderName.search(searchText) != -1
    );
    var filteredFiles = functionObj.files.filter(
      (obj) => obj.fileName.search(searchText) != -1
    );
    functionObj.folders = filteredFolders;
    functionObj.files = filteredFiles;
    searchParams.set("search", searchText);
  }
  updateURLToReflectUI(searchParams);
  return functionObj;
}

//Format content as HTML elements
function formatContent(itemObj) {
  path = itemObj.path;
  pathIsRoot = itemObj.pathIsRoot;
  folders = itemObj.folders;
  files = itemObj.files;
  var formattedList = [];
  var setTrue = true;

  //Create a contentEntry element for each folder
  folders.forEach((folderObj) => {
    infoElement = `<p class='sizeInfo'>${folderObj.itemCount}</p>`;
    //Wrap each folder entry's elements in a div
    formattedList.push("<div class='contentEntry'>");
    formattedList.push(
      `<p class='item folder' onclick=changeFolderView('${folderObj.folderName}',${setTrue})><u>${folderObj.folderName}</u></p>`
    );
    formattedList.push(infoElement);
    formattedList.push("<p class='notApplicable'>n/a</p>");
    formattedList.push("<div class='deleteButtonContainer'>");
    formattedList.push(
      `<button class='deleteButton' onclick=deleteItem('${folderObj.folderName}')>Delete Item</button>`
    );
    formattedList.push("</div>");
    formattedList.push("</div>");
  });
  //Create a contentEntry element for each folder
  files.forEach((fileObj) => {
    infoElement = `<p class='sizeInfo'>${fileObj.fileSize}</p>`;
    //Wrap each folder entry's elements in a div
    formattedList.push("<div class='contentEntry'>");
    formattedList.push(
      `<a class='item file' href=${fileObj.fileName}>${fileObj.fileName}</a>`
    );
    formattedList.push(infoElement);
    formattedList.push("<input type='checkbox' class='downloadBox'>");
    formattedList.push("<div class='deleteButtonContainer'>");
    formattedList.push(
      `<button class='deleteButton' onclick=deleteItem('${fileObj.fileName}')>Delete Item</button>`
    );
    formattedList.push("</div>");
    formattedList.push("</div>");
  });

  //Display 'no results' message when appropriate
  if (formattedList.length == 0) {
    formattedList.push("<p class='noResults'><i>No results</i></p>");
  }

  //Display link to navigate up one folder when appropriate
  if (!pathIsRoot) {
    var returnDirectory = path.substring(0, path.lastIndexOf("/"));
    formattedList.push(
      `<p class='oneDirectoryUp' onclick=changeFolderView('${returnDirectory}',${setTrue})><u>Go to ${returnDirectory}</u></p>`
    );
  }
  return formattedList.join("");
}

//***HANDLE DOWNLOADS***
//Download parameter, download boxes and toggle, download process

//Assign variable to download elements
var downloadButton = document.getElementById("downloadButton");

//'Download Selected' button click: download selected files
function downloadItems(indices = getDownloadIndices()) {
  var currentFiles = document.getElementsByClassName("file");
  indices.forEach((index) => {
    //Set download element link, filepath, filename
    var link = document.createElement("a");
    var filepath = currentFiles[index].innerHTML;
    var filename = filepath.split("/").pop();
    link.download = filename;
    link.href = filepath;
    //Create link, 'click' it to download the file, remove link
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

//Access download checkboxes *after* they're instantiated on the page
function getDownloadElements() {
  downloadCheckboxes = document.querySelectorAll(".downloadBox");
  downloadCheckboxes.forEach((item) => {
    //When a checkbox is clicked, update the download parameter
    item.oninput = function () {
      updateDownloadParam(getDownloadIndices());
    };
  });
}

//Check for URL download parameter and update UI
function getDownloadsFromURL() {
  var searchParams = new URLSearchParams(document.location.search);
  var downloads = searchParams.get("download");
  //Check the checkboxes based on the download parameter
  if (downloads) {
    downloads.split(",").forEach((index) => {
      try {
        downloadCheckboxes[index].checked = true;
      } catch (error) {
        console.log("Checkbox not found: " + error);
      }
    });
  }
}

//Set the download parameter based on current state of UI
function updateDownloadParam(downloadIndices) {
  var searchParams = new URLSearchParams(document.location.search);
  if (downloadIndices.length == 0) {
    searchParams.delete("download");
  } else {
    searchParams.set("download", downloadIndices.toString());
  }
  updateURLToReflectUI(searchParams);
}

//Clear the download parameter
function clearDownloadParam() {
  var searchParams = new URLSearchParams(document.location.search);
  searchParams.delete("download");
  updateURLToReflectUI(searchParams);
}

//Check or uncheck all download checkboxes
function toggleDownloads(result) {
  downloadCheckboxes.forEach((item) => {
    item.checked = result;
  });
  updateDownloadParam(getDownloadIndices());
}

//Find whether all checkboxes are checked
function checkDownloads() {
  for (var i = 0; i < downloadCheckboxes.length; i++) {
    //If any checkbox is not checked, check all
    if (downloadCheckboxes[i].checked == false) {
      toggleDownloads(true);
      return;
    }
  }
  //If all checkboxes are already checked, uncheck all
  toggleDownloads(false);
}

//Get indices of each checked download checkbox
function getDownloadIndices() {
  var indices = [];
  downloadCheckboxes.forEach((item, index) => {
    if (item.checked == true) {
      indices.push(index);
    }
  });
  return indices;
}

//***HANDLE VIEW***
//View parameter and view changes

function updateViewParam(folder) {
  var searchParams = new URLSearchParams(document.location.search);
  searchParams.set("view", folder);
  updateURLToReflectUI(searchParams);
}

function getViewFromURL() {
  var searchParams = new URLSearchParams(document.location.search);
  var folder = searchParams.get("view");
  return folder;
}

function updateViewDescription(path, pathIsRoot) {
  var currentView = document.getElementById("currentView");
  var viewText = `Current view: ${path}`;
  if (pathIsRoot) {
    viewText += " (root)";
  }
  currentView.innerHTML = viewText;
}

function clearViewParam() {
  var searchParams = new URLSearchParams(document.location.search);
  searchParams.delete("view");
  updateURLToReflectUI(searchParams);
}

//***HANDLE URL***
//Set the URL to reflect the current state of the UI
function updateURLToReflectUI(searchParams) {
  var query = Array.from(searchParams).length > 0 ? "?" : "";
  window.history.replaceState(
    null,
    "",
    `${location.pathname}${query}${searchParams}`
  );
}

//***HANDLE WIDGET***
var isWidget = false;

$.setWidget = function () {
  $("#dialog").dialog({
    dialogClass: "noClose",
    height: $(window).height() * 0.98,
    width: $(window).width() * 0.98,
  });
};

window.onresize = function () {
  if (isWidget) {
    $.setWidget();
  }
};

function triggerWidget() {
  isWidget = true;
  $.setWidget();
  document.querySelector("#triggerWidgetButton").remove();
}
