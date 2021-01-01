// global selectons

const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelectorAll(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
let initialColors;
const adjustBtn = document.querySelectorAll(".adjust");
const sliderPanel = document.querySelectorAll(".sliders");
const adjustCloseBtn = document.querySelectorAll(".close-adjustment");
const refreshBtn = document.querySelector(".generate");
const saveBtn = document.querySelector(".save");
const libraryBtn = document.querySelector(".library");
const lockBtn = document.querySelectorAll(".lock");
const darkMode = document.getElementById("darkMode");
const popup = document.querySelector(".copy-container");
const saveCont = document.querySelector(".save-container");
const savePop = document.querySelector(".save-popup");
const saveClose = document.querySelector(".close-save");
const libraryCont = document.querySelector(".library-container");
const libraryPop = document.querySelector(".library-popup");
const libraryClose = document.querySelector(".close-library");
//  add event litseners

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((slider, index) => {
  slider.addEventListener("change", () => {
    updateTextUI(index);
  });
});

adjustBtn.forEach((adjust, index) => {
  adjust.addEventListener("click", () => {
    adjus(index);
  });
});

adjustCloseBtn.forEach((close, index) => {
  close.addEventListener("click", () => {
    closeAdj(index);
  });
});

lockBtn.forEach((locks, index) => {
  locks.addEventListener("click", (e) => {
    lock(e, index);
  });
});
refreshBtn.addEventListener("click", refresh);
saveBtn.addEventListener("click", save);
saveClose.addEventListener("click", saveclose);
libraryBtn.addEventListener("click", library);
libraryClose.addEventListener("click", libraryclose);

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popupBox.classList.remove("active");

  popup.classList.remove("active");
});

// darkmode
darkMode.addEventListener("click", DarkMode);

//  functions

// generate Hex or color generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

let randomHex = generateHex();
console.log(randomHex);

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    // add it to array
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    //  add color to background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    //  check for contrast

    updateTextUI(index);

    // initial color sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    colorizeSliders(color, hue, brightness, saturation);
  });
  // reset inputs
  resetInputs();
}

//  contrast

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

console.log();
function colorizeSliders(color, hue, brightness, saturation) {
  //Scale Saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  //Scale Brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //Update Input Colors
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)} ,${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;
  // coloriesed input aliders
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
    console.log(color);
  }
  textHex.innerText = color;
}

function resetInputs() {
  const slide = document.querySelectorAll(".sliders input");
  slide.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[1];

      slider.value = Math.floor(brightValue * 100) / 100;
    }

    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[2];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  // popup animation

  const popupBox = popup.children[0];

  popupBox.classList.add("active");

  popup.classList.add("active");
}

function lock(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];

  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

function save() {
  saveCont.classList.add("active");
  savePop.classList.add("active");
}

function saveclose() {
  saveCont.classList.remove("active");
  savePop.classList.remove("active");
}
function library() {
  libraryCont.classList.add("active");
  libraryPop.classList.add("active");
}

function libraryclose() {
  libraryCont.classList.remove("active");
  libraryPop.classList.remove("active");
}

function adjus(index) {
  sliderPanel[index].classList.toggle("active");
}
function closeAdj(index) {
  sliderPanel[index].classList.remove("active");
}
randomColors();

function refresh() {
  randomColors();
}

darkMode.checked = false;

//

// return hash;

// dark mode

function DarkMode() {
  const darkPanel = document.querySelector(".panel");
  const darkPanelBtnl = document.querySelectorAll(".panel button");
  const darkslider = document.querySelectorAll(".sliders");
  if (!darkMode.checked) {
    darkPanel.classList.remove("dark");
    darkPanelBtnl.forEach((btn) => {
      btn.classList.remove("dark");
    });

    darkslider.forEach((slid) => {
      slid.classList.remove("dark");
    });
  } else {
    // darkMode.checked = true;
    darkPanel.classList.add("dark");

    darkPanelBtnl.forEach((btn) => {
      btn.classList.add("dark");
    });

    darkslider.forEach((slid) => {
      slid.classList.add("dark");
    });
  }
}
