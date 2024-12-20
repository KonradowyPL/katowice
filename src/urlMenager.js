export { u, urlMenager_get };

var places = [];
var displayPlace = undefined;

const u = (url) => {
  if (url.startsWith("http")) {
    var win = window.open(url, "_blank");
    win.focus();
  }
  if (url.startsWith("#")) {
    if (url.startsWith("#mainmenu")) {
      mainmenu.classList.remove("hidden");
      backButton.href = "#map";
    }
    if (url.startsWith("#map")) {
      backButton.href = "#mainmenu";

      mainmenu.classList.add("hidden");
      if (url.startsWith("#map:")) {
        var move = false;
        if (url.endsWith("&")) {
          url = url.slice(0, -1);
          move = true;
        }
        url = trimPrefix(url, "#map:");
        const place = places.find((place) => place.id == url);
        if (place) {
          displayPlace(url, move);
        } else {
          tooltips.style.height = "0%";
        }
      }
    }
  }
};

window.addEventListener("popstate", function () {
  u(window.location.hash);
});

function trimPrefix(str, prefix) {
  if (str.startsWith(prefix)) {
    return str.slice(prefix.length);
  } else {
    return str;
  }
}

const urlMenager_get = (_places, _displayPlace) => {
  places = _places;
  displayPlace = _displayPlace;
};
