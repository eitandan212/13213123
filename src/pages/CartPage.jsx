import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/utils/api';
import { ArrowRight, Trash2, ShoppingCart, Plus, Minus } from 'lucide-react';

const CartPage = ({ user, setUser, cart, updateCart }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const updateQuantity = (productId, change) => {
    updateCart(
      cart.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (productId) => {
    updateCart(cart.filter((item) => item.product_id !== productId));
    toast.success('המוצר הוסר מהעגלה');
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('נדרש להתחבר לפני התשלום');
      navigate('/');
      return;
    }

    if (cart.length === 0) {
      toast.error('העגלה ריקה');
      return;
    }

    setLoading(true);
    try {
      const response = await api.createCheckoutSession(
        {
          items: cart,
          origin_url: window.location.origin,
        },
        user.email
      );
      
      // Redirect to Stripe
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'שגיאה ביצירת התשלום');
      setLoading(false);
    }
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
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => navigate('/products')}
            >
              <ArrowRight className="ml-2" size={18} />
              חזרה לקניות
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8" data-testid="cart-title">עגלת הקניות</h1>

          {cart.length === 0 ? (
            <div className="text-center py-20" data-testid="empty-cart">
              <ShoppingCart size={64} className="mx-auto mb-4 text-gray-500" />
              <h3 className="text-2xl font-bold mb-2">העגלה ריקה</h3>
              <p className="text-gray-400 mb-6">עדיין לא הוספת מוצרים לעגלה</p>
              <Button
                onClick={() => navigate('/products')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                התחל לקנות
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.product_id} className="glass-card border-white/10" data-testid={`cart-item-${item.product_id}`}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1" data-testid={`item-name-${item.product_id}`}>{item.product_name}</h3>
                        <p className="text-gray-400">${item.price.toFixed(2)} ליחידה</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          data-testid={`decrease-quantity-${item.product_id}`}
                          size="icon"
                          variant="outline"
                          className="bg-white/5 border-white/10 hover:bg-white/10"
                          onClick={() => updateQuantity(item.product_id, -1)}
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="text-lg font-bold w-8 text-center" data-testid={`item-quantity-${item.product_id}`}>{item.quantity}</span>
                        <Button
                          data-testid={`increase-quantity-${item.product_id}`}
                          size="icon"
                          variant="outline"
                          className="bg-white/5 border-white/10 hover:bg-white/10"
                          onClick={() => updateQuantity(item.product_id, 1)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      <div className="text-xl font-bold w-24 text-left" data-testid={`item-total-${item.product_id}`}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <Button
                        data-testid={`remove-item-${item.product_id}`}
                        size="icon"
                        variant="outline"
                        className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400"
                        onClick={() => removeItem(item.product_id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Total & Checkout */}
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-2xl font-bold">סה"כ:</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent" data-testid="cart-total">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    data-testid="checkout-button"
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 py-6 text-lg"
                  >
                    {loading ? 'מעבד...' : 'מעבר לתשלום'}
                  </Button>
                  <p className="text-center text-gray-400 text-sm mt-4">
                    תשלום מאובטח דרך Stripe
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;