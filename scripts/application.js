//***HANDLE SERVER DATA***
//Pass data between server and front end when the view changes

//On page load, show appropriate directory based on view parameter
getList(getViewFromURL(), false);

//When a directory is requested, get its information
async function getList(directory, deleteDownloads) {
  var data = { directory };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/get_list", options);
  const directoryJsonObj = await response.json();
  //Delete download param when specified
  if (deleteDownloads) {
    deleteDownloadParam();
  }
  //Update view parameter and display based on the directory
  handleViewParam(directoryJsonObj.path, directoryJsonObj.pathIsRoot);
  receiveDirectoryContent(directoryJsonObj);
}

//Delete a selected item from the directory
async function deleteItem(item) {
  var data = { item };
  const options = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/delete_item", options);
  const directoryJsonObj = await response.json();
  deleteDownloadParam();
  receiveDirectoryContent(directoryJsonObj);
}

//***HANDLE DIRECTORY CONTENT***
//Show and update directory content list for the current view

//Assign variables to search bar and content list elements
var searchBar = document.getElementById("searchBar");
var contentList = document.getElementById("contentList");
var fullDirectoryObj = {};

function receiveDirectoryContent(directoryObj) {
  fullDirectoryObj = JSON.parse(JSON.stringify(directoryObj));
  updateSearchTermFromURL();
  updateDirectoryContentList();
  updateDownloadCheckboxesFromURL();
}

//Get search parameter from URL and update UI
function updateSearchTermFromURL() {
  var URLParams = new URLSearchParams(document.location.search);
  var searchTerm = URLParams.get("search");
  //Update search bar if URL contains a search parameter
  if (searchTerm) {
    searchBar.value = searchTerm;
  }
}

//Display content list
function updateDirectoryContentList() {
  contentList.innerHTML = formatDirectoryContent(filterDirectoryContent());

  //After download checkboxes are created, have them update the download URL param when clicked
  tieDownloadCheckboxesToURLParam();
}

//Filter content list based on search criteria
function filterDirectoryContent() {
  var filteredDirectoryObj = JSON.parse(JSON.stringify(fullDirectoryObj));
  var URLParams = new URLSearchParams(document.location.search);
  var searchText = searchBar.value;
  if (searchText) {
    //Filter directory items based on the search bar text
    var filteredFolders = filteredDirectoryObj.folders.filter(
      (directoryObj) => directoryObj.folderName.search(searchText) != -1
    );
    var filteredFiles = filteredDirectoryObj.files.filter(
      (directoryObj) => directoryObj.fileName.search(searchText) != -1
    );
    filteredDirectoryObj.folders = filteredFolders;
    filteredDirectoryObj.files = filteredFiles;
  }
  updateSearchParam(URLParams, searchText);
  updateURLToReflectUI(URLParams);
  return filteredDirectoryObj;
}

//Format content as HTML elements
function formatDirectoryContent(directoryObj) {
  path = directoryObj.path;
  pathIsRoot = directoryObj.pathIsRoot;
  folders = directoryObj.folders;
  files = directoryObj.files;
  var formattedContentEntries = [];
  var setTrue = true;
  //Create a contentEntry element for each folder
  folders.forEach((folderObj) => {
    formattedContentEntries.push(
      //Wrap each folder item's elements in a div
      "<div class='contentEntry'>",
      //Item column: clickable folder name
      `<p class='item folder' onclick=getList('${folderObj.folderName}',${setTrue})>📁<u>${folderObj.folderName}</u></p>`,
      //Size column: folder item count
      `<p class='sizeInfo'>${folderObj.itemCount}</p>`,
      //Download column: not applicable
      "<p class='notApplicable'>n/a</p>",
      //Delete column
      "<div class='deleteButtonContainer'>",
      `<button class='deleteButton' onclick=deleteItem('${folderObj.folderName}')>Delete Item</button>`,
      "</div>",
      "</div>"
    );
  });
  //Create a contentEntry element for each file
  files.forEach((fileObj) => {
    formattedContentEntries.push(
      //Wrap each file entry's elements in a div
      "<div class='contentEntry'>",
      //Item column: clickable file name
      `<a class='item file' style='text-decoration:none;' href=${fileObj.fileName} target='_blank' rel='noopener noreferrer'>✨<u>${fileObj.fileName}</u></a>`,
      //Size column: file size item count
      `<p class='sizeInfo'>${fileObj.fileSize}</p>`,
      //Download column: download checkbox
      "<input type='checkbox' class='downloadBox'>",
      //Delete column
      "<div class='deleteButtonContainer'>",
      `<button class='deleteButton' onclick=deleteItem('${fileObj.fileName}')>Delete Item</button>`,
      "</div>",
      "</div>"
    );
  });
  //Display 'no results' message when appropriate
  if (formattedContentEntries.length == 0) {
    formattedContentEntries.push("<p class='noResults'><i>No results</i></p>");
  }
  //Display link to navigate up one folder when appropriate
  if (!pathIsRoot) {
    var returnDirectory = path.substring(0, path.lastIndexOf("/"));
    formattedContentEntries.push(
      `<p class='oneDirectoryUp' onclick=getList('${returnDirectory}',${setTrue})><u>Go to ${returnDirectory}</u></p>`
    );
  }
  return formattedContentEntries.join("");
}

//***HANDLE DOWNLOADS***
//Download parameter, download boxes and toggle, download process

//Assign variable to download button
var downloadButton = document.getElementById("downloadButton");

//'Download Selected' button click: download selected files
function downloadItems(fileIndices = getCheckedDownloadIndicesFromUI()) {
  var displayedFiles = document.getElementsByClassName("file");
  fileIndices.forEach((fileIndex) => {
    //Create a link download element for each displayed file
    var link = document.createElement("a");
    var filepath = displayedFiles[fileIndex].getAttribute("href");
    link.download = filepath.split("/").pop();
    link.href = filepath;
    //'Click' the link to download the file and remove the link
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

//Access download checkboxes and assign input functionality
function tieDownloadCheckboxesToURLParam() {
  downloadCheckboxes = document.querySelectorAll(".downloadBox");
  downloadCheckboxes.forEach((checkbox) => {
    //When a checkbox is clicked, update the download parameter
    checkbox.oninput = function () {
      updateDownloadParam(getCheckedDownloadIndicesFromUI());
    };
  });
}

//Get downlaod parameter from URL and update UI
function updateDownloadCheckboxesFromURL() {
  var URLParams = new URLSearchParams(document.location.search);
  var downloads = URLParams.get("download");
  //Check the checkboxes based on the URL download parameter
  if (downloads) {
    downloads.split(",").forEach((checkboxIndex) => {
      try {
        downloadCheckboxes[checkboxIndex].checked = true;
      } catch (error) {}
    });
  }
}

//Set the download parameter based on current state of UI
function updateDownloadParam(downloadIndices) {
  var URLParams = new URLSearchParams(document.location.search);
  if (downloadIndices.length == 0) {
    URLParams.delete("download");
  } else {
    URLParams.set("download", downloadIndices.toString());
  }
  updateURLToReflectUI(URLParams);
}

//Delete the download parameter
function deleteDownloadParam() {
  var URLParams = new URLSearchParams(document.location.search);
  URLParams.delete("download");
  updateURLToReflectUI(URLParams);
}

//'Download Selected' button click: update download checkboxes
function toggleDownloadCheckboxes() {
  var checkedState = false;
  for (var i = 0; i < downloadCheckboxes.length; i++) {
    //If any checkbox is not checked, check all, otherwise uncheck all
    if (downloadCheckboxes[i].checked == false) {
      checkedState = true;
    }
  }
  downloadCheckboxes.forEach((checkbox) => {
    checkbox.checked = checkedState;
  });
  updateDownloadParam(getCheckedDownloadIndicesFromUI());
}

//Get indices of each checked download checkbox
function getCheckedDownloadIndicesFromUI() {
  var downloadIndices = [];
  downloadCheckboxes.forEach((checkbox, index) => {
    if (checkbox.checked == true) {
      downloadIndices.push(index);
    }
  });
  return downloadIndices;
}

//***HANDLE SEARCH***
//Search paramater and search bar changes

//When the search bar value changes, update the directory list
searchBar.oninput = function () {
  updateDirectoryContentList();
  updateDownloadParam(getCheckedDownloadIndicesFromUI());
};

function updateSearchParam(URLParams, searchText) {
  if (searchText) {
    URLParams.set("search", searchText);
  } else {
    URLParams.delete("search");
  }
}

//***HANDLE VIEW***
//View parameter and view changes
var currentView = document.getElementById("currentView");

function getViewFromURL() {
  var URLParams = new URLSearchParams(document.location.search);
  var directory = URLParams.get("view");
  return directory;
}

function handleViewParam(path, pathIsRoot) {
  var viewText = `Current view: ${path}`;
  var URLParams = new URLSearchParams(document.location.search);
  //Update view param based on current directory
  if (pathIsRoot) {
    URLParams.delete("view");
    viewText += " (root)";
  } else {
    URLParams.set("view", path);
  }
  updateURLToReflectUI(URLParams);
  //Display the current view
  currentView.innerHTML = viewText;
}

//***HANDLE URL***
//Set the URL to reflect the current state of the UI
function updateURLToReflectUI(URLParams) {
  var query = Array.from(URLParams).length > 0 ? "?" : "";
  window.history.replaceState(
    null,
    "",
    `${location.pathname}${query}${URLParams}`
  );
}

//***HANDLE WIDGET (jQueryUI)***
//Widget is not displayed by default
var isWidget = new URLSearchParams(document.location.search).get("widget")
  ? true
  : false;

window.onload = () => {
  if (isWidget) {
    $.createWidget();
  }
};

//Update widget param based on current UI state
function updateWidgetParam() {
  var URLParams = new URLSearchParams(document.location.search);
  if (isWidget) {
    URLParams.set("widget", "on");
  } else {
    URLParams.delete("widget");
  }
  updateURLToReflectUI(URLParams);
}

window.onresize = function () {
  if (isWidget) {
    $.resizeWidget();
  }
};

//Create widget element and prepend page content
$.createWidget = function () {
  var widget = document.createElement("div");
  widget.id = "widget";
  widget.title = "Directory Manager Dialog Widget";
  $("body").prepend(widget);
  $("#pageContent").prependTo(widget);
  $.resizeWidget();
  updateWidgetParam();
};

//Move page content from widget to body and remove widget
$.removeWidget = function () {
  var widget = document.getElementById("widget").parentElement;
  $("#pageContent").prependTo($("body"));
  widget.remove();
  updateWidgetParam();
};

//Resize widget to fit current window size
$.resizeWidget = function () {
  $("#widget").dialog({
    dialogClass: "noClose",
    height: $(window).height() * 0.98,
    width: $(window).width() * 0.98,
  });
};

//Switch between default and widget displays on button click
function toggleWidget() {
  isWidget = !isWidget;
  if (isWidget) {
    $.createWidget();
  } else {
    $.removeWidget();
  }
}
