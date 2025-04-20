import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Product, Shop } from '../types/types';
import { ChevronLeft, Star, MapPin, Clock } from 'lucide-react';
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../lib/firebase";
import { listAll } from "firebase/storage";
import { useCart } from '../contexts/CartContext'; // Adjust path if needed
import { useAuth } from '../contexts/AuthContext';


export default function ShopPage() {
    const { shopId } = useParams<{ shopId: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth();

const navigate = useNavigate();

    useEffect(() => {
        const fetchShopAndProducts = async () => {
            try {
                setLoading(true);

                if (shopId) {
                    const shopDoc = await getDoc(doc(db, 'shops', shopId));
                    if (shopDoc.exists()) {
                        setShop({ id: shopDoc.id, ...shopDoc.data() } as Shop);
                    }

                    const productsQuery = query(
                        collection(db, 'products'),
                        where('shopId', '==', shopId),
                        where('available', '==', true)
                    );

                    const productsSnapshot = await getDocs(productsQuery);
                    const productList: Product[] = [];

                    for (const docSnap of productsSnapshot.docs) {
                        const productData = { id: docSnap.id, ...docSnap.data() } as Product;

                        try {
                            const folderRef = ref(storage, `products/${shopId}`);
                            const listResult = await listAll(folderRef);

                            if (listResult.items.length > 0) {
                                const imageRef = listResult.items[0]; // get first image
                                const imageUrl = await getDownloadURL(imageRef);
                                productData.imageUrl = imageUrl;
                            } else {
                                console.warn("No images found for product:", productData.id);
                                productData.imageUrl = "";
                            }
                        } catch (err) {
                            console.warn("Error fetching image for:", productData.id, err);
                            productData.imageUrl = ""; // fallback
                        }

                        productList.push(productData);
                    }

                    setProducts(productList);
                }
            } catch (error) {
                console.error('Error fetching shop data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShopAndProducts();
    }, [shopId]);
    useEffect(() => {
        if (user && user.role === 'shopkeeper' && user.shopId === shopId) {
            navigate('/shop/dashboard');
        }
    }, [user, shopId, navigate]);
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Shop Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <Link to="/" className="inline-flex items-center space-x-2 text-white hover:text-white/80 mb-4">
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back to Home</span>
                    </Link>

                    {shop && (
                        <div className="flex flex-col md:flex-row md:items-center gap-6 mt-4">
                            <div className="w-24 h-24 rounded-xl overflow-hidden">
                                <img
                                    src={shop.imageUrl}
                                    alt={shop.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                    <h1 className="text-3xl font-bold">{shop.name}</h1>
                                    {shop.rating && (
                                        <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded">
                                            <span>{shop.rating}</span>
                                            <Star className="w-4 h-4 fill-current" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-white/80 mt-1">{shop.cuisine}</div>
                                <div className="flex items-center space-x-4 mt-2">
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{shop.location}</span>
                                    </div>
                                    {shop.deliveryTime && (
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{shop.deliveryTime}</span>
                                        </div>
                                    )}
                                </div>
                                {shop.offers && shop.offers.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {shop.offers.map((offer, index) => (
                                            <div key={index} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                                {offer}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Products */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <h2 className="text-2xl font-bold mb-6">Products from {shop?.name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="relative">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold">{product.name}</h3>
                                            {product.rating && (
                                                <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded">
                                                    <span>{product.rating}</span>
                                                    <Star className="w-4 h-4 fill-current" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-gray-600 text-sm mb-2">{product.description}</div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="font-semibold">₹{product.price}</div>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await addToCart({
                                                            productId: product.id,
                                                            shopId: shopId || '',
                                                            name: product.name,
                                                            price: product.price,
                                                            quantity: 1,
                                                            imageUrl: product.imageUrl,
                                                        });
                                                        console.log('Added to cart:', product.name);
                                                        navigate('/cart');
                                                    } catch (error) {
                                                        console.error('Error adding to cart:', error);
                                                    }
                                                }}
                                                
                                                className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="text-gray-500 text-lg mb-2">No products available from this shop</div>
                        <Link to="/" className="text-blue-600 hover:underline">
                            Return to home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}