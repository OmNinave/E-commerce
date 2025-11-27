const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const unifiedDbPath = path.join(__dirname, '../db/unified_database.json');

// Mock Data Generators
const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Reyansh', 'Muhammad', 'Rohan', 'Krishna', 'Ishaan', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Kiara', 'Fatima', 'Sana', 'Riya', 'Kavya'];
const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Mishra', 'Joshi', 'Khan', 'Shah', 'Mehta', 'Nair', 'Chopra', 'Malhotra', 'Verma'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Gujarat', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Maharashtra', 'Rajasthan'];
const streets = ['MG Road', 'Station Road', 'Park Street', 'Ring Road', 'Main Street', 'Church Street', 'Temple Road', 'Market Road'];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateIndianPhoneNumber() {
    return '9' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
}

function generateAddress() {
    const cityIndex = Math.floor(Math.random() * cities.length);
    return {
        id: crypto.randomUUID(),
        street: `${Math.floor(Math.random() * 100) + 1}, ${getRandomElement(streets)}`,
        city: cities[cityIndex],
        state: states[cityIndex],
        zipCode: (Math.floor(Math.random() * 900000) + 100000).toString(),
        country: 'India',
        isDefault: Math.random() > 0.8 // 20% chance of being default
    };
}

async function seedData() {
    console.log('🌱 Starting data seeding...');

    let db = { products: [], users: [], orders: [], purchaseHistory: [] };

    if (fs.existsSync(unifiedDbPath)) {
        try {
            db = JSON.parse(fs.readFileSync(unifiedDbPath, 'utf8'));
            console.log('✓ Loaded existing database.');
        } catch (err) {
            console.warn('⚠️ Could not read existing DB, starting fresh.');
        }
    }

    // 1. Seed Users (if fewer than 10)
    if (!db.users) db.users = [];

    const usersNeeded = 10 - db.users.length;
    if (usersNeeded > 0) {
        console.log(`Generating ${usersNeeded} mock users...`);
        const commonPasswordHash = await bcrypt.hash('password123', 10);

        for (let i = 0; i < usersNeeded; i++) {
            const firstName = getRandomElement(firstNames);
            const lastName = getRandomElement(lastNames);
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;

            const user = {
                id: crypto.randomUUID(),
                fullName: `${firstName} ${lastName}`,
                email: email,
                password: commonPasswordHash,
                phone: generateIndianPhoneNumber(),
                role: 'customer',
                registrationDate: new Date().toISOString(),
                addresses: [generateAddress(), generateAddress()]
            };

            // Ensure one default address
            user.addresses[0].isDefault = true;
            user.addresses[1].isDefault = false;

            db.users.push(user);
        }
    } else {
        console.log('✓ Sufficient users already exist.');
    }

    // 2. Validate/Enhance Products
    if (!db.products) db.products = [];

    const productImages = {
        // Lab Equipment
        'microscope': 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80',
        'centrifuge': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80',
        'titrator': 'https://images.unsplash.com/photo-1581093458891-2f6a7f8112d1?w=800&q=80',
        'spectrophotometer': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
        'balance': 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80',
        'evaporator': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
        'oven': 'https://images.unsplash.com/photo-1581093588401-fbb62a02f138?w=800&q=80',
        'autoclave': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
        'pcr': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80',
        'analyzer': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80',
        'incubator': 'https://images.unsplash.com/photo-1581093588401-fbb62a02f138?w=800&q=80',
        'cabinet': 'https://images.unsplash.com/photo-1581093458891-2f6a7f8112d1?w=800&q=80',
        'freezer': 'https://images.unsplash.com/photo-1581093588401-fbb62a02f138?w=800&q=80',
        'shaker': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80',
        'stirrer': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
        'bath': 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80',

        // Generic Lab
        'lab': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
        'medical': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
        'science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',

        // Consumer (Fallback)
        'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
        'default': 'https://images.unsplash.com/photo-1581093458891-2f6a7f8112d1?w=800&q=80'
    };

    db.products.forEach(product => {
        // Always try to update image to ensure we get the new better ones
        // But only if it's a placeholder or we want to force update (optional)
        // For now, let's force update if it matches our new keywords to fix the previous "watch" images

        const nameLower = (product.name || '').toLowerCase();
        let newImage = productImages.default;
        let matchFound = false;

        for (const [key, url] of Object.entries(productImages)) {
            if (nameLower.includes(key)) {
                newImage = url;
                matchFound = true;
                break;
            }
        }

        // If we found a better match, or if the current image is a placeholder, update it
        if (matchFound || !product.image || product.image.includes('placeholder') || product.image.includes('via.placeholder')) {
            product.image = newImage;
        }

        // Ensure price is a number
        if (typeof product.price === 'string') {
            product.price = parseFloat(product.price.replace(/[^0-9.]/g, ''));
        }
    });

    console.log(`✓ Checked and updated ${db.products.length} products.`);

    // 3. Save DB
    fs.writeFileSync(unifiedDbPath, JSON.stringify(db, null, 2));
    console.log('✅ Database seeded successfully!');
    console.log(`   - Total Users: ${db.users.length}`);
    console.log(`   - Total Products: ${db.products.length}`);
}

seedData().catch(console.error);
