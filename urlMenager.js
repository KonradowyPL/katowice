const u = (url) => {
  if (url.startsWith("http")) {
    var win = window.open(url, "_blank");
    win.focus();
  }
  if (url.startsWith("#")) {
    if (url.startsWith("#mainmenu")) {
      mainmenu.classList.remove("hidden");
    }
    if (url.startsWith("#map")) {
      mainmenu.classList.add("hidden");
    }
  }
};
