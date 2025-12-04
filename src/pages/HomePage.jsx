import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import api from '@/utils/api';
import { Package, Layers, Users, ShoppingCart } from 'lucide-react';

const HomePage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', full_name: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.login(loginData);
      setUser(response.data.user);
      toast.success(response.data.message);
      setShowAuth(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.register(registerData);
      setUser(response.data.user);
      toast.success(response.data.message);
      setShowAuth(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    toast.success('התנתקת בהצלחה');
  };

  const categories = [
    { name: 'רכבים', icon: Package, color: 'from-purple-500 to-pink-500' },
    { name: 'מפות', icon: Layers, color: 'from-blue-500 to-cyan-500' },
    { name: 'Peds', icon: Users, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Relax RP</h2>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  data-testid="cart-button"
                  variant="outline"
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={() => navigate('/cart')}
                >
                  <ShoppingCart className="ml-2" size={18} />
                  עגלה
                </Button>
                <Button
                  data-testid="profile-button"
                  variant="outline"
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={() => navigate('/profile')}
                >
                  {user.full_name}
                </Button>
                {user.is_admin && (
                  <Button
                    data-testid="admin-button"
                    onClick={() => navigate('/admin')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    ניהול
                  </Button>
                )}
                <Button
                  data-testid="logout-button"
                  variant="outline"
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={handleLogout}
                >
                  התנתק
                </Button>
              </>
            ) : (
              <Button
                data-testid="login-register-button"
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-full"
              >
                התחבר / הרשם
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="mb-6">
              ברוכים הבאים ל-Relax RP
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              החנות הרשמית לרכישת מוצרים לשרת - רכבים, מפות, Peds ועוד
            </p>
            <Button
              data-testid="browse-products-button"
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-purple-500/30"
            >
              עבור לחנות
            </Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="pb-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">הקטגוריות שלנו</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card
                  key={index}
                  data-testid={`category-card-${category.name}`}
                  className="glass-card border-white/10 hover:border-white/20 cursor-pointer group"
                  onClick={() => navigate(`/products?category=${category.name}`)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-gray-400">מגוון רחב של {category.name} לבחירתך</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="pb-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">איך זה עובד?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'הרשמה', desc: 'צור חשבון חדש באתר' },
              { step: '2', title: 'בחירת מוצרים', desc: 'בחר את המוצרים המתאימים לך' },
              { step: '3', title: 'תשלום', desc: 'בצע תשלום מאובטח דרך Stripe' },
              { step: '4', title: 'קבלת המוצר', desc: 'המוצר יתווסף לחשבון שלך' },
            ].map((item, index) => (
              <Card key={index} className="glass-card border-white/10 text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="bg-[#1a1f3a] border-white/10 text-white" data-testid="auth-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">התחברות / הרשמה</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger value="login" data-testid="login-tab">התחברות</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">הרשמה</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">אימייל</Label>
                  <Input
                    id="login-email"
                    data-testid="login-email-input"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">סיסמה</Label>
                  <Input
                    id="login-password"
                    data-testid="login-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button
                  data-testid="login-submit-button"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {loading ? 'מתחבר...' : 'התחבר'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">שם מלא</Label>
                  <Input
                    id="register-name"
                    data-testid="register-name-input"
                    type="text"
                    placeholder="שם מלא"
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">אימייל</Label>
                  <Input
                    id="register-email"
                    data-testid="register-email-input"
                    type="email"
                    placeholder="your@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">סיסמה</Label>
                  <Input
                    id="register-password"
                    data-testid="register-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <Button
                  data-testid="register-submit-button"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {loading ? 'נרשם...' : 'הרשם'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;