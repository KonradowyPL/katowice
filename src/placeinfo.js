export { displayPlace, init_placeinfo, currentPlace, currentPlaceDat };

var places = null;
var currentPlace = "";
var currentPlaceDat = "";
var markerCircle = null;

const init_placeinfo = (_places, _markerCircle) => {
  places = _places;
  markerCircle = _markerCircle;
};

const placeData = document.getElementById("placeData");

async function displayPlace(key, move) {
  placeData.scrollTop = 0;
  const placeDat = places.find((place) => place.id == key);
  currentPlace = key;
  currentPlaceDat = placeDat;

  document.title = `${placeDat.name} - Ciekawe Katowice`;
  tooltips.style.height = "90%";
  tooltips.style.transition = "300ms";

  markerCircle.setLatLng([placeDat.lat, placeDat.lon]);
  if (move) map.setView([placeDat.lat, placeDat.lon], 19);

  placeName.innerHTML = placeDat.name;
  placeContact.innerHTML = "";
  placeSummary.innerHTML = "";
  placeImages.innerHTML = "";
  placeShort.innerHTML = "";
  placeInfo.innerHTML =
    "<div class='loading_title'>Ładowawnie...</div><div class='loading_spinner'><i class='bi bi-arrow-clockwise'></i></div>";

  const res = await fetch(`./PLACES/${key}.json`);
  const place = await res.json();

  placeImages.innerHTML = "";
  placeImages.append(
    ...place.img.map((image) => {
      const img = document.createElement("img");
      img.setAttribute("src", image.src);
      img.setAttribute("width", image.width);
      img.setAttribute("height", image.height);
      img.onclick = () => displayImage(image.src);
      return img;
    })
  );
  var contact = "";
  {
    if (place.website) {
      contact += `<a href="${place.website}" target="_blank"><i class="bi bi-globe2"></i></a>`;
    }
    if (place.phone) {
      contact += `<a href="tel:${place.phone}" target="_blank"><i class="bi bi-telephone"></i></a>`;
    }
    if (place.email) {
      contact += `<a href="mailto:${place.email}" target="_blank"><i class="bi bi-envelope-at"></i></a>`;
    }
    if (place.wikipedia) {
      contact += `<a href="${place.wikipedia}" target="_blank"><i class="bi bi-wikipedia"></i></a>`;
    }
    contact += `<a href="https://osm.org/directions?to=${placeDat.lat}%2C${placeDat.lon}#map=19/${placeDat.lat}/${placeDat.lon}" target="_blank"><i class="bi bi-geo-alt"></a>`;
  }
  placeContact.innerHTML = contact;
  placeShort.innerHTML = place.short;
  placeSummary.innerHTML = place.summary;
  placeInfo.innerHTML = placeDat.unlocked
    ? place.discreption + "<br>"
    : "<div class='locked'>Odwiedź to miejsce aby dowiedzieć się więcej!</div>";
}

window.share = async () => {
  const shareData = {
    title: currentPlaceDat.name,
    text: `Odwiedź ${currentPlaceDat?.name2 || currentPlaceDat.name} i inne ciekawe miejsca w katowicach!`,
    url: window.location.href.replace(/[\?#].*$/, "") + "#map:" + currentPlace,
  };
  try {
    await navigator.share(shareData);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};

const imagePreview = document.getElementById("imagePreview");
imagePreview.onclick = (e) => {
  if (e.target == imagePreview) imagePreview.innerHTML = "";
};

function displayImage(src) {
  imagePreview.innerHTML = "";
  const img = document.createElement("img");
  img.src = src;
  imagePreview.append(img);
}
