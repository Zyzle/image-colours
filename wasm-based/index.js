import * as wasm from 'colors-wasm';

const dropZone = document.getElementById('drop-zone');
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

dropZone.addEventListener('drop', e => {
	e.preventDefault();

	const start = Date.now();

	if (e.dataTransfer.items) {
		if (e.dataTransfer.items[0].kind === "file") {
			const file = e.dataTransfer.items[0].getAsFile();
			const output = document.getElementById("image-display");
			output.src = URL.createObjectURL(file);

			console.time('Build color data');

			createImageBitmap(file).then((ibm) => {
				let ctx;

				if (typeof OffscreenCanvasRenderingContext === "function") {
					const canvas = new OffscreenCanvas(ibm.width, ibm.height);
					ctx = canvas.getContext("2d");
				} else {
					const canvas = document.createElement("canvas");
					ctx = canvas.getContext("2d");
					ctx.canvas.height = ibm.height;
					ctx.canvas.width = ibm.width;
				}

				ctx.drawImage(ibm, 0, 0);

				const imageData = ctx.getImageData(0, 0, ibm.width, ibm.height).data;

				let colorData = [];

				for (let i = 0; i < imageData.length; i += 4) {
					const colStr = [
						imageData[i],
						imageData[i + 1],
						imageData[i + 2],
					].join(",");

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

				console.timeEnd('Build color data');

				let kClusters = Array.from({ length: 8 }, () => {
					return colorData[Math.floor(Math.random() * colorData.length)];
				});

				const result = wasm.find_colors(colorData, kClusters);

				const swatches = document.getElementById("swatches");
				swatches.textContent = "";

				for (let i = 0; i < result.length; i++) {
					let swatch = document.createElement("span");

					const color = document.createTextNode(result[i]);
					swatch.appendChild(color);
					swatch.classList.add("p-2");
					swatch.classList.add("mb-2");
					swatch.style.backgroundColor = result[i];

					swatches.appendChild(swatch);
				}

				const end = Date.now();

				console.log(`Time taken: ${end - start}ms`);

				// PLOT DATA

				const plotData = [
					{
						x: unpack(colorData, "r"),
						y: unpack(colorData, "g"),
						z: unpack(colorData, "b"),
						mode: "markers",
						type: "scatter3d",
						marker: {
							color: colorData.map((c) => `rgb(${c.r}, ${c.g}, ${c.b})`),
							size: 2,
						},
					},
				];

				Plotly.newPlot(plot, plotData, layout, config);

				// END PLOT DATA
			});
		}
	}
});

dropZone.addEventListener('dragover', e => {
	e.preventDefault();
});
