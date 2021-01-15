//Initialize socket
var socket = io({
  //withCredentials: true,
  transports: ["websocket"],
  upgrade: false,
  //reconnection: false
});

//Receive content list from server
socket.on("sendContent", updateDisplay);

function updateDisplay(contentList) {
  formattedList = formatContentList(contentList);

  contentList = document.getElementById("contentList");
  contentList.innerHTML = formattedList;
  contentList.style.color = "red";
}

function formatContentList(list) {
  formattedList = [];
  list.forEach((entry) => {
    formattedList.push("<a href=" + entry + ">" + entry + "</a>");
  });
  return formattedList.join("");
}
