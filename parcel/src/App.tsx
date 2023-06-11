import { useCallback, useState } from 'react';
import { Tab } from '@headlessui/react';

import init, { ImageKmeans } from '@zyzle/image-kmeans';
import { Dropzone } from './components/Dropzone';
import { EnginePanel } from './components/EnginePanel';

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

export function App() {
	const [wasmInstance, setWasmInstance] = useState<ImageKmeans>(null);
	const [tabs, setTabs] = useState([
		{ label: 'Wasm (fixed K)', engine: 0, swatches: [] },
		{ label: 'Wasm (derrived K)', engine: 1, swatches: [] },
		{ label: 'JS (danger slow)', engine: 2, swatches: [] },
	]);

	const handleDroppedFile = useCallback(
		(ibm: ImageBitmap) => {
			const makeWasm = async (ibm: ImageBitmap) => {
				await init();
				const canvas = new OffscreenCanvas(ibm.width, ibm.height);
				const ctx = canvas.getContext('2d');
				ctx.canvas.height = ibm.height;
				ctx.canvas.width = ibm.width;
				ctx.drawImage(ibm, 0, 0);

				const wasmInstance = new ImageKmeans(ctx, ibm.width, ibm.height);
				setWasmInstance(wasmInstance);
			};

			makeWasm(ibm);
		},
		[setWasmInstance]
	);

	const doRun = useCallback(
		engine => {
			const doAsyncRun = async engine => {
				let results;
				switch (engine) {
					case 0:
						results = await wasmInstance.with_fixed_k_number(8);
						break;
					case 1:
						results = await wasmInstance.with_derived_k_number();
						break;
					case 2:
						break;
				}
				console.log('RESULTS', results);
				tabs.find(t => t.engine === engine).swatches = results.clusters;
			};
			// const result = wasmInstance.with_fixed_k_number(8);
			// console.log('RESULT', result);
			doAsyncRun(engine);
		},
		[wasmInstance, tabs, setTabs]
	);

	return (
		<main className="min-h-screen grid grid-cols-2 justify-items-center place-content-around place-items-center p-5 gap-5 bg-gradient-to-b from-cyan-300 to-blue-600">
			<div className="max-w-md">
				{/* <h1 className="font-bold text-3xl text-slate-700">Image colours with K-means clustering</h1> */}
				<Dropzone droppedFile={handleDroppedFile} />
			</div>
			<div className="max-w-md rounded-xl bg-white p-3 w-full shadow-md">
				<div className="flex flex-col gap-5">
					<button className="rounded-full text-white bg-blue-500 hover:bg-blue-700 px-5 py-2" onClick={() => onGo(engine)}>
						Go!
					</button>
					{/* <div className="grid grid-cols-4 gap-2 justify-items-stretch content-around">
						{swatches.length
							? swatches.map(s => (
									<div key={s} className="rounded-md bg-slate-500 p-5">
										s
									</div>
							  ))
							: null}
					</div> */}
				</div>
				{/* <Tab.Group>
					<Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
						{tabs.map((tab, idx) => (
							<Tab
								key={`tab-${idx}`}
								className={({ selected }) =>
									classNames(
										'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
										'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
										selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
									)
								}>
								{tab.label}
							</Tab>
						))}
					</Tab.List>
					<Tab.Panels className="mt-2">
						{tabs.map((tab, idx) => (
							<Tab.Panel
								key={`tab-panel-${idx}`}
								className={classNames(
									'rounded-xl bg-white p-3',
									'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
								)}>
								<EnginePanel engine={tab.engine} onGo={doRun} swatches={tab.swatches} />
							</Tab.Panel>
						))}
					</Tab.Panels>
				</Tab.Group> */}
			</div>
		</main>
	);
}
