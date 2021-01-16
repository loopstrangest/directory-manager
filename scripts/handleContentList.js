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

//Receive content list from server
socket.on("sendContent", getAllDirectoryItems);
socket.on("sendContent", updateList);

//Save complete, unfiltered directory to access as needed
function getAllDirectoryItems(content) {
  allDirectoryItems = content;
}

//Display initial content list
function updateList(content) {
  var formattedList = formatContent(filterContent(content));
  contentList.innerHTML = formattedList;
}

function formatContent(content) {
  var formattedList = [];
  content.forEach((entry) => {
    formattedList.push("<a href=" + entry + ">" + entry + "</a>");
  });
  return formattedList.join("");
}

searchBar.oninput = function () {
  updateList(allDirectoryItems);
};

function filterContent(content) {
  if (searchBar.value == "") {
    return content;
  } else {
    var filteredList = content.filter(
      (entry) => entry.search(searchBar.value) != -1
    );
    return filteredList;
  }
}
