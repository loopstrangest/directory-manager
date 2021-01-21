//Assign names to content list elements
var searchBar = document.getElementById("searchBar");
var contentList = document.getElementById("contentList");
var fullItemObj = {};
var currentItemObj = {};

function receiveDirectoryContent(initialItemObj) {
  fullItemObj = JSON.parse(JSON.stringify(initialItemObj));
  currentItemObj = JSON.parse(JSON.stringify(fullItemObj));
  updateContent();
}

function updateContent() {
  getSearchTermFromURL();
  updateList();
  getDownloadsFromURL();
}

//On page load, check for search term from URL and update UI
function getSearchTermFromURL() {
  var searchParams = new URLSearchParams(document.location.search);
  var searchTerm = searchParams.get("search");
  //Update search bar if URL contains a search term
  if (searchTerm) {
    searchBar.value = searchTerm;
  }
}

//Update directory list to reflect the search term
searchBar.oninput = function () {
  updateList();
  console.log("getting full item obj");
  console.log(fullItemObj);
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
  //No search param in URL when search bar is empty
  //And no filtering of directory items
  if (searchText == "") {
    searchParams.delete("search");
    updateURLToReflectUI(searchParams);
    return functionObj;
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
    updateURLToReflectUI(searchParams);
    currentItemObj = functionObj;
    return functionObj;
  }
}

//Format content as HTML elements
function formatContent(itemObj) {
  folders = itemObj.folders;
  files = itemObj.files;
  var formattedList = [];
  var setTrue = true;
  //Create a link element for each item
  folders.forEach((obj) => {
    infoElement = "<p class='sizeInfo'>" + obj.itemCount + "</p>";
    //Wrap each folder entry's elements in a div
    formattedList.push("<div class='contentEntry'>");
    formattedList.push(
      `<p class='item folder' onclick=changeFolderView('${obj.folderName}',${setTrue})><u>${obj.folderName}</u></p>`
    );
    formattedList.push(infoElement);
    formattedList.push("<p class='notApplicable'>n/a</p>");
    formattedList.push("</div>");
  });
  files.forEach((obj) => {
    infoElement = `<p class='sizeInfo'>${obj.fileSize}</p>`;
    //Wrap each folder entry's elements in a div
    formattedList.push("<div class='contentEntry'>");
    formattedList.push(
      `<a class='item file' href=${obj.fileName}>${obj.fileName}</a>`
    );
    formattedList.push(infoElement);
    formattedList.push("<input type='checkbox' class='downloadBox'>");
    formattedList.push("</div>");
  });
  //Display 'no results' message when appropriate
  if (formattedList.length == 0) {
    return "<p><i>No results</i></p>";
  } else {
    return formattedList.join("");
  }
}

function downloadItems(indices = getDownloadIndices()) {
  var currentFiles = document.getElementsByClassName("file");
  console.log(currentFiles[0].innerHTML);
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
