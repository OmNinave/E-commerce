// Fallback static products for offline mode
export const products = [
    {
        id: 1,
        name: 'Laboratory Microscope',
        model: 'LAB-MICRO-001',
        category: 'Laboratory Equipment',
        price: 15000,
        selling_price: 15000,
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
        description: 'High-quality laboratory microscope for research and education',
        stock_quantity: 10
    },
    {
        id: 2,
        name: 'Safety Goggles',
        model: 'SAFE-GOG-001',
        category: 'Safety Equipment',
        price: 500,
        selling_price: 500,
        image: 'https://images.unsplash.com/photo-1581093458791-9d42e3c4e1e4?w=400',
        description: 'Protective safety goggles for laboratory use',
        stock_quantity: 50
    },
    {
        id: 3,
        name: 'Lab Coat',
        model: 'LAB-COAT-001',
        category: 'Safety Equipment',
        price: 800,
        selling_price: 800,
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
        description: 'Professional laboratory coat',
        stock_quantity: 30
    }
];

export default products;
