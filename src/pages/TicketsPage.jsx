import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/utils/api';
import { ArrowRight, MessageSquare, Plus } from 'lucide-react';

const TicketsPage = ({ user }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    order_id: '',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await api.getUserTickets(user.email);
      setTickets(response.data);
    } catch (error) {
      toast.error('שגיאה בטעינת הטיקטים');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createTicket(
        {
          subject: formData.subject,
          message: formData.message,
          order_id: formData.order_id || null,
        },
        user.email
      );
      toast.success('הטיקט ניצר בהצלחה');
      setShowCreate(false);
      setFormData({ subject: '', message: '', order_id: '' });
      loadTickets();
    } catch (error) {
      toast.error('שגיאה ביצירת הטיקט');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return variants[status] || variants.open;
  };

  const getStatusText = (status) => {
    const texts = {
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
              onClick={() => navigate('/profile')}
            >
              <ArrowRight className="ml-2" size={18} />
              חזרה לפרופיל
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold">הטיקטים שלי</h1>
            <Button
              data-testid="new-ticket-button"
              onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="ml-2" size={18} />
              טיקט חדש
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12" data-testid="no-tickets">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-500" />
              <h3 className="text-2xl font-bold mb-2">אין טיקטים</h3>
              <p className="text-gray-400 mb-6">עדיין לא פתחת טיקטים</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  data-testid={`ticket-card-${ticket.id}`}
                  className="glass-card border-white/10 cursor-pointer hover:border-white/20"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{ticket.subject}</h3>
                        <p className="text-sm text-gray-400">
                          נוצר בתאריך: {new Date(ticket.created_at).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                      <Badge className={getStatusBadge(ticket.status)}>
                        {getStatusText(ticket.status)}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                      {ticket.messages[0]?.message}
                    </p>
                    <div className="text-sm text-gray-500">
                      {ticket.messages.length} תגובות
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#1a1f3a] border-white/10 text-white" data-testid="create-ticket-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">טיקט חדש</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="subject">נושא</Label>
              <Input
                id="subject"
                data-testid="ticket-subject-input"
                placeholder="נושא הטיקט"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="order_id">מספר הזמנה (אופציונלי)</Label>
              <Input
                id="order_id"
                data-testid="ticket-order-input"
                placeholder="מספר הזמנה"
                value={formData.order_id}
                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="message">הודעה</Label>
              <Textarea
                id="message"
                data-testid="ticket-message-input"
                placeholder="תאר את הבעיה או השאלה שלך"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={5}
                required
              />
            </div>
            <Button
              data-testid="submit-ticket-button"
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              שלח טיקט
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketsPage;