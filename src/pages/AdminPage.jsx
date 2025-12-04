import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/utils/api';
import { ArrowRight, Plus, Edit, Trash2, Package, MessageSquare, ShoppingBag } from 'lucide-react';

const AdminPage = ({ user }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'רכבים',
    image_url: '',
    images: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, ticketsRes] = await Promise.all([
        api.getProducts(),
        api.getAllOrders(user.email),
        api.getAllTickets(user.email),
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setTickets(ticketsRes.data);
    } catch (error) {
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...productForm,
        price: parseFloat(productForm.price),
        images: productForm.images ? productForm.images.split(',').map(s => s.trim()) : [],
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, data, user.email);
        toast.success('המוצר עודכן בהצלחה');
      } else {
        await api.createProduct(data, user.email);
        toast.success('המוצר נוצר בהצלחה');
      }

      setShowProductDialog(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: 'רכבים',
        image_url: '',
        images: '',
      });
      loadData();
    } catch (error) {
      toast.error('שגיאה בשמירת המוצר');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url,
      images: product.images.join(', '),
    });
    setShowProductDialog(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) return;

    try {
      await api.deleteProduct(id, user.email);
      toast.success('המוצר נמחק בהצלחה');
      loadData();
    } catch (error) {
      toast.error('שגיאה במחיקת המוצר');
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      await api.updateTicketStatus(ticketId, status, user.email);
      toast.success('הסטטוס עודכן');
      loadData();
    } catch (error) {
      toast.error('שגיאה בעדכון הסטטוס');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return variants[status] || variants.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'ממתין',
      paid: 'שולם',
      open: 'פתוח',
      in_progress: 'בטיפול',
      closed: 'סגור',
    };
    return texts[status] || status;
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
            <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Relax RP - ניהול</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => navigate('/')}
            >
              <ArrowRight className="ml-2" size={18} />
              חזרה לבית
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">פאנל ניהול</h1>

          {/* Tabs */}
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 bg-white/5 p-1 mb-8">
              <TabsTrigger value="products" data-testid="admin-products-tab">
                <Package className="ml-2" size={18} />
                מוצרים
              </TabsTrigger>
              <TabsTrigger value="orders" data-testid="admin-orders-tab">
                <ShoppingBag className="ml-2" size={18} />
                הזמנות
              </TabsTrigger>
              <TabsTrigger value="tickets" data-testid="admin-tickets-tab">
                <MessageSquare className="ml-2" size={18} />
                טיקטים
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <div className="mb-6">
                <Button
                  data-testid="add-product-button"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      description: '',
                      price: '',
                      category: 'רכבים',
                      image_url: '',
                      images: '',
                    });
                    setShowProductDialog(true);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Plus className="ml-2" size={18} />
                  הוסף מוצר
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="glass-card border-white/10" data-testid={`admin-product-${product.id}`}>
                      <div
                        className="h-40 bg-cover bg-center"
                        style={{ backgroundImage: `url(${product.image_url})` }}
                      ></div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center mb-3">
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {product.category}
                          </Badge>
                          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            data-testid={`edit-product-${product.id}`}
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit size={14} className="ml-1" />
                            ערוך
                          </Button>
                          <Button
                            data-testid={`delete-product-${product.id}`}
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={14} className="ml-1" />
                            מחק
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12" data-testid="no-orders">
                  <ShoppingBag size={64} className="mx-auto mb-4 text-gray-500" />
                  <h3 className="text-2xl font-bold mb-2">אין הזמנות</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="glass-card border-white/10" data-testid={`admin-order-${order.id}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-1">הזמנה #{order.id.substring(0, 8)}</CardTitle>
                            <p className="text-sm text-gray-400">{order.user_email}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(order.created_at).toLocaleString('he-IL')}
                            </p>
                          </div>
                          <Badge className={getStatusBadge(order.payment_status)}>
                            {getStatusText(order.payment_status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.product_name} x{item.quantity}</span>
                              <span className="text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-white/10">
                          <span className="font-bold">סה"כ:</span>
                          <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                            ${order.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12" data-testid="no-tickets">
                  <MessageSquare size={64} className="mx-auto mb-4 text-gray-500" />
                  <h3 className="text-2xl font-bold mb-2">אין טיקטים</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="glass-card border-white/10" data-testid={`admin-ticket-${ticket.id}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-1">{ticket.subject}</CardTitle>
                            <p className="text-sm text-gray-400">{ticket.user_email}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(ticket.created_at).toLocaleString('he-IL')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              defaultValue={ticket.status}
                              onValueChange={(value) => handleUpdateTicketStatus(ticket.id, value)}
                            >
                              <SelectTrigger className="w-32 bg-white/5 border-white/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1a1f3a] border-white/10">
                                <SelectItem value="open">פתוח</SelectItem>
                                <SelectItem value="in_progress">בטיפול</SelectItem>
                                <SelectItem value="closed">סגור</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {ticket.messages[0]?.message}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">{ticket.messages.length} תגובות</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10"
                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                          >
                            צפה בטיקט
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="bg-[#1a1f3a] border-white/10 text-white max-w-2xl" data-testid="product-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingProduct ? 'ערוך מוצר' : 'הוסף מוצר חדש'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">שם המוצר</Label>
                <Input
                  id="name"
                  data-testid="product-name-input"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">מחיר</Label>
                <Input
                  id="price"
                  data-testid="product-price-input"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">קטגוריה</Label>
              <Select
                value={productForm.category}
                onValueChange={(value) => setProductForm({ ...productForm, category: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10" data-testid="product-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f3a] border-white/10">
                  <SelectItem value="רכבים">רכבים</SelectItem>
                  <SelectItem value="מפות">מפות</SelectItem>
                  <SelectItem value="Peds">Peds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                data-testid="product-description-input"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="image_url">כתובת תמונה ראשית</Label>
              <Input
                id="image_url"
                data-testid="product-image-input"
                value={productForm.image_url}
                onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div>
              <Label htmlFor="images">תמונות נוספות (מופרדות בפסיק)</Label>
              <Input
                id="images"
                data-testid="product-images-input"
                value={productForm.images}
                onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              />
            </div>
            <Button
              data-testid="submit-product-button"
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {editingProduct ? 'עדכן מוצר' : 'הוסף מוצר'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
