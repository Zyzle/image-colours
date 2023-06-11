import { FC, useEffect, useRef } from 'react';

// import init, { ImageKmeans } from '@zyzle/image-kmeans';

export type EnginePanelProps = {
	engine: number;
	swatches: string[];
	onGo: (engine: number) => void;
};

const EnginePanel: FC<EnginePanelProps> = ({ engine, swatches = [], onGo }) => {
	// const wasmURL = new URL('../../../node_modules/@zyzle/image-kmeans/image_kmeans_bg.wasm', import.meta.url);

	// const wasmModule = WebAssembly.instantiateStreaming(fetch(wasmURL)).then(obj => {
	// 	console.log('obj', obj);
	// 	return obj.instance.exports;
	// });

	// wasmModule.then(m => console.log(m));

	// const canvasRef = useRef();

	// useEffect(() => {
	// 	const doWasm = async () => {
	// 		await init();
	// 		if (typeof OffscreenCanvasRenderingContext2D === 'function') {
	// 			// ImageKmeans.init();
	// 			console.log(ImageKmeans);
	// 			const canvas = new OffscreenCanvas(100, 100);
	// 			const ctx = canvas.getContext('2d');
	// 			const kmeans = new ImageKmeans(ctx as unknown as CanvasRenderingContext2D, 100, 100);
	// 			console.log('kmeans', kmeans);
	// 		}
	// 	};

	// 	doWasm();
	// }, [canvasRef]);

	return (
		<div className="flex flex-col gap-5">
			<button className="rounded-full text-white bg-blue-500 hover:bg-blue-700 px-5 py-2" onClick={() => onGo(engine)}>
				Go!
			</button>
			<div className="grid grid-cols-4 gap-2 justify-items-stretch content-around">
				{swatches.length
					? swatches.map(s => (
							<div key={s} className="rounded-md bg-slate-500 p-5">
								s
							</div>
					  ))
					: null}
				{/* <canvas ref={canvasRef} /> */}
			</div>
		</div>
	);
};

export default EnginePanel;
