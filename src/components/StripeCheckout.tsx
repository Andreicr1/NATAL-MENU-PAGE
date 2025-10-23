import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

interface CheckoutFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Ocorreu um erro ao processar o pagamento');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setErrorMessage('Erro inesperado. Tente novamente.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card'],
          }}
        />
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-[#5c0108] hover:bg-[#7a0109] text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pagar Agora
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

interface StripeCheckoutProps {
  amount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  customerEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripeCheckout({
  amount,
  items,
  customerEmail,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mypdmnucmkigqshafrwx.supabase.co';
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGRtbnVjbWtpZ3FzaGFmcnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTAxNzMsImV4cCI6MjA3NjM4NjE3M30.LTzyrfI4unf-KkhRktZyEQCPUoWphpWAo4U0kQ2Y5u8';

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/stripe-c42493b2/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount,
            currency: 'brl',
            customerEmail,
            metadata: {
              items: JSON.stringify(items),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao criar intenção de pagamento');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setLoading(false);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Não foi possível iniciar o processo de pagamento. Tente novamente.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#5c0108]" />
        <p className="text-gray-600">Preparando checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={onCancel} variant="outline" className="w-full">
          Voltar
        </Button>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#5c0108',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Libre Baskerville, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
    locale: 'pt-BR',
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="font-['Libre_Baskerville'] text-[20px] text-[#5c0108] mb-2">
          Finalizar Pagamento
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total a pagar:</span>
          <span className="font-['Libre_Baskerville'] text-[24px] text-[#d4af37]">
            R$ {amount.toFixed(2)}
          </span>
        </div>
      </div>

      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>

      <div className="text-xs text-gray-500 text-center">
        Pagamento seguro processado pela Stripe
      </div>
    </div>
  );
}

interface StripeCheckoutSessionProps {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  customerEmail?: string;
  onSuccess?: () => void; // Optional - only called if not redirecting
  onCancel: () => void;
}

export function StripeCheckoutSession({
  items,
  customerEmail,
  onCancel,
}: StripeCheckoutSessionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mypdmnucmkigqshafrwx.supabase.co';
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGRtbnVjbWtpZ3FzaGFmcnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTAxNzMsImV4cCI6MjA3NjM4NjE3M30.LTzyrfI4unf-KkhRktZyEQCPUoWphpWAo4U0kQ2Y5u8';

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/stripe-c42493b2/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            items,
            customerEmail,
            successUrl: `${window.location.origin}/payment-success`,
            cancelUrl: `${window.location.origin}/`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao criar sessão de checkout');
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Não foi possível iniciar o checkout. Tente novamente.');
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="font-['Libre_Baskerville'] text-[20px] text-[#5c0108] mb-4">
          Resumo do Pedido
        </h3>
        
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.name} × {item.quantity}
              </span>
              <span className="text-gray-900">
                R$ {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="font-['Libre_Baskerville'] text-[16px] text-[#5c0108]">
            Total:
          </span>
          <span className="font-['Libre_Baskerville'] text-[24px] text-[#d4af37]">
            R$ {totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleCheckout}
          disabled={loading}
          className="flex-1 bg-[#5c0108] hover:bg-[#7a0109] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecionando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Ir para Checkout
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Você será redirecionado para a página de pagamento segura da Stripe
      </div>
    </div>
  );
}
