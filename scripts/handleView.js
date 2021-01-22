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

function updateCurrentView(path, pathIsRoot) {
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
