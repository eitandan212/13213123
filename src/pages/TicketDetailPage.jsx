import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/utils/api';
import { ArrowRight, Send } from 'lucide-react';

const TicketDetailPage = ({ user }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const response = await api.getTicket(id, user.email);
      setTicket(response.data);
    } catch (error) {
      toast.error('שגיאה בטעינת הטיקט');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSending(true);
    try {
      await api.replyToTicket(
        id,
        { message: replyMessage, is_admin: user.is_admin || false },
        user.email
      );
      toast.success('אתגובה נשלחה');
      setReplyMessage('');
      loadTicket();
    } catch (error) {
      toast.error('שגיאה בשליחת התגובה');
    } finally {
      setSending(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!ticket) return null;

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
              onClick={() => navigate('/tickets')}
            >
              <ArrowRight className="ml-2" size={18} />
              חזרה לטיקטים
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-32 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Ticket Header */}
          <Card className="glass-card border-white/10 mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2" data-testid="ticket-subject">{ticket.subject}</h1>
                  <p className="text-gray-400">
                    נוצר בתאריך: {new Date(ticket.created_at).toLocaleDateString('he-IL')}
                  </p>
                  {ticket.order_id && (
                    <p className="text-gray-400 text-sm mt-1">
                      מספר הזמנה: {ticket.order_id}
                    </p>
                  )}
                </div>
                <Badge className={getStatusBadge(ticket.status)} data-testid="ticket-status">
                  {getStatusText(ticket.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <div className="space-y-4 mb-6">
            {ticket.messages.map((msg, index) => (
              <Card
                key={index}
                data-testid={`message-${index}`}
                className={`glass-card border-white/10 ${
                  msg.sender === 'admin'
                    ? 'border-r-4 border-r-purple-500'
                    : 'border-r-4 border-r-blue-500'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold">
                      {msg.sender === 'admin' ? 'תמיכה' : 'אתה'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(msg.timestamp).toLocaleString('he-IL')}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply Form */}
          {ticket.status !== 'closed' && (
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <form onSubmit={handleReply}>
                  <Textarea
                    data-testid="reply-textarea"
                    placeholder="כתוב תגובה..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="mb-4"
                  />
                  <Button
                    data-testid="send-reply-button"
                    type="submit"
                    disabled={sending || !replyMessage.trim()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Send className="ml-2" size={18} />
                    {sending ? 'שולח...' : 'שלח תגובה'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;