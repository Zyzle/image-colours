import { ImageKmeans } from "@zyzle/image-kmeans";

const dropZone = document.getElementById("drop-zone");
const plot = document.getElementById("plot");

const layout = {
  autosize: true,
  scene: {
    aspectratio: {
      x: 1,
      y: 1,
      z: 1,
    },
    xaxis: {
      type: "linear",
      zeroline: false,
      title: "Red",
    },
    yaxis: {
      type: "linear",
      zeroline: false,
      title: "Green",
    },
    zaxis: {
      type: "linear",
      zeroline: false,
      title: "Blue",
    },
  },
  title: "Image colour clustering",
};

const config = { responsive: true };

function unpack(rows, key) {
  return rows.map((r) => r[key]);
}

dropZone.addEventListener("drop", async (e) => {
  e.preventDefault();

  if (e.dataTransfer.items && e.dataTransfer.items[0].kind === "file") {
    const file = e.dataTransfer.items[0].getAsFile();
    const output = document.getElementById("image-display");
    output.src = URL.createObjectURL(file);
  }
});

/*dropZone.addEventListener("drop", async (e) => {
  e.preventDefault();

  // const start = Date.now();

  if (e.dataTransfer.items) {
    if (e.dataTransfer.items[0].kind === "file") {
      const file = e.dataTransfer.items[0].getAsFile();
      const output = document.getElementById("image-display");
      output.src = URL.createObjectURL(file);

      createImageBitmap(file).then((ibm) => {
        let ctx;

        console.time("finding canvas element");
        if (typeof OffscreenCanvasRenderingContext === "function") {
          const canvas = new OffscreenCanvas(ibm.width, ibm.height);
          ctx = canvas.getContext("2d");
        } else {
          const canvas = document.createElement("canvas");
          ctx = canvas.getContext("2d");
          ctx.canvas.height = ibm.height;
          ctx.canvas.width = ibm.width;
        }
        console.timeEnd("finding canvas element");

        console.time("drawing image");
        ctx.drawImage(ibm, 0, 0);
        console.timeEnd("drawing image");

        // const wasmStart = Date.now();
        // const wasmInstance = new ImageKmeans(ctx, ibm.width, ibm.height);
        // // const wasmResult = wasmInstance.with_fixed_k_number(4);
        // const otherResult = wasmInstance.with_derived_k_number();
        // const wasmEnd = Date.now();

        // const wasmSwatches = document.getElementById("wasm-swatches");
        // const wasmTime = document.getElementById("wasm-time");
        // wasmTime.textContent = `${wasmEnd - wasmStart}ms`;

        // wasmSwatches.textContent = "";

        // for (let i = 0; i < wasmResult.length; i++) {
        //   let swatch = document.createElement("span");

        //   const color = document.createTextNode(wasmResult[i]);
        //   swatch.appendChild(color);
        //   swatch.classList.add("p-2");
        //   swatch.classList.add("mb-2");
        //   swatch.style.backgroundColor = wasmResult[i];

        //   wasmSwatches.appendChild(swatch);
        // }

        // const wasmDerrived = document.getElementById("wasm-derrived");
        // wasmDerrived.textContent = "";
        // console.log("other", otherResult);

        // for (let i = 0; i < otherResult.length; i++) {
        //   let swatch = document.createElement("span");

        //   const color = document.createTextNode(otherResult[i]);
        //   swatch.appendChild(color);
        //   swatch.classList.add("p-2");
        //   swatch.classList.add("mb-2");
        //   swatch.style.backgroundColor = otherResult[i];

        //   wasmDerrived.appendChild(swatch);
        // }

        // const jsStart = Date.now();
        // const jsResult = jsFindColors(ctx, ibm.width, ibm.height);
        // const jsEnd = Date.now();

        // const jsSwatches = document.getElementById("js-swatches");
        // const jsTime = document.getElementById("js-time");
        // jsTime.textContent = `${jsEnd - jsStart}ms`;
        // jsSwatches.textContent = "";

        // for (let i = 0; i < jsResult.length; i++) {
        //   let swatch = document.createElement("span");

        //   const color = document.createTextNode(jsResult[i]);
        //   swatch.appendChild(color);
        //   swatch.classList.add("p-2");
        //   swatch.classList.add("mb-2");
        //   swatch.style.backgroundColor = jsResult[i];

        //   jsSwatches.appendChild(swatch);
        // }

        // const end = Date.now();

        // console.log(`Time taken: ${end - start}ms`);

        // // PLOT DATA

        // const plotData = [
        // 	{
        // 		x: unpack(colorData, "r"),
        // 		y: unpack(colorData, "g"),
        // 		z: unpack(colorData, "b"),
        // 		mode: "markers",
        // 		type: "scatter3d",
        // 		marker: {
        // 			color: colorData.map((c) => `rgb(${c.r}, ${c.g}, ${c.b})`),
        // 			size: 2,
        // 		},
        // 	},
        // ];

        // Plotly.newPlot(plot, plotData, layout, config);

        // // END PLOT DATA
      });
    }
  }
});*/

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

function calcEuclideanDist(p, q) {
  return Math.sqrt(
    Math.pow(p.r - q.r, 2) + Math.pow(p.g - q.g, 2) + Math.pow(p.b - q.b, 2)
  );
}

function calcNewClusters(kClusters, colorData) {
  const clusteredData = colorData.reduce(
    (prev, curr) => {
      const distances = kClusters.map((k) => calcEuclideanDist(k, curr));
      const minDistance = distances.reduce((a, b) => Math.min(a, b), Infinity);
      const selectedK = distances.findIndex((e) => e === minDistance);
      prev[selectedK] = [...prev[selectedK], curr];
      return prev;
    },
    Array.from({ length: 8 }, () => [])
  );

  const newKs = clusteredData.map((colors) => {
    let r = 0;
    let g = 0;
    let b = 0;

    colors.forEach((color) => {
      r += color.r;
      g += color.g;
      b += color.b;
    });

    return {
      r: Math.round(r / colors.length),
      g: Math.round(g / colors.length),
      b: Math.round(b / colors.length),
    };
  });

  return newKs;
}

function jsFindColors(ctx, imageWidth, imageHeight) {
  console.time("Build color data");
  const imageData = ctx.getImageData(0, 0, imageWidth, imageHeight).data;

  let colorData = [];

  for (let i = 0; i < imageData.length; i += 4) {
    const colStr = [imageData[i], imageData[i + 1], imageData[i + 2]].join(",");

    colorData.push(colStr);
  }

  colorData = [...new Set(colorData)];

  colorData = colorData.map((v) => {
    const rgb = v.split(",");
    return {
      r: parseInt(rgb[0]),
      g: parseInt(rgb[1]),
      b: parseInt(rgb[2]),
    };
  });

  console.timeEnd("Build color data");

  let kClusters = Array.from({ length: 8 }, () => {
    return colorData[Math.floor(Math.random() * colorData.length)];
  });

  let iterations = 0;
  let distanceShift = 0;
  let newClusters = [];

  do {
    distanceShift = 0;
    console.time("Calc new clusters");
    newClusters = calcNewClusters(kClusters, colorData);
    console.timeEnd("Calc new clusters");

    newClusters.forEach((v, i) => {
      distanceShift += calcEuclideanDist(v, kClusters[i]);
    });

    distanceShift = distanceShift / newClusters.length;

    kClusters = newClusters;
    iterations += 1;
  } while (distanceShift >= 5 && iterations < 10);

  return kClusters.map(
    (k) =>
      `#${k.r.toString(16).padStart(2, "0")}${k.g
        .toString(16)
        .padStart(2, "0")}${k.b.toString(16).padStart(2, "0")}`
  );
}
