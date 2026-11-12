import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { api } from '../services/api';

const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const currency = import.meta.env.VITE_PAYPAL_CURRENCY || 'INR';

export const PayPalCheckout = ({
  courseId,
  onSuccess,
  onError,
  samplePaymentEnabled = false,
}) => {
  if (!clientId) {
    return (
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.7rem' }}>
          {samplePaymentEnabled
            ? 'PayPal is not configured. Use the sample payment for staging tests.'
            : 'PayPal is not configured and sample payments are disabled.'}
        </p>
        {samplePaymentEnabled && (
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={async () => {
              try {
                const response = await api.createSamplePayment(courseId);
                onSuccess(response);
              } catch (error) {
                onError(error);
              }
            }}
          >
            Complete Sample Payment
          </button>
        )}
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ 'client-id': clientId, currency, intent: 'capture' }}>
      <PayPalButtons
        style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
        createOrder={async () => {
          const response = await api.createPayPalOrder(courseId);
          return response.orderId;
        }}
        onApprove={async (data) => {
          try {
            const response = await api.capturePayPalOrder(data.orderID);
            onSuccess(response);
          } catch (error) {
            onError(error);
          }
        }}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
};

