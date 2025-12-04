import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/utils/api';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const PaymentSuccessPage = ({ user, setUser, updateCart }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    const maxAttempts = 5;
    
    if (attempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await api.getCheckoutStatus(sessionId);
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
        updateCart([]);
        toast.success('התשלום בוצע בהצלחה!');
      } else if (response.data.status === 'expired') {
        setStatus('expired');
      } else {
        setAttempts(attempts + 1);
        setTimeout(() => checkPaymentStatus(), 2000);
      }
    } catch (error) {
      setStatus('error');
      toast.error('שגיאה בבדיקת התשלום');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="text-center py-12" data-testid="checking-status">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-6"></div>
            <h2 className="text-3xl font-bold mb-4">בודק סטטוס תשלום...</h2>
            <p className="text-gray-400">אנא המתן, אנו מאמתים את התשלום שלך</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12" data-testid="success-status">
            <CheckCircle size={80} className="mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold mb-4">התשלום בוצע בהצלחה!</h2>
            <p className="text-gray-400 mb-8">תודה על הרכישה. המוצרים שלך מוכנים לחיבור לשרת.</p>
            <div className="flex gap-4 justify-center">
              <Button
                data-testid="view-orders-button"
                onClick={() => navigate('/profile')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                צפה בהזמנות
              </Button>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10"
                onClick={() => navigate('/products')}
              >
                המשך לקנות
              </Button>
            </div>
          </div>
        );

      case 'expired':
      case 'error':
        return (
          <div className="text-center py-12" data-testid="error-status">
            <XCircle size={80} className="mx-auto mb-6 text-red-500" />
            <h2 className="text-3xl font-bold mb-4">התשלום נכשל</h2>
            <p className="text-gray-400 mb-8">אירעה שגיאה בתשלום. אנא נסה שוב.</p>
            <Button
              onClick={() => navigate('/cart')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              חזרה לעגלה
            </Button>
          </div>
        );

      case 'timeout':
        return (
          <div className="text-center py-12" data-testid="timeout-status">
            <Clock size={80} className="mx-auto mb-6 text-yellow-500" />
            <h2 className="text-3xl font-bold mb-4">בדיקת התשלום ארכה יותר מדי</h2>
            <p className="text-gray-400 mb-8">אנא בדוק את ההזמנות שלך או צור קשר עם התמיכה.</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('/profile')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                צפה בהזמנות
              </Button>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10"
                onClick={() => navigate('/tickets')}
              >
                צור קשר עם תמיכה
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Relax RP</h2>
          </div>
        </div>
      </header>

      <div className="pt-32 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="glass-card border-white/10">
            <CardContent className="p-8">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;