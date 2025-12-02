const { db } = require('./database');

console.log('🚀 Populating Product Data (Images, Features, Specs)...');

// Image collections by category/keyword
const imageCollections = {
    microscope: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581093458791-9f302e683800?auto=format&fit=crop&q=80&w=800'
    ],
    centrifuge: [
        'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1516681100942-77d8e7f9dd97?auto=format&fit=crop&q=80&w=800'
    ],
    spectrophotometer: [
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800'
    ],
    incubator: [
        'https://images.unsplash.com/photo-1581093458791-9f302e683800?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
    ],
    pipette: [
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=800'
    ],
    balance: [
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581092162384-8987c1d64726?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800'
    ],
    stirrer: [
        'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800'
    ],
    glassware: [
        'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1605618525559-4178d2499d3d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581093458791-9f302e683800?auto=format&fit=crop&q=80&w=800'
    ],
    safety: [
        'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1584036561566-b93a945c3bf0?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800'
    ],
    default: [
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1581093458791-9f302e683800?auto=format&fit=crop&q=80&w=800'
    ]
};

// Helper to get images based on product name
function getImagesForProduct(name) {
    const lowerName = name.toLowerCase();
    for (const [key, images] of Object.entries(imageCollections)) {
        if (lowerName.includes(key)) {
            return images;
        }
    }
    return imageCollections.default;
}

// Helper to generate features and specs
function getDataForProduct(name, category) {
    const lowerName = name.toLowerCase();

    let features = [
        "High-precision components for accurate results",
        "Durable construction for long-term use",
        "Easy-to-read digital display",
        "Ergonomic design for user comfort",
        "ISO 9001 certified manufacturing"
    ];

    let specs = {
        "Power Supply": "220V / 50Hz",
        "Warranty": "3 Years",
        "Dimensions": "45 x 30 x 25 cm",
        "Weight": "5.2 kg",
        "Material": "Stainless Steel / ABS Plastic"
    };

    if (lowerName.includes('microscope')) {
        features = [
            "Infinity-corrected optical system",
            "Wide-field eyepieces (10x/22mm)",
            "LED illumination with intensity control",
            "Coaxial coarse and fine focusing",
            "Anti-fungal coating on optics"
        ];
        specs = {
            ...specs,
            "Magnification": "40x - 1000x",
            "Optical System": "Infinity Corrected",
            "Illumination": "3W LED",
            "Objective Lenses": "4x, 10x, 40x, 100x (Oil)"
        };
    } else if (lowerName.includes('centrifuge')) {
        features = [
            "Brushless DC motor for maintenance-free life",
            "Microprocessor controlled with digital display",
            "Automatic imbalance detection",
            "Safety lid interlock system",
            "Low noise operation (< 60 dB)"
        ];
        specs = {
            ...specs,
            "Max Speed": "15,000 RPM",
            "Max RCF": "21,000 x g",
            "Timer": "1 min to 99 min",
            "Rotor Capacity": "24 x 1.5/2.0 ml"
        };
    } else if (lowerName.includes('spectrophotometer')) {
        features = [
            "Double beam optical system",
            "Large LCD display",
            "USB port for data transfer",
            "Automatic wavelength calibration",
            "Wide wavelength range"
        ];
        specs = {
            ...specs,
            "Wavelength Range": "190 - 1100 nm",
            "Bandwidth": "1 nm",
            "Photometric Accuracy": "±0.3% T",
            "Stray Light": "< 0.05% T"
        };
    } else if (lowerName.includes('incubator')) {
        features = [
            "PID microprocessor temperature control",
            "Stainless steel interior",
            "Double door design (inner glass door)",
            "Over-temperature protection",
            "Uniform temperature distribution"
        ];
        specs = {
            ...specs,
            "Temp Range": "Ambient +5°C to 70°C",
            "Temp Accuracy": "±0.1°C",
            "Capacity": "50 Liters",
            "Shelves": "2 (Adjustable)"
        };
    } else if (lowerName.includes('balance') || lowerName.includes('scale')) {
        features = [
            "High precision electromagnetic force sensor",
            "Internal calibration system",
            "LCD display with backlight",
            "Multiple weighing units (g, mg, ct, oz)",
            "RS232 interface"
        ];
        specs = {
            ...specs,
            "Capacity": "220g",
            "Readability": "0.0001g",
            "Pan Size": "90mm dia",
            "Stabilization Time": "< 3 seconds"
        };
    }

    return { features, specs };
}

try {
    const products = db.prepare('SELECT * FROM products').all();
    console.log(`Found ${products.length} products to update.`);

    const insertImage = db.prepare(`
        INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
        VALUES (?, ?, ?, ?, ?)
    `);

    const updateProduct = db.prepare(`
        UPDATE products 
        SET features = ?, specifications = ?, shipping_info = ?
        WHERE id = ?
    `);

    const deleteImages = db.prepare('DELETE FROM product_images WHERE product_id = ?');

    db.transaction(() => {
        for (const product of products) {
            console.log(`Updating product: ${product.name}`);

            // 1. Update Images
            // First, clear existing images to avoid duplicates/mess
            deleteImages.run(product.id);

            const images = getImagesForProduct(product.name);
            images.forEach((url, index) => {
                insertImage.run(
                    product.id,
                    url,
                    `${product.name} - View ${index + 1}`,
                    index === 0 ? 1 : 0, // First image is primary
                    index
                );
            });

            // 2. Update Features & Specs
            const { features, specs } = getDataForProduct(product.name, product.category_id);

            const shippingInfo = {
                "Dispatch": "Within 24-48 Hours",
                "Delivery Time": "3-5 Business Days",
                "Shipping Method": "Expedited Air/Ground",
                "International Shipping": "Available upon request"
            };

            updateProduct.run(
                JSON.stringify(features),
                JSON.stringify(specs),
                JSON.stringify(shippingInfo),
                product.id
            );
        }
    })();

    console.log('✅ Successfully populated product data!');

} catch (error) {
    console.error('❌ Error updating product data:', error);
}
