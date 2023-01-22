import { FC } from 'react';

export type EnginePanelProps = {
	engine: any;
};

const swatches = [1, 2, 3, 4, 5, 6, 7, 8];

const EnginePanel: FC<EnginePanelProps> = ({ engine }) => {
	const wasmURL = new URL('../../../node_modules/@zyzle/image-kmeans/image_kmeans_bg.wasm', import.meta.url);

	const wasmModule = WebAssembly.instantiateStreaming(fetch(wasmURL)).then(obj => {
		console.log('obj', obj);
		return obj.instance.exports;
	});

	wasmModule.then(m => console.log(m));

	return (
		<div className="flex flex-col gap-5">
			<button className="rounded-full text-white bg-blue-500 hover:bg-blue-700 px-5 py-2">Go!</button>
			<div className="flex flex-row flex-wrap gap-2">
				{swatches.map(s => (
					<div key={s} className="rounded-sm bg-slate-500 p-5">
						#123456
					</div>
				))}
			</div>
		</div>
	);
};

export default EnginePanel;
