export { collapse };

function collapse(places, map, currentPlace) {
  places.forEach((place, i) => {
    const marker = place.marker;
    place.screen = map.latLngToContainerPoint(marker.getLatLng());
    marker._icon.classList.remove("disabled");
    marker._icon.classList.remove("notext");

    if (!place.width) {
      place.width = marker._icon.childNodes[1].offsetWidth;
    }
  });

  places.forEach((place, i) => {
    const marker = place.marker;
    if (marker._icon.classList.contains("disabled")) return;
    const position = place.screen;

    for (let index = i + 1; index < places.length; index++) {
      const second = places[index].marker;
      const secondPosition = places[index].screen;
      const [distance, diff] = pitagoras(position, secondPosition);
      if (distance < 700) {
        if (
          (currentPlace == place.id ? Infinity : place.weight) <
          (currentPlace == places[index].id ? Infinity : places[index].weight)
        ) {
          marker._icon.classList.add("disabled");
          marker._icon.classList.add("notext");
        } else {
          second._icon.classList.add("disabled");
          second._icon.classList.add("notext");
        }
      }
    }
  });
  places.forEach((place, i) => {
    const marker = place.marker;
    if (marker._icon.classList.contains("disabled")) return;
    places.forEach((second, i2) => {
      if (second.marker._icon.classList.contains("disabled")) return;
      const position = place.screen;
      const secondPosition = second.screen;
      const [distance, diff] = pitagoras(secondPosition, position);

      if (diff.y < 30 && diff.x > 0 && diff.x < place.width + 50) {
        marker._icon.classList.add("notext");
      }
    });
  });
}

function pitagoras(a, b) {
  const diff = {
    x: a.x - b.x,
    y: Math.abs(a.y - b.y),
  };
  return [diff.x * diff.x + diff.y * diff.y, diff];
}
