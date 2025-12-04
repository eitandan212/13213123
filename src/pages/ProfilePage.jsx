import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/utils/api';
import { ArrowRight, Package, MessageSquare, ShoppingBag } from 'lucide-react';

const ProfilePage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, ticketsRes] = await Promise.all([
        api.getUserOrders(user.email),
        api.getUserTickets(user.email),
      ]);
      setOrders(ordersRes.data);
      setTickets(ticketsRes.data);
    } catch (error) {
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
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
            <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Relax RP</h2>
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
        <div className="container mx-auto max-w-6xl">
          {/* User Info */}
          <Card className="glass-card border-white/10 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2" data-testid="user-name">{user.full_name}</h1>
                  <p className="text-gray-400" data-testid="user-email">{user.email}</p>
                </div>
                <Button
                  data-testid="create-ticket-button"
                  onClick={() => navigate('/tickets')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <MessageSquare className="ml-2" size={18} />
                  פתח טיקט
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/5 p-1 mb-8">
              <TabsTrigger value="orders" data-testid="orders-tab">
                <ShoppingBag className="ml-2" size={18} />
                ההזמנות שלי
              </TabsTrigger>
              <TabsTrigger value="tickets" data-testid="tickets-tab">
                <MessageSquare className="ml-2" size={18} />
                הטיקטים שלי
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12" data-testid="no-orders">
                  <Package size={64} className="mx-auto mb-4 text-gray-500" />
                  <h3 className="text-2xl font-bold mb-2">אין הזמנות</h3>
                  <p className="text-gray-400 mb-6">עדיין לא ביצעת הזמנות</p>
                  <Button
                    onClick={() => navigate('/products')}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    התחל לקנות
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="glass-card border-white/10" data-testid={`order-${order.id}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-2">הזמנה #{order.id.substring(0, 8)}</CardTitle>
                            <p className="text-sm text-gray-400">
                              {new Date(order.created_at).toLocaleDateString('he-IL')}
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

            <TabsContent value="tickets">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12" data-testid="no-tickets">
                  <MessageSquare size={64} className="mx-auto mb-4 text-gray-500" />
                  <h3 className="text-2xl font-bold mb-2">אין טיקטים</h3>
                  <p className="text-gray-400 mb-6">עדיין לא פתחת טיקטים</p>
                  <Button
                    onClick={() => navigate('/tickets')}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    פתח טיקט
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card
                      key={ticket.id}
                      data-testid={`ticket-${ticket.id}`}
                      className="glass-card border-white/10 cursor-pointer hover:border-white/20"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-2">{ticket.subject}</CardTitle>
                            <p className="text-sm text-gray-400">
                              {new Date(ticket.created_at).toLocaleDateString('he-IL')}
                            </p>
                          </div>
                          <Badge className={getStatusBadge(ticket.status)}>
                            {getStatusText(ticket.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {ticket.messages[0]?.message}
                        </p>
                        <div className="mt-4 text-sm text-gray-500">
                          {ticket.messages.length} תגובות
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
    </div>
  );
};

export default ProfilePage;