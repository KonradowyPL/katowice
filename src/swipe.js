export { swiping };

import { map } from "./map.js";

const tooltipsSwipeButton = document.getElementById("tooltipsSwipeButton");
const tooltips = document.getElementById("tooltips");
const menuDiv = document.getElementById("mainmenu");

var swiping = false;
var swipingStart;
var swipingFix;
var tabswiping = false;

tooltipsSwipeButton.onmousedown = (e) => {
  swipingStart = 1 - e.clientY / document.documentElement.scrollHeight;
  swipingFix = swipingStart - parseFloat(tooltips.style.height) * 0.01;
  swiping = true;
};

tooltipsSwipeButton.ontouchstart = (e) => {
  swipingStart = 1 - e.changedTouches[0].clientY / document.documentElement.scrollHeight;
  swipingFix = swipingStart - parseFloat(tooltips.style.height) * 0.01;
  swiping = true;
};

tooltips.ontouchmove = (e) => {
  if (placeData.scrollTop == 0 && !swiping) {
    swiping = true;
    tabswiping = true;
    swipingStart = e.changedTouches[0].clientY / document.documentElement.scrollHeight;
    swipingFix = 1 - parseFloat(tooltips.style.height) * 0.01 - swipingStart;
  }
};

document.onmouseup = (e) => f(e.clientY, e.clientX);
document.ontouchend = (e) => f(e.changedTouches[0].clientY, e.changedTouches[0].clientX);

const f = (h, w) => {
  if (swiping) {
    const height = 1 - h / document.documentElement.scrollHeight - swipingFix;
    if (height > 0.1) {
      tooltips.style.transition = "300ms";

      if (height >= (tabswiping ? 0.9 : swipingStart)) {
        tooltips.style.height = "90%";
      } else {
        tooltips.style.height = "10%";
        placeData.scrollTop = 0;

        window.location.hash = "#map";
      }
    } else {
      tooltips.style.height = "0%";
      tooltips.style.transition = "100ms";
      window.location.hash = "#map";
    }
  }
  if (menuSwipe) {
    const x = w;
    menuDiv.style.translate = null;
    menuDiv.style.transition = null;
    map.dragging.enable();
    if (menuSwipeMode) {
      if (x > 50) {
        window.location = "#mainmenu";
      }
    } else if (x < document.documentElement.scrollWidth - 50) {
      window.location = "#map";
    }
  }
  swiping = false;
  tabswiping = false;
  menuSwipe = false;
};

document.onmousemove = (e) => {
  if (swiping) {
    const height = 1 - e.clientY / document.documentElement.scrollHeight - swipingFix;
    tooltips.style.transition = "0ms";
    tooltips.style.height = height * 100 + "%";
    placeData.scrollTop = 0;
  }
};

document.ontouchmove = (e) => {
  console.log("called");
  if (swiping) {
    var height = 1 - e.changedTouches[0].clientY / document.documentElement.scrollHeight - swipingFix;
    if (tabswiping) {
      if (height > 0.9) {
        height = 0.9;
      } else {
        placeData.scrollTop = 0;
      }
    }
    tooltips.style.transition = "0ms";
    tooltips.style.height = height * 100 + "%";
  }
  if (menuSwipe) {
    const x = 1 - (e.changedTouches[0].clientX - menuSwipeStart) / document.documentElement.scrollWidth;
    menuDiv.style.translate = `-${x * 100}% 0px`;
  }
};

var menuSwipe = false;
var menuSwipeStart = null;
var menuSwipeMode = null;

document.ontouchstart = (e) => {
  if (swiping) return;
  const x = e.changedTouches[0].clientX;
  const mode = mainmenu.classList.contains("hidden");

  if (mode ? x < 30 : x > document.documentElement.scrollWidth - 30) {
    menuSwipe = true;
    menuSwipeStart = mode ? x : document.documentElement.scrollWidth - x;
    menuDiv.style.transition = "0ms";
    map.dragging.disable();
    menuSwipeMode = mode;
  }
};
