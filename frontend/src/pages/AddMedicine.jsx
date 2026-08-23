import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAdminStore } from '../store/useAdminStore';
import { ArrowLeft, Save, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageDropzone from '../components/ImageDropzone';

const AddMedicine = () => {
    const { createMedicine, isCreatingMedicine, medicines, updateMedicine, isUpdatingMedicine, fetchMedicines } = useAdminStore();
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditing = Boolean(id);
    const currentMedicine = isEditing ? medicines.find(m => m._id === id) : null;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        costPrice: '',
        quantityAvailable: '',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=400&fit=crop&crop=center', // Default medicine image
        category: '',
        manufacturer: '',
        requiresPrescription: false,
        activeIngredient: '',
        dosage: '',
        sideEffects: '',
        warnings: ''
    });

    const categories = [
        'Pain Relief',
        'Antibiotics',
        'Vitamins & Supplements',
        'Heart & Blood Pressure',
        'Diabetes Care',
        'Cold & Flu',
        'Digestive Health',
        'Skin Care',
        'Eye Care',
        'Women\'s Health',
        'Men\'s Health',
        'Child Care',
        'Mental Health',
        'Respiratory',
        'Other'
    ];

    useEffect(() => {
        if (isEditing) {
            fetchMedicines();
        }
    }, [isEditing, fetchMedicines]);

    useEffect(() => {
        if (isEditing && currentMedicine) {
            setFormData({
                name: currentMedicine.name || '',
                description: currentMedicine.description || '',
                price: currentMedicine.price?.toString() || '',
                costPrice: currentMedicine.costPrice?.toString() || '',
                quantityAvailable: currentMedicine.quantityAvailable?.toString() || '',
                image: currentMedicine.image || 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=400&fit=crop&crop=center',
                category: currentMedicine.category || '',
                manufacturer: currentMedicine.manufacturer || '',
                requiresPrescription: currentMedicine.requiresPrescription || false,
                activeIngredient: currentMedicine.activeIngredient || '',
                dosage: currentMedicine.dosage || '',
                sideEffects: currentMedicine.sideEffects || '',
                warnings: currentMedicine.warnings || ''
            });
        }
    }, [isEditing, currentMedicine]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const sampleImages = [
        'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=400&fit=crop&crop=center', // Pills
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center', // Medicine bottles
        'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop&crop=center', // Capsules
        'https://images.unsplash.com/photo-1585435557343-3b092031d884?w=400&h=400&fit=crop&crop=center', // Tablets
        'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=400&fit=crop&crop=center', // Syrup
        'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop&crop=center'  // Medical supplies
    ];

    const selectSampleImage = (imageUrl) => {
        setFormData(prev => ({
            ...prev,
            image: imageUrl
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        const requiredFields = ['name', 'description', 'price', 'quantityAvailable', 'category', 'manufacturer'];
        for (let field of requiredFields) {
            if (!formData[field]) {
                toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
                return;
            }
        }

        // Validate numeric fields
        if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            toast.error('Price must be a valid positive number');
            return;
        }

        if (formData.costPrice && (isNaN(formData.costPrice) || parseFloat(formData.costPrice) < 0)) {
            toast.error('Cost price must be a valid non-negative number');
            return;
        }

        if (isNaN(formData.quantityAvailable) || parseInt(formData.quantityAvailable) < 0) {
            toast.error('Quantity must be a valid non-negative number');
            return;
        }

        try {
            const medicineData = {
                ...formData,
                price: parseFloat(formData.price),
                costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
                quantityAvailable: parseInt(formData.quantityAvailable)
            };

            if (isEditing) {
                await updateMedicine(id, medicineData);
                toast.success('Medicine updated successfully!');
            } else {
                await createMedicine(medicineData);
                toast.success('Medicine added successfully!');
            }
            navigate('/admin/medicines');
        } catch {
            // Error is handled in the store
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/admin/medicines"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Medicines
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {isEditing ? 'Edit Medicine' : 'Add New Medicine'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="md:col-span-2">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Basic Information
                            </h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Medicine Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price (BDT) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity Available *
                            </label>
                            <input
                                type="number"
                                name="quantityAvailable"
                                value={formData.quantityAvailable}
                                onChange={handleInputChange}
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Purchase Cost (BDT)
                            </label>
                            <input
                                type="number"
                                name="costPrice"
                                value={formData.costPrice}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                placeholder="Used for exact profit reporting"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Manufacturer *
                            </label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <ImageDropzone
                                label="Medicine image"
                                value={formData.image}
                                onChange={(image) => setFormData((previous) => ({ ...previous, image }))}
                            />
                            
                            {/* Sample Images */}
                            <div className="mt-3">
                                <p className="text-sm text-gray-600 mb-2">Or choose from sample images:</p>
                                <div className="grid grid-cols-6 gap-2">
                                    {sampleImages.map((imageUrl, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => selectSampleImage(imageUrl)}
                                            className={`w-12 h-12 rounded-lg border-2 overflow-hidden hover:border-blue-500 transition-colors ${
                                                formData.image === imageUrl ? 'border-blue-500' : 'border-gray-200'
                                            }`}
                                        >
                                            <img
                                                src={imageUrl}
                                                alt={`Sample ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Medical Information */}
                        <div className="md:col-span-2 mt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Medical Information
                            </h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Active Ingredient
                            </label>
                            <input
                                type="text"
                                name="activeIngredient"
                                value={formData.activeIngredient}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dosage
                            </label>
                            <input
                                type="text"
                                name="dosage"
                                value={formData.dosage}
                                onChange={handleInputChange}
                                placeholder="e.g., 500mg twice daily"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Side Effects
                            </label>
                            <textarea
                                name="sideEffects"
                                value={formData.sideEffects}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="List potential side effects..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Warnings
                            </label>
                            <textarea
                                name="warnings"
                                value={formData.warnings}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Important warnings and precautions..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="requiresPrescription"
                                    checked={formData.requiresPrescription}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Requires Prescription
                                </span>
                            </label>
                        </div>
                    </div>


                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={isCreatingMedicine || isUpdatingMedicine}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg flex items-center justify-center gap-2"
                        >
                            {(isCreatingMedicine || isUpdatingMedicine) ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    {isEditing ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {isEditing ? 'Update Medicine' : 'Add Medicine'}
                                </>
                            )}
                        </button>
                        <Link
                            to="/admin/medicines"
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMedicine;
