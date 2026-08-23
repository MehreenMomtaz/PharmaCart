import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAdminStore } from '../store/useAdminStore';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Package, 
    Search,
    ArrowLeft,
    Filter,
    Eye
} from 'lucide-react';

const AdminMedicines = () => {
    const { authUser } = useAuthStore();
    const { 
        medicines, 
        isLoadingMedicines, 
        isDeletingMedicine,
        fetchMedicines,
        deleteMedicine 
    } = useAdminStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    // Check if user is admin
    if (!authUser || authUser.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT'
        }).format(price);
    };

    const categories = [...new Set(medicines.map(med => med.category))];

    const filteredMedicines = medicines
        .filter(medicine => {
            const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || medicine.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (sortBy === 'price' || sortBy === 'quantityAvailable') {
                aValue = Number(aValue);
                bValue = Number(bValue);
            } else {
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const handleDeleteMedicine = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            await deleteMedicine(id);
        }
    };

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
        if (quantity < 10) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
        return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    };

    if (isLoadingMedicines) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 h-64"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Manage Medicines
                        </h1>
                    </div>
                    <Link
                        to="/admin/medicines/new"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Medicine
                    </Link>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search medicines..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="price">Sort by Price</option>
                            <option value="quantityAvailable">Sort by Stock</option>
                            <option value="category">Sort by Category</option>
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </div>

                {/* Medicines Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMedicines.map((medicine) => {
                        const stockStatus = getStockStatus(medicine.quantityAvailable);
                        
                        return (
                            <div key={medicine._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                                <div className="relative">
                                    <img
                                        src={medicine.image}
                                        alt={medicine.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                            {stockStatus.text}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                        {medicine.name}
                                    </h3>
                                    
                                    <div className="space-y-1 mb-4">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Category:</span> {medicine.category}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Manufacturer:</span> {medicine.manufacturer}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Stock:</span> {medicine.quantityAvailable} units
                                        </p>
                                        <p className="text-lg font-bold text-green-600">
                                            {formatPrice(medicine.price)}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/admin/medicines/${medicine._id}`}
                                            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </Link>
                                        <Link
                                            to={`/admin/medicines/${medicine._id}/edit`}
                                            className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteMedicine(medicine._id, medicine.name)}
                                            disabled={isDeletingMedicine}
                                            className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredMedicines.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No medicines found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || categoryFilter !== 'all' 
                                ? 'Try adjusting your search or filters'
                                : 'Start by adding your first medicine'
                            }
                        </p>
                        <Link
                            to="/admin/medicines/new"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Add First Medicine
                        </Link>
                    </div>
                )}

                {/* Results count */}
                {filteredMedicines.length > 0 && (
                    <div className="mt-8 text-center text-gray-600">
                        Showing {filteredMedicines.length} of {medicines.length} medicines
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMedicines;
