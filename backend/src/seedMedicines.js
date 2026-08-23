import Medicine from "./models/medicine.model.js";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./lib/db.js";

dotenv.config();

const sampleMedicines = [
    {
        name: "Paracetamol 500mg",
        description: "Pain reliever and fever reducer. Effective for headaches, muscle aches, and reducing fever.",
        price: 12.99,
        quantityAvailable: 150,
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
        category: "Pain Relief",
        manufacturer: "PharmaCorp",
        expiryDate: new Date("2026-12-31"),
        requiresPrescription: false,
        activeIngredient: "Paracetamol",
        dosageForm: "Tablet",
        strength: "500mg",
        inStock: true
    },
    {
        name: "Ibuprofen 400mg",
        description: "Anti-inflammatory pain reliever. Effective for pain, inflammation, and fever reduction.",
        price: 15.50,
        quantityAvailable: 200,
        image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop",
        category: "Pain Relief",
        manufacturer: "MediHealth",
        expiryDate: new Date("2026-11-30"),
        requiresPrescription: false,
        activeIngredient: "Ibuprofen",
        dosageForm: "Tablet",
        strength: "400mg",
        inStock: true
    },
    {
        name: "Vitamin D3 1000 IU",
        description: "Essential vitamin supplement for bone health and immune system support.",
        price: 25.00,
        quantityAvailable: 300,
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
        category: "Vitamins & Supplements",
        manufacturer: "VitaLife",
        expiryDate: new Date("2027-06-30"),
        requiresPrescription: false,
        activeIngredient: "Cholecalciferol",
        dosageForm: "Capsule",
        strength: "1000 IU",
        inStock: true
    },
    {
        name: "Cough Syrup",
        description: "Effective relief for dry and productive coughs. Soothes throat irritation.",
        price: 18.75,
        quantityAvailable: 80,
        image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop",
        category: "Cold & Flu",
        manufacturer: "CoughCare",
        expiryDate: new Date("2027-08-15"),
        requiresPrescription: false,
        activeIngredient: "Dextromethorphan",
        dosageForm: "Syrup",
        strength: "15mg/5ml",
        inStock: true
    },
    {
        name: "Amoxicillin 500mg",
        description: "Antibiotic for bacterial infections. Effective against various bacterial conditions.",
        price: 35.00,
        quantityAvailable: 60,
        image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=300&fit=crop",
        category: "Antibiotics",
        manufacturer: "AntiBio Labs",
        expiryDate: new Date("2027-03-20"),
        requiresPrescription: true,
        activeIngredient: "Amoxicillin",
        dosageForm: "Capsule",
        strength: "500mg",
        inStock: true
    },
    {
        name: "Metformin 500mg",
        description: "Diabetes medication to control blood sugar levels in type 2 diabetes patients.",
        price: 22.50,
        quantityAvailable: 120,
        image: "https://images.unsplash.com/photo-1576671082492-8552e6b7149b?w=400&h=300&fit=crop",
        category: "Diabetes Care",
        manufacturer: "DiaCare",
        expiryDate: new Date("2026-09-10"),
        requiresPrescription: true,
        activeIngredient: "Metformin Hydrochloride",
        dosageForm: "Tablet",
        strength: "500mg",
        inStock: true
    },
    {
        name: "Aspirin 100mg",
        description: "Low-dose aspirin for heart health and blood clot prevention.",
        price: 8.99,
        quantityAvailable: 250,
        image: "https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&h=300&fit=crop",
        category: "Heart & Blood Pressure",
        manufacturer: "CardioHealth",
        expiryDate: new Date("2027-01-15"),
        requiresPrescription: false,
        activeIngredient: "Acetylsalicylic Acid",
        dosageForm: "Tablet",
        strength: "100mg",
        inStock: true
    },
    {
        name: "Vitamin C 1000mg",
        description: "High-strength vitamin C supplement for immune support and antioxidant protection.",
        price: 19.99,
        quantityAvailable: 180,
        image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=300&fit=crop",
        category: "Vitamins & Supplements",
        manufacturer: "ImmunePlus",
        expiryDate: new Date("2027-04-30"),
        requiresPrescription: false,
        activeIngredient: "Ascorbic Acid",
        dosageForm: "Tablet",
        strength: "1000mg",
        inStock: true
    },
    {
        name: "Antihistamine Tablets",
        description: "Relief from allergies, hay fever, and allergic reactions.",
        price: 14.25,
        quantityAvailable: 95,
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
        category: "Other",
        manufacturer: "AllergyFree",
        expiryDate: new Date("2026-07-22"),
        requiresPrescription: false,
        activeIngredient: "Cetirizine",
        dosageForm: "Tablet",
        strength: "10mg",
        inStock: true
    },
    {
        name: "Zinc Supplements",
        description: "Essential mineral supplement for immune function and wound healing.",
        price: 16.80,
        quantityAvailable: 140,
        image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop",
        category: "Vitamins & Supplements",
        manufacturer: "MineralMax",
        expiryDate: new Date("2027-02-28"),
        requiresPrescription: false,
        activeIngredient: "Zinc Gluconate",
        dosageForm: "Tablet",
        strength: "15mg",
        inStock: true
    },
    {
        name: "Throat Lozenges",
        description: "Soothing relief for sore throats and throat irritation.",
        price: 9.50,
        quantityAvailable: 200,
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
        category: "Cold & Flu",
        manufacturer: "ThroatCare",
        expiryDate: new Date("2027-12-31"),
        requiresPrescription: false,
        activeIngredient: "Benzocaine",
        dosageForm: "Other",
        strength: "5mg",
        inStock: true
    },
    {
        name: "Omega-3 Fish Oil",
        description: "Essential fatty acids for heart and brain health support.",
        price: 32.00,
        quantityAvailable: 110,
        image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop",
        category: "Vitamins & Supplements",
        manufacturer: "OceanHealth",
        expiryDate: new Date("2026-10-15"),
        requiresPrescription: false,
        activeIngredient: "EPA/DHA",
        dosageForm: "Capsule",
        strength: "1000mg",
        inStock: true
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing medicines
        await Medicine.deleteMany({});
        console.log("Cleared existing medicines");

        // Insert sample medicines
        await Medicine.insertMany(sampleMedicines);
        console.log("Sample medicines inserted successfully");

        await disconnectDB();
        console.log("Database connection closed");
        
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
