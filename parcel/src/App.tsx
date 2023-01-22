import { useCallback, useState } from 'react';
import { Dropzone } from './components/Dropzone';
import { Tab } from '@headlessui/react';
import { EnginePanel } from './components/EnginePanel';

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

export function App() {
	const handleDroppedFile = useCallback((ibm: ImageBitmap) => {
		console.log('FILE IS', ibm);
	}, []);

	let [tabs] = useState([
		{ label: 'Wasm (fixed K)', engine: 'wasm-fixed' },
		{ label: 'Wasm (derrived K)', engine: 'wasm-dyn' },
		{ label: 'JS (danger slow)', engine: 'js' },
	]);

	return (
		<main className="h-screen flex flex-col items-center p-5 gap-5 bg-gradient-to-b from-cyan-300 to-blue-600">
			<h1 className="font-bold text-3xl text-slate-700">Image colours with K-means clustering</h1>
			<Dropzone droppedFile={handleDroppedFile} />
			<div className="w-full max-w-md">
				<Tab.Group>
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
								<EnginePanel engine={tab.engine} />
							</Tab.Panel>
						))}
					</Tab.Panels>
				</Tab.Group>
			</div>
		</main>
	);
}
