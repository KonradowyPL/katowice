export {swiping}


const tooltipsSwipeButton = document.getElementById("tooltipsSwipeButton")
const tooltips = document.getElementById("tooltips")

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

document.onmouseup = (e) => f(e.clientY);
document.ontouchend = (e) => f(e.changedTouches[0].clientY);

const f = (h) => {
  if (swiping) {
    const height = 1 - h / document.documentElement.scrollHeight - swipingFix;
    if (height > 0.1) {
      tooltips.style.transition = "300ms";

      if (height >= swipingStart) {
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

  swiping = false;
  tabswiping = false;
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
};