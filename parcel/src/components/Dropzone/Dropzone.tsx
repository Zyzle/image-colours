import { DragEventHandler, FC, useCallback, useEffect, useRef, useState } from 'react';

export type DropzoneProps = {
	droppedFile: (ibm: ImageBitmap) => void;
};

const Dropzone: FC<DropzoneProps> = ({ droppedFile }) => {
	const imgRef = useRef(null);
	const [file, setFile] = useState(null);

	const handleDrop: DragEventHandler<HTMLDivElement> = useCallback(
		async e => {
			e.preventDefault();

			if (e.dataTransfer.items && e.dataTransfer.items[0].kind === 'file') {
				const file = e.dataTransfer.items[0].getAsFile();
				setFile(file);
				const ibm = await createImageBitmap(file);
				droppedFile(ibm);
			}
		},
		[droppedFile, setFile]
	);

	const handleDragover: DragEventHandler<HTMLDivElement> = useCallback(e => e.preventDefault(), []);

	useEffect(() => {
		if (imgRef.current && file) {
			imgRef.current.src = URL.createObjectURL(file);
		}
	}, [imgRef, file]);

	return (
		<div className="max-w-md overflow-hidden rounded-xl bg-white shadow-md">
			{file && <img ref={imgRef} id="image-display" src="" alt="dropped image" className="h-auto w-full" />}
			<div className="p-5">
				<div
					id="drop-zone"
					onDrop={handleDrop}
					onDragOver={handleDragover}
					className="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center rounded-xl border-2 border-dashed border-blue-400 bg-white p-6 text-center">
					<h2 className="mt-4 text-xl font-medium text-gray-700 tracking-wide">Drop File</h2>
					<p className="mt-2 text-gray-500 tracking-wide">Drop an image into the box to analyze</p>
				</div>
			</div>
		</div>
	);
};

export default Dropzone;
