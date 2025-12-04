import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import api from '@/utils/api';
import { ArrowRight, ShoppingCart, Package } from 'lucide-react';

const ProductsPage = ({ user, setUser, addToCart, cart }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const category = selectedCategory === 'all' ? null : selectedCategory;
      const response = await api.getProducts(category);
      setProducts(response.data);
    } catch (error) {
      toast.error('שגיאה בטעינת המוצרים');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} נוסף לעגלה`);
  };

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
              data-testid="cart-button"
              onClick={() => navigate('/cart')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 relative"
            >
              <ShoppingCart className="ml-2" size={18} />
              עגלה
              {cart.length > 0 && (
                <span className="absolute -top-2 -left-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
            {user && (
              <Button
                data-testid="profile-button"
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10"
                onClick={() => navigate('/profile')}
              >
                {user.full_name}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="pt-32 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">המוצרים שלנו</h1>
          
          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-12">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-white/5 p-1">
              <TabsTrigger value="all" data-testid="category-all">הכל</TabsTrigger>
              <TabsTrigger value="רכבים" data-testid="category-vehicles">רכבים</TabsTrigger>
              <TabsTrigger value="מפות" data-testid="category-maps">מפות</TabsTrigger>
              <TabsTrigger value="Peds" data-testid="category-peds">Peds</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-gray-400">טוען מוצרים...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20" data-testid="no-products">
              <Package size={64} className="mx-auto mb-4 text-gray-500" />
              <h3 className="text-2xl font-bold mb-2">לא נמצאו מוצרים</h3>
              <p className="text-gray-400">אין מוצרים בקטגוריה זו</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <Card
                  key={product.id}
                  data-testid={`product-card-${product.id}`}
                  className="glass-card border-white/10 hover:border-white/20 overflow-hidden group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className="h-48 bg-cover bg-center relative overflow-hidden"
                    style={{ backgroundImage: `url(${product.image_url})` }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent group-hover:from-black/60 transition-all duration-300"></div>
                    <div className="absolute top-2 right-2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {product.category}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                        ${product.price.toFixed(2)}
                      </span>
                      <Button
                        data-testid={`add-to-cart-${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      >
                        <ShoppingCart className="ml-2" size={16} />
                        הוסף לעגלה
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;