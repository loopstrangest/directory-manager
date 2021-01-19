homeInput = document.getElementById("selectHome");

//Submit home change when the form's input value changes
homeInput.onchange = function () {
  updateHomeParam(homeInput.value);
  clearDownloadParam();
  this.form.submit();
};

//Update the home search param
function updateHomeParam(selectedHome) {
  var searchParams = new URLSearchParams(document.location.search);
  if (selectedHome == "admin") {
    searchParams.set("home", selectedHome);
  } else {
    searchParams.delete("home");
  }
  updateURLToReflectUI(searchParams);
}

//On page load, check for home param from URL and update UI
function getHomeFromURL() {
  var searchParams = new URLSearchParams(document.location.search);
  var home = searchParams.get("home");
  //Update downloads if any are listed in URL
  if (home != null) {
    //Get usable download index list from search param
    homeInput.value = home;
  }
}
