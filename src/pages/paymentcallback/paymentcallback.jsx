
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './paymentcallback.css'

export default function PaymentCallback() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState(
    'Checking your payment. Please wait...'
  );

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function checkPayment() {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get('reference');

      if (!reference) {
        setStatus('failed');
        setMessage('No payment reference was found.');
        return;
      }

      try {
        // Check the payment with our trusted backend.
        // This Edge Function still needs to be created.
        const { data, error } = await supabase.functions.invoke(
          'verify-paystack-payment',
          {
            body: { reference },
          }
        );

        if (error) throw error;

        if (cancelled) return;

        if (data?.status === 'success') {
          setStatus('success');
          setMessage(
            'Your payment has been verified. Welcome to Vydora Pro!'
          );

          // Refresh the profile if your app caches the plan.
          // The backend must update the profile after verification.
        } else {
          setStatus('failed');
          setMessage(
            data?.message ||
              'We could not confirm this payment yet. Please contact support if you were charged.'
          );
        }
      } catch (error) {
        if (cancelled) return;

        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage(
          'We could not verify your payment right now. Your payment reference is shown below. Please try again later.'
        );
      }
    }

    checkPayment();

    return () => {
      cancelled = true;
    };
  }, []);

  const reference = new URLSearchParams(
    window.location.search
  ).get('reference');

  return (
    <main className="payment-callback">
      <div className="payment-callback-card">
        {status === 'verifying' && (
          <LoaderCircle className="payment-icon spinning" size={48} />
        )}

        {status === 'success' && (
          <CheckCircle className="payment-icon success" size={48} />
        )}

        {status === 'failed' && (
          <XCircle className="payment-icon failed" size={48} />
        )}

        <h1>
          {status === 'verifying'
            ? 'Verifying payment'
            : status === 'success'
              ? 'Payment confirmed'
              : 'Payment not confirmed'}
        </h1>

        <p>{message}</p>

        {reference && (
          <p className="payment-reference">
            Reference: {reference}
          </p>
        )}

        {status === 'success' ? (
          <button onClick={() => navigate('/dashboard')}>
            Go to dashboard
          </button>
        ) : (
          <Link to="/pricing" className="payment-back-link">
            Return to pricing
          </Link>
        )}
      </div>
    </main>
  );
}
