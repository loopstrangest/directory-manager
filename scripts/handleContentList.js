//Assign names to content list elements
var searchBar = document.getElementById("searchBar");
var contentList = document.getElementById("contentList");
var combinedItemInfo = [];

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
  combinedItemInfo = itemContent.map((item, i) => {
    return [item, itemDetails[i]];
  });
  //Update the displayed list on page load
  getSearchTermFromURL();
  updateList(combinedItemInfo);
}

//Check for search term from URL and set search bar value
function getSearchTermFromURL() {
  var searchParams = new URLSearchParams(document.location.search.substring(1));
  var searchTerm = searchParams.get("search");
  //Update search bar if URL contains a search term
  if (searchTerm != null) {
    searchBar.value = searchTerm;
  }
}

//Update directory list to reflect the search term
searchBar.oninput = function () {
  updateList(combinedItemInfo);
};

//Display content list
function updateList(content) {
  var formattedList = formatContent(filterContent(content));
  contentList.innerHTML = formattedList;
}

//Filter content list based on search criteria
function filterContent(content) {
  searchText = searchBar.value;
  //No search param in URL when search bar is empty
  //And no filtering of directory items
  if (searchText == "") {
    window.history.pushState(null, "", location.origin);
    return content;
  } else {
    //Filter directory items based on the search bar text
    var filteredList = content.filter(
      (entry) => entry[0].search(searchText) != -1
    );
    //Update URL to include the search parameter
    window.history.pushState(
      null,
      "",
      location.origin + "/?search=" + searchText
    );
    return filteredList;
  }
}

//Format content as HTML elements
function formatContent(content) {
  var formattedList = [];
  //Create a link element for each item
  content.forEach((entry) => {
    formattedList.push("<div class='contentEntry'>");
    if (entry[1].search("item") != -1) {
      //data with 'item' is a folder: <p> is appropriate element
      formattedList.push("<p>" + entry[0] + "</p>");
    }
    //data without 'item' is a file: <a> is appropriate element
    else {
      formattedList.push("<a href=" + entry[0] + ">" + entry[0] + "</a>");
    }
    formattedList.push("<p>" + entry[1] + "</p>");
    formattedList.push("</div>");
  });

  //Display 'no results' message when appropriate
  if (formattedList.length == 0) {
    return "<p>No results</p>";
  } else {
    return formattedList.join("");
  }
}
