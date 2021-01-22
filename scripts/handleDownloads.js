downloadButton = document.getElementById("downloadButton");

//Access download checkboxes *after* they're instantiated on the page
function getDownloadElements() {
  downloadCheckboxes = document.querySelectorAll(".downloadBox");
  downloadCheckboxes.forEach((item) => {
    item.oninput = function () {
      updateDownloadParam(getDownloadIndices());
    };
  });
}

//On page load, check for downloads param from URL and update UI
function getDownloadsFromURL() {
  var searchParams = new URLSearchParams(document.location.search);
  var downloads = searchParams.get("download");
  //Update downloads if any are listed in URL
  if (downloads) {
    //Get usable download index list from search param
    downloads.split(",").forEach((index) => {
      try {
        downloadCheckboxes[index].checked = true;
      } catch (error) {
        console.log("Checkbox not found: " + error);
      }
    });
  }
}

//Set the download search param based on current state of UI
function updateDownloadParam(downloadIndices) {
  var searchParams = new URLSearchParams(document.location.search);
  if (downloadIndices.length == 0) {
    searchParams.delete("download");
  } else {
    searchParams.set("download", downloadIndices.toString());
  }
  updateURLToReflectUI(searchParams);
}

//Clear the download param when the user changes the home directory
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
