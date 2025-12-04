import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/utils/api';
import { ArrowRight, ShoppingCart, Package } from 'lucide-react';

const ProductDetailPage = ({ user, setUser, addToCart }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await api.getProduct(id);
      setProduct(response.data);
    } catch (error) {
      toast.error('שגיאה בטעינת המוצר');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} נוסף לעגלה`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!product) return null;

  const allImages = [product.image_url, ...product.images];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Relax RP</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => navigate('/products')}
            >
              <ArrowRight className="ml-2" size={18} />
              חזרה למוצרים
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div
                className="w-full h-96 bg-cover bg-center rounded-2xl mb-4"
                style={{ backgroundImage: `url(${allImages[selectedImage]})` }}
                data-testid="product-main-image"
              ></div>
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((img, index) => (
                    <div
                      key={index}
                      data-testid={`product-thumbnail-${index}`}
                      className={`w-20 h-20 bg-cover bg-center rounded-lg cursor-pointer border-2 ${
                        selectedImage === index ? 'border-purple-500' : 'border-white/10'
                      }`}
                      style={{ backgroundImage: `url(${img})` }}
                      onClick={() => setSelectedImage(index)}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block mb-4">
                {product.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="product-name">{product.name}</h1>
              <p className="text-gray-400 text-lg mb-6" data-testid="product-description">{product.description}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent" data-testid="product-price">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-4">
                <Button
                  data-testid="add-to-cart-button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 py-6 text-lg"
                >
                  <ShoppingCart className="ml-2" size={20} />
                  הוסף לעגלה
                </Button>
                <Button
                  data-testid="buy-now-button"
                  onClick={() => {
                    handleAddToCart();
                    navigate('/cart');
                  }}
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 py-6 text-lg"
                >
                  קנה עכשיו
                </Button>
              </div>

              <Card className="glass-card border-white/10 mt-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">מידע חשוב</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>• המוצר יתווסף לחשבון שלך לאחר התשלום</li>
                    <li>• החיבור לשרת יבוצע על ידי הצוות</li>
                    <li>• ניתן לפתוח טיקט לתמיכה</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;