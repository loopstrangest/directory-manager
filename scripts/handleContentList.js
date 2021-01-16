//Assign names to content list elements
var searchBar = document.getElementById("searchBar");
var contentList = document.getElementById("contentList");
var allDirectoryItems = [];

//Initialize socket
var socket = io({
  //withCredentials: true,
  transports: ["websocket"],
  upgrade: false,
  //reconnection: false
});

//Receive list of directory items from server
socket.on("sendContent", getAllDirectoryItems);
socket.on("sendContent", updateList);
getSearchTerm();

//Check for search term from URL and set search bar value
function getSearchTerm() {
  var searchParams = new URLSearchParams(document.location.search.substring(1));
  var searchTerm = searchParams.get("search");
  //Update search bar if URL contains a search term
  if (searchTerm != null) {
    searchBar.value = searchTerm;
  }
}

//Save complete directory to access as needed
function getAllDirectoryItems(items) {
  allDirectoryItems = items;
}

//Update directory list with every change to the search term
searchBar.oninput = function () {
  updateList(allDirectoryItems);
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
      (entry) => entry.search(searchText) != -1
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
    formattedList.push("<a href=" + entry + ">" + entry + "</a>");
  });
  //Display 'no results' message when appropriate
  if (formattedList.length == 0) {
    return "<p>No results</p>";
  } else {
    return formattedList.join("");
  }
}
