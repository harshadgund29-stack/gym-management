import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentForm from '../components/PaymentForm';
import api from '../services/api';

// Mock the API module
jest.mock('../services/api');

// Mock PayPalButtons to isolate our logic
jest.mock('@paypal/react-paypal-js', () => ({
    PayPalScriptProvider: ({ children }) => <div>{children}</div>,
    PayPalButtons: ({ createOrder, onApprove }) => (
        <button 
            data-testid="mock-paypal-button"
            onClick={async () => {
                const orderId = await createOrder();
                if (orderId) {
                    await onApprove({ orderID: orderId });
                }
            }}
        >
            Pay with PayPal
        </button>
    )
}));

describe('PaymentForm Component', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders payment form with correct amount', () => {
        render(<PaymentForm planId={1} amount={99.99} onSuccess={jest.fn()} />);
        expect(screen.getByText('Complete your payment of $99.99')).toBeInTheDocument();
        expect(screen.getByTestId('paypal-buttons-container')).toBeInTheDocument();
    });

    test('handles successful payment flow', async () => {
        const onSuccessMock = jest.fn();
        
        // Mock the create order API call
        api.post.mockResolvedValueOnce({ data: { id: 'ORDER-123' } });
        // Mock the capture order API call
        api.post.mockResolvedValueOnce({ data: { status: 'COMPLETED' } });

        render(<PaymentForm planId={1} amount={50.00} onSuccess={onSuccessMock} />);
        
        const button = screen.getByTestId('mock-paypal-button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/payments/create-order', { planId: 1, amount: 50.00 });
            expect(api.post).toHaveBeenCalledWith('/payments/capture-order', { orderId: 'ORDER-123', planId: 1 });
            expect(onSuccessMock).toHaveBeenCalledWith({ status: 'COMPLETED' });
        });
    });

    test('displays error message on failed capture', async () => {
        api.post.mockResolvedValueOnce({ data: { id: 'ORDER-123' } });
        api.post.mockRejectedValueOnce(new Error('Network error'));

        render(<PaymentForm planId={1} amount={50.00} onSuccess={jest.fn()} />);
        
        const button = screen.getByTestId('mock-paypal-button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to capture payment.');
        });
    });
});
