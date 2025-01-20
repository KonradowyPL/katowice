export { u, urlMenager_get };

var places = [];
var displayPlace = undefined;

const u = (url) => {
  const map = new Map([
    [
      /^https:\/\/.+$/,
      () => {
        window.open(url, "_blank").focus();
      },
    ],
    [
      /^#mainmenu.*$/,
      () => {
        mainmenu.classList.remove("hidden");
        backButton.href = "#map";
      },
    ],
    [
      /^#map$/,
      () => {
        backButton.href = "#mainmenu";
        mainmenu.classList.add("hidden");
      },
    ],
    [
      /^#map:(\d+)(&?)$/,
      () => {
        const match = url.match(/^#map:(\d+)(&?)$/);
        console.log("called", match);
        const id = match[1] | 0;
        const move = !!match[2];
        const place = places.find((place) => place.id == id);
        console.log(id, move, place);
        if (place) {
          displayPlace(id, move);
        } else {
          tooltips.style.height = "0%";
        }
      },
    ],
  ]);

  for (const [regex, handler] of map) {
    if (regex.test(url)) {
      console.log(regex, handler, handler.toString());
      return handler();
    }
  }
};

window.addEventListener("popstate", function () {
  u(window.location.hash);
});

const urlMenager_get = (_places, _displayPlace) => {
  places = _places;
  displayPlace = _displayPlace;
};
