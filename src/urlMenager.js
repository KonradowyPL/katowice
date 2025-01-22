export { u };
import { places } from "./loader.js";
import { displayPlace } from "./placeinfo.js";

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
        backButton.href = "#mainmenu";
        mainmenu.classList.add("hidden");

        const match = url.match(/^#map:(\d+)(&?)$/);
        const id = match[1] | 0;
        const move = !!match[2];
        const place = places.find((place) => place.id == id);
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
      return handler();
    }
  }
};

window.addEventListener("popstate", function () {
  u(window.location.hash);
});
