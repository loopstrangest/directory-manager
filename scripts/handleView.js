function updateViewParam(folder) {
  var searchParams = new URLSearchParams(document.location.search);
  searchParams.set("view", folder);
  updateURLToReflectUI(searchParams);
}

function getViewFromURL() {
  var searchParams = new URLSearchParams(document.location.search);
  var folder = searchParams.get("view");
  //Update view if URL contains a folder
  return folder;
}
