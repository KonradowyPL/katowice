export { geolocation_init };

const geolocation_init = (map, updateUserPos) => {
  var userPosIcon = new L.Icon({
    iconUrl: "./assets/userPos.svg",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const userPosMarker = L.marker([50.2661678296663, 19.02556763415931], {
    icon: userPosIcon,
  })
    .setZIndexOffset(9999999)
    .addTo(map);
  userPosMarker.setOpacity(0);
  userPosMarker.options.interactive = false;

  const localisationError = () => {
    locationBox.style.display = "flex";
    userPosMarker.setOpacity(0);
    userPosMarker.options.interactive = false;
  };

  navigator.permissions.query({ name: "geolocation" }).then((permissionStatus) => {
    permissionStatus.onchange = () => {
      navigator.geolocation.clearWatch(localisationUpdateInterval);
      localisationUpdateInterval = navigator.geolocation.watchPosition(updateUserPos, localisationError);
    };
  });

  var localisationUpdateInterval = navigator.geolocation.watchPosition(updateUserPos, localisationError);

  navigator.geolocation.getCurrentPosition((position) => {
    map.setView([position.coords.latitude, position.coords.longitude]);
    updateUserPos(position);
  }, localisationError);



  return userPosMarker
};
