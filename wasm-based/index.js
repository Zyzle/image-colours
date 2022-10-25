import * as wasm from '@zyzle/image-kmeans';

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

			createImageBitmap(file).then((ibm) => {
				let ctx;

				console.time('finding canvas element');
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

				console.time('drawing image');
				ctx.drawImage(ibm, 0, 0);
				console.timeEnd("drawing image");

				const result = wasm.find_colors(ctx, ibm.width, ibm.height);

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
});

dropZone.addEventListener('dragover', e => {
	e.preventDefault();
});
