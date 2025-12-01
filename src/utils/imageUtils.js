/**
 * Utility to get product images with smart fallbacks
 */
export const getProductImage = (product) => {
    if (!product) return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80';

    // If product has a valid image URL, use it
    if (product.image && product.image !== 'placeholder.jpg' && product.image.startsWith('http')) {
        return product.image;
    }

    const name = (product.name || '').toLowerCase();

    // Lab Equipment Images (Unsplash)
    if (name.includes('microscope')) return 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80';
    if (name.includes('centrifuge') || name.includes('evaporator')) return 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80';
    if (name.includes('incubator') || name.includes('oven')) return 'https://images.unsplash.com/photo-1632053001855-4529cf36f3ac?auto=format&fit=crop&w=600&q=80';
    if (name.includes('refrigerator') || name.includes('freezer')) return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80';
    if (name.includes('balance') || name.includes('scale')) return 'https://images.unsplash.com/photo-1610337673044-69c3113ac18e?auto=format&fit=crop&w=600&q=80';
    if (name.includes('pipette')) return 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80';
    if (name.includes('safety') || name.includes('goggle') || name.includes('glasses')) return 'https://images.unsplash.com/photo-1581093458791-9d42e3c4e1e4?auto=format&fit=crop&w=600&q=80';
    if (name.includes('coat') || name.includes('apron')) return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80';
    if (name.includes('flask') || name.includes('beaker') || name.includes('tube')) return 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80';

    // Default Lab Background
    return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80';
};
