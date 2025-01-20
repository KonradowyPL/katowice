import("./main.js").catch(
  () =>
    (document.getElementById("loadingStatus").innerText =
      "Nie udało się załadować aplikacji. Spróbuj ponownie później lub skontaktuj się z administratorem strony.")
);
