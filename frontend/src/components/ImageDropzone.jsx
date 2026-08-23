import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_DIMENSION = 1000;

const resizeImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read this image'));
    reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('This image file is not valid'));
        image.onload = () => {
            const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
            const width = Math.round(image.width * scale);
            const height = Math.round(image.height * scale);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.78));
        };
        image.src = reader.result;
    };
    reader.readAsDataURL(file);
});

const ImageDropzone = ({ value, onChange, label = 'Image' }) => {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const processFile = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error('Image must be 5 MB or smaller');
            return;
        }

        setIsProcessing(true);
        try {
            onChange(await resizeImage(file));
            toast.success('Image added');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        processFile(event.dataTransfer.files?.[0]);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div
                onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
                }}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                        processFile(event.target.files?.[0]);
                        event.target.value = '';
                    }}
                    className="sr-only"
                    aria-label={`Choose ${label.toLowerCase()} from computer`}
                />

                {value ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                        <img src={value} alt={`${label} preview`} className="h-32 w-32 rounded-lg object-cover border border-gray-200" />
                        <div className="flex-1 text-center sm:text-left">
                            <p className="font-medium text-gray-900">Image ready</p>
                            <p className="mt-1 text-sm text-gray-500">Drop another image here to replace it.</p>
                            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                                <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                    <Upload className="h-4 w-4" /> Replace
                                </button>
                                <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                                    <Trash2 className="h-4 w-4" /> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button type="button" onClick={() => inputRef.current?.click()} disabled={isProcessing} className="w-full py-5 disabled:opacity-60">
                        <ImagePlus className="mx-auto h-10 w-10 text-blue-500" />
                        <span className="mt-3 block font-semibold text-gray-900">{isProcessing ? 'Preparing image...' : 'Drag an image here'}</span>
                        <span className="mt-1 block text-sm text-gray-500">or click to choose from your PC (max 5 MB)</span>
                    </button>
                )}
            </div>

            <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Or paste an image URL</label>
                <input
                    type="url"
                    value={value?.startsWith('data:') ? '' : value || ''}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
            </div>
        </div>
    );
};

export default ImageDropzone;
