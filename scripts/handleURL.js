//Set the URL to reflect the current state of the UI
function updateURLToReflectUI(searchParams) {
  var query = Array.from(searchParams).length > 0 ? "?" : "";
  window.history.replaceState(
    null,
    "",
    `${location.pathname}${query}${searchParams}`
  );
}
