export { loadRoutes };

const routesData = await fetch("./PLACES/routes.json").then((res) => res.json());

function loadRoutes(places, userPos) {
  const routes = {};
  const badges = [];
  var ele = "";

  places.forEach((place) => {
    if (!place.routes) return;

    place.routes.forEach((route) => {
      routes[route] ||= [];
      routes[route].push(place.id);
    });
  });

  Object.keys(routes).forEach((key, i) => {
    const route = routes[key];
    var thisele = "";
    var completed = 0;
    const distances = [];
    route.forEach((key, i) => {
      const place = places.find((place) => place.id == key);
      const markerPos = { lat: place.lat, lon: place.lon };
      const distance = userPos.distanceTo(markerPos);
      distances.push({
        id: key,
        distance: place.unlocked ? Infinity : distance,
      });
    });

    distances.sort((a, b) => a.distance - b.distance);

    distances.forEach((e) => {
      const place = places.find((obj) => obj.id == e.id);
      const distance = e.distance;
      var roundedDistance;
      if (distance > 1000) {
        roundedDistance = (distance / 1000).toFixed(1) + " km";
      } else {
        roundedDistance = (distance / 20).toFixed(0) * 20 + " m";
      }

      if (place.unlocked) {
        thisele += `<li><a href="#map:${e.id}&"><span>${place.name}</span><i class="bi bi-check"></i></a></li>`;
        completed++;
      } else {
        thisele += `<li><a href="#map:${e.id}&"><span>${place.name}</span><span>${roundedDistance}</span></a></li>`;
      }
    });
    if (route.length == completed) {
      badges.push(key);
    }

    const routeData = routesData.find((routeData) => routeData.id == key);

    ele +=
      `<div class="route visited nonVisited"><div class="routeMeta"><img src="./assets/${key}.svg"><div class="routeTitle"><span>${routeData.name}</span><span>${completed}/${route.length}</span></div><span class="routeDiscreption">${routeData.discreption}</span></div><ul>` +
      thisele +
      "</ul></div>";
  });
  document.getElementById("routesObj").innerHTML = ele;
  const sel = document.querySelector("#badges .selected")?.src;
  document.getElementById("badges").innerHTML = "";
  badges.forEach((e) => {
    const ele = document.createElement("img");
    ele.src = `./assets/${e}.svg`;
    if (sel == ele.src) {
      ele.classList.add("selected");
    }

    ele.onclick = (event) => {
      Array.from(document.getElementById("badges").children).forEach((e) => e.classList.remove("selected"));
      ele.classList.add("selected");
      const data = routesData.find((data) => data.id == e);
      badgeInfo.innerHTML = `Odznaka za odwiedzenie wszystkich <b>${data.nn || data.name}</b>.`;
    };

    document.getElementById("badges").appendChild(ele);
  });
}
