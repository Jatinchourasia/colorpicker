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
const libraryExpand = document.querySelector(".big-library");

const submitSave = document.querySelector(".submit-save");
const saveInput = document.querySelector(".save-container input");
const pallateh4 = document.getElementById("palleteh4");

let savedPalettes = [];
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
libraryExpand.addEventListener("click", libraryexpand);
submitSave.addEventListener("click", savePallet);

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
  saveInput.value = "";
}

function savePallet() {
  const name = saveInput.value;

  if (name == "") {
    pallateh4.classList.add("active");
    pallateh4.addEventListener("animationend", () => {
      pallateh4.classList.remove("active");
    });
  } else {
    const colors = [];
    currentHexes.forEach((hex) => {
      colors.push(hex.innerText);
    });

    //  genrate objects

    let PaletteNr;
    const paletteObject = JSON.parse(localStorage.getItem("palettes "));
    if (paletteObject) {
      PaletteNr = paletteObject.length;
    } else {
      PaletteNr = savedPalettes.length;
    }

    const PaletteObj = { name, colors, nr: PaletteNr };

    savedPalettes.push(PaletteObj);
    // save to local storage
    savetoLocal(PaletteObj);
    saveInput.value = "";

    // generate the pallate for library

    const palette = document.createElement("div");
    palette.classList.add("custom-palette");

    const title = document.createElement("h4");
    title.innerText = PaletteObj.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");

    PaletteObj.colors.forEach((smallcolors) => {
      const smallDiv = document.createElement("div");
      smallDiv.style.backgroundColor = smallcolors;
      preview.appendChild(smallDiv);
    });

    const palettePickBtn = document.createElement("button");
    palettePickBtn.classList.add("pick-palette-btn");
    palettePickBtn.classList.add(PaletteObj.nr);
    palettePickBtn.innerText = "Select";

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("pick-delete-btn");
    deleteBtn.classList.add(PaletteObj.nr);
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';

    // attach events to Btn

    palettePickBtn.addEventListener("click", (e) => {
      libraryclose();

      const paletteIndex = e.target.classList[1];
      initialColors = [];
      savedPalettes[paletteIndex].colors.forEach((color, index) => {
        initialColors.push(color);
        colorDivs[index].style.backgroundColor = color;
        const text = colorDivs[index].children[0];
        text.innerText = color;
        checkTextContrast(color, text);
        updateTextUI(index);
      });
      resetInputs();
    });

    deleteBtn.addEventListener("click", (e) => {
      const item = e.target;

      const colo = item.parentElement;
      colo.classList.add("del");
      colo.addEventListener("transitionend", (e) => {
        colo.remove();
        const paletteIndex = e.target.classList[1];

        removeLocal(PaletteObj, paletteIndex);
      });
    });
    // append to pallete

    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(palettePickBtn);
    palette.appendChild(deleteBtn);
    libraryCont.children[0].appendChild(palette);
  }
}

function savetoLocal(PaletteObj) {
  let localPalettes;

  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }

  localPalettes.push(PaletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
  saveclose();
}

function removeLocal(PaletteObj, paletteIndex) {
  let localPalettes;

  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }

  // localStorage.setItem("palettes", JSON.stringify(localPalettes));

  localPalettes.splice(paletteIndex, 1);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function getlocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const paletteObject = JSON.parse(localStorage.getItem("palettes"));

    // save pallate get reset every time so set

    savedPalettes = [...paletteObject];

    paletteObject.forEach((PaletteObj) => {
      const palette = document.createElement("div");

      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = PaletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");

      PaletteObj.colors.forEach((smallcolors) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallcolors;
        preview.appendChild(smallDiv);
      });

      const palettePickBtn = document.createElement("button");
      palettePickBtn.classList.add("pick-palette-btn");
      palettePickBtn.classList.add(PaletteObj.nr);
      palettePickBtn.innerText = "Select";

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("pick-delete-btn");
      deleteBtn.classList.add(PaletteObj.nr);
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';

      // attach events to Btn

      palettePickBtn.addEventListener("click", (e) => {
        libraryclose();

        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObject[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          text.innerText = color;
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });
      deleteBtn.addEventListener("click", (e) => {
        const item = e.target;

        const colo = item.parentElement;
        colo.classList.add("del");
        colo.addEventListener("transitionend", (e) => {
          colo.remove();
          const paletteIndex = e.target.classList[1];

          removeLocal(PaletteObj, paletteIndex);
        });
      });
      // append to pallete

      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(palettePickBtn);
      palette.appendChild(deleteBtn);
      libraryCont.children[0].appendChild(palette);
    });
  }
}

// library sliders update
function librarySlidersUpdate() {}
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
  libraryPop.classList.remove("expand");
  libraryExpand.classList.remove("active");
  const custom = document.querySelectorAll(".custom-palette");

  custom.forEach((pall) => {
    pall.classList.remove("expand");
  });
}
function libraryexpand() {
  const custom = document.querySelectorAll(".custom-palette");

  if (libraryPop.classList.contains("expand")) {
    libraryPop.classList.remove("expand");
    custom.forEach((pall) => {
      pall.classList.remove("expand");
    });
  } else {
    libraryPop.classList.add("expand");
    custom.forEach((pall) => {
      pall.classList.add("expand");
    });
  }

  if (libraryExpand.classList.contains("active")) {
    libraryExpand.classList.remove("active");
  } else {
    libraryExpand.classList.add("active");
  }
}

function adjus(index) {
  sliderPanel[index].classList.toggle("active");
}
function closeAdj(index) {
  sliderPanel[index].classList.remove("active");
}

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

getlocal();
randomColors();
