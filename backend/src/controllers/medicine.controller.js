import Medicine from "../models/medicine.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getAllMedicines = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 12 } = req.query;
        
        let query = { inStock: true };
        
        // Add category filter if provided
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Add search filter if provided
        const normalizedSearch = typeof search === 'string' ? search.trim() : '';
        if (normalizedSearch) {
            const searchPattern = escapeRegex(normalizedSearch);
            query.$or = [
                { name: { $regex: searchPattern, $options: 'i' } },
                { category: { $regex: searchPattern, $options: 'i' } },
                { description: { $regex: searchPattern, $options: 'i' } },
                { activeIngredient: { $regex: searchPattern, $options: 'i' } },
                { manufacturer: { $regex: searchPattern, $options: 'i' } }
            ];
        }
        
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        
        const medicines = await Medicine.find(query)
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);
            
        const totalMedicines = await Medicine.countDocuments(query);
        const totalPages = Math.ceil(totalMedicines / limitNumber);
        
        res.status(200).json({
            success: true,
            medicines,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalMedicines,
                hasNext: pageNumber < totalPages,
                hasPrev: pageNumber > 1
            }
        });
    } catch (error) {
        console.error("Error in getAllMedicines controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export const getMedicineById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const medicine = await Medicine.findById(id).select('-__v');
        
        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }
        
        res.status(200).json({
            success: true,
            medicine
        });
    } catch (error) {
        console.error("Error in getMedicineById controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export const getMedicineCategories = async (req, res) => {
    try {
        const categories = await Medicine.distinct('category');
        
        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error("Error in getMedicineCategories controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};
