let stopSeqs = [];
let stopCodes = [];
let stopNames = [];
let btnSearch = document.querySelector(".search-route-button");
let btnsRoute;
let userInput = document.querySelector(".user-input");
let routeBtnsContainer = document.querySelector(".route-buttons-container");
let routeInfoContainer = document.querySelector(".route-info-container");

async function clearArr() {
  stopSeqs.length = 0;
  stopCodes.length = 0;
  stopNames.length = 0;
}

function clearContainer(className) {
  while (document.querySelector(`.${className}`).firstChild) {
    document.querySelector(`.${className}`).removeChild(document.querySelector(`.${className}`).firstChild);
  }
}

async function createRouteBtns() {
  userInput.value = userInput.value.split(" ").join("").toUpperCase();
  let oriDestData = "https://data.etabus.gov.hk/v1/transport/kmb/route/";

  let response = await fetch(oriDestData);
  let result = await response.json();
  let vaildRoute = false;

  for (let i = 0; i < result.data.length; i++) {
    if (result.data[i].route === userInput.value) {
      let route = result.data[i]["route"];
      let orig = result.data[i]["orig_tc"];
      let dest = result.data[i]["dest_tc"];
      let serType = result.data[i]["service_type"];
      let bound = result.data[i]["bound"];

      let button = document.createElement("button");
      button.setAttribute("class", "route-button");
      button.setAttribute("route", route);
      button.setAttribute("bound", bound);
      button.setAttribute("service-type", serType);

      button.textContent = `${route} ${orig} ➔ ${dest} `;
      routeBtnsContainer.appendChild(button);

      vaildRoute = true;
    }
  }
  // for loop end
  if (!vaildRoute) {
    let invaildText = document.createElement("div");
    invaildText.setAttribute("class", "invaild-text");
    invaildText.textContent = "無效輸入 請確保輸入正確路線";
    routeBtnsContainer.appendChild(invaildText);
  }
}

async function createRouteInfo(route, serType, bound) {
  let boundFullName;
  if (bound === "I") {
    boundFullName = "inbound";
  } else if (bound === "O") {
    boundFullName = "outbound";
  }
  let routeData = `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${route}/${boundFullName}/${serType}`;
  let response = await fetch(routeData);
  let result = await response.json();

  let routeStops = result.data;

  for (let i = 0; i < routeStops.length; i++) {
    stopCodes[i] = routeStops[i].stop;
    stopSeqs[i] = routeStops[i].seq;
  }

  await convertStopNames(stopCodes);

  for (let j = 0; j < stopNames.length; j++) {
    let stopInfo = document.createElement("div");
    stopInfo.textContent = `#${j + 1} - ${stopNames[j]}`;
    routeInfoContainer.appendChild(stopInfo);
  }
}

async function convertStopNames(stopCodes) {
  let url = "https://data.etabus.gov.hk/v1/transport/kmb/stop";

  let response = await fetch(url);
  let result = await response.json();

  let stopNamesData = result.data;

  for (i = 0; i < stopNamesData.length; i++) {
    for (j = 0; j < stopCodes.length; j++) {
      if (stopNamesData[i]["stop"] === stopCodes[j]) {
        stopNames[j] = stopNamesData[i]["name_tc"];
      }
    }
  }
}

btnSearch.addEventListener("click", async function () {
  clearArr();
  clearContainer("route-buttons-container");
  clearContainer("route-info-container");
  await createRouteBtns();
  btnsRoute = document.querySelectorAll(".route-button");
  clickRouteBtn();
});

function clickRouteBtn() {
  clearArr();
  clearContainer("route-info-container");
  for (let i = 0; i < btnsRoute.length; i++) {
    btnsRoute[i].addEventListener("click", function () {
      clearArr();
      clearContainer("route-info-container");
      let route = btnsRoute[i].getAttribute("route");
      let serType = btnsRoute[i].getAttribute("service-type");
      let bound = btnsRoute[i].getAttribute("bound");

      createRouteInfo(route, serType, bound);
    });
  }
}
