import { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

/**
 * PaymentForm — two-step PayPal flow aligned with the backend:
 *
 * Step 1: POST /api/payments/paypal/create-order
 *   → Backend creates a pending Payment + Membership record
 *   → Returns { paymentId, planName, amount, currency }
 *   → We use the returned amount to create the PayPal order on the frontend
 *
 * Step 2: POST /api/payments/paypal/capture-order
 *   → Called after PayPal approves the payment
 *   → Backend marks Payment COMPLETED + Membership ACTIVE
 *   → Returns PaymentDTO
 */
export default function PaymentForm({ planId, planName, amount, onSuccess }) {
  const [error,        setError]        = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // paymentId returned by backend in step 1 — needed for step 2
  const [backendPaymentId, setBackendPaymentId] = useState(null);

  /**
   * Called by PayPal SDK to create the order.
   * We first tell our backend, then use the returned amount
   * to create the actual PayPal order via the SDK actions.
   */
  const handleCreateOrder = async (data, actions) => {
    try {
      setError(null);
      setIsProcessing(true);

      // Step 1 — tell backend to create a pending payment record
      const res = await paymentService.createOrder(planId);
      const { paymentId, amount: backendAmount } = res.data;
      setBackendPaymentId(paymentId);

      // Create the PayPal order using the amount confirmed by the backend
      const orderAmount = backendAmount || amount;
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: String(parseFloat(orderAmount).toFixed(2)),
            currency_code: 'USD',
          },
          description: planName,
        }],
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to initialize payment.';
      setError(msg);
      setIsProcessing(false);
      throw err;
    }
  };

  /**
   * Called by PayPal SDK after the user approves the payment.
   * We capture on the frontend via actions.order.capture(),
   * then tell our backend to mark the payment as completed.
   */
  const handleApprove = async (data, actions) => {
    try {
      setIsProcessing(true);

      // Capture the PayPal order on PayPal's side
      const captureDetails = await actions.order.capture();
      const paypalOrderId  = captureDetails.id;

      // Step 2 — tell backend to mark payment COMPLETED
      const res = await paymentService.captureOrder(
        backendPaymentId,
        paypalOrderId,
      );

      toast.success('Payment successful! Check your email for the receipt.');
      onSuccess(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete payment.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (err) => {
    console.error('[PayPal error]', err);
    setError('PayPal encountered an error. Please try again.');
    toast.error('Payment failed. Please try again.');
    setIsProcessing(false);
  };

  return (
    <div className="space-y-5">
      {/* Order summary */}
      <div className="bg-coral-500/10 border border-coral-500/20 rounded-xl p-5">
        <p className="text-xs font-bold text-fitpro-muted uppercase tracking-widest mb-1">
          Order Summary
        </p>
        <p className="text-lg font-semibold text-white">{planName}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-4xl font-extrabold text-coral-500">${amount}</p>
          <p className="text-fitpro-muted text-sm">USD</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
        >
          <span className="mt-0.5 flex-shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* PayPal buttons */}
      <div
        data-testid="paypal-buttons-container"
        className={`transition-opacity duration-200 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: 'USD' }}>
          <PayPalButtons
            style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
            createOrder={handleCreateOrder}
            onApprove={handleApprove}
            onError={handleError}
            disabled={isProcessing}
          />
        </PayPalScriptProvider>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-fitpro-muted">
          <span className="w-4 h-4 border-2 border-navy-500 border-t-coral-500 rounded-full animate-spin" />
          <span>Processing payment...</span>
        </div>
      )}
    </div>
  );
}
