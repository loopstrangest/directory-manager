//Assign names to content list elements
var searchBar = document.getElementById("searchBar");
var contentList = document.getElementById("contentList");
var combinedItemList = [];
var currentItemList = [];

//Initialize socket
var socket = io({
  //withCredentials: true,
  transports: ["websocket"],
  upgrade: false,
  //reconnection: false
});

//Receive list of directory items from server
socket.on("sendContent", receiveContent);

function receiveContent(itemContent, itemDetails) {
  //Create an array of arrays
  //Each inner array has the item path AND folder count OR file size
  combinedItemList = itemContent.map((item, i) => {
    return [item, itemDetails[i]];
  });
  //Set initial current list to match full list
  currentItemList = combinedItemList;
  //Update the displayed list on page load
  getSearchTermFromURL();
  updateList(combinedItemList);
  getDownloadsFromURL();
}

//On page load, check for search term from URL and update UI
function getSearchTermFromURL() {
  var searchParams = new URLSearchParams(document.location.search);
  var searchTerm = searchParams.get("search");
  //Update search bar if URL contains a search term
  if (searchTerm != null) {
    searchBar.value = searchTerm;
  }
}

//Update directory list to reflect the search term
searchBar.oninput = function () {
  updateList(combinedItemList);
  updateDownloadParam(getDownloadIndices());
};

//Display content list
function updateList(content) {
  var formattedList = formatContent(filterContent(content));
  contentList.innerHTML = formattedList;

  //After download elements display on page, access them
  getDownloadElements();
}

//Filter content list based on search criteria
function filterContent(content) {
  var searchParams = new URLSearchParams(document.location.search);
  searchText = searchBar.value;
  //No search param in URL when search bar is empty
  //And no filtering of directory items
  if (searchText == "") {
    searchParams.delete("search");
    updateURLToReflectUI(searchParams);
    return content;
  } else {
    //Filter directory items based on the search bar text
    var filteredList = content.filter(
      (entry) => entry[0].search(searchText) != -1
    );
    //Update URL to include the search parameter
    searchParams.set("search", searchText);
    updateURLToReflectUI(searchParams);
    //Update currentItemList
    currentItemList = filteredList;
    return filteredList;
  }
}

//Format content as HTML elements
function formatContent(content) {
  var formattedList = [];
  //Create a link element for each item
  content.forEach((entry) => {
    infoElement = "<p class='sizeInfo'>" + entry[1] + "</p>";
    //Wrap each entry's elements in a div
    formattedList.push("<div class='contentEntry'>");
    if (entry[1].search("item") != -1) {
      //data with 'item' is a folder: <p> is appropriate element
      formattedList.push("<p class='item'>" + entry[0] + "</p>");
      formattedList.push(infoElement);
      formattedList.push("<p class='notApplicable'>n/a</p>");
    }
    //data without 'item' is a file: <a> is appropriate element
    else {
      formattedList.push(
        "<a class='item' href=" + entry[0] + ">" + entry[0] + "</a>"
      );
      formattedList.push(infoElement);
      formattedList.push("<input type='checkbox' class='downloadBox'>");
    }

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
  console.log(currentItemList);
  indices.forEach((index) => {
    //Set download element link, filepath, filename
    var link = document.createElement("a");
    var filepath = currentItemList[index][0];
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
