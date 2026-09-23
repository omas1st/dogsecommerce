import { PaymentStatus } from '../config/constants';

export interface PaymentIntentOptions {
  amount: number; // In dollars
  currency?: string;
  orderId?: string;
  customerEmail?: string;
  paymentMethodType?: string; // 'credit_card' | 'amazon_gift_card' | 'google_pay' | 'paypal' | 'klarna_bnpl' | 'gift_card'
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  provider: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  brand?: string;
  last4?: string;
  errorMessage?: string;
}

export class PaymentService {
  private static provider = process.env.PAYMENT_PROVIDER || 'mock_stripe';

  public static async createPaymentIntent(options: PaymentIntentOptions): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
  }> {
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 12)}`;

    return {
      clientSecret,
      paymentIntentId,
      amount: options.amount,
      currency: options.currency || 'USD',
    };
  }

  public static async confirmPayment(params: {
    paymentIntentId: string;
    paymentMethodType: string;
    tokenOrCardDetails?: {
      cardNumber?: string;
      brand?: string;
      last4?: string;
      expMonth?: number;
      expYear?: number;
    };
    amount: number;
  }): Promise<PaymentResult> {
    const rawNumber = params.tokenOrCardDetails?.cardNumber?.replace(/\s+/g, '');
    const last4 = params.tokenOrCardDetails?.last4 || (rawNumber ? rawNumber.slice(-4) : '4242');
    let brand = params.tokenOrCardDetails?.brand || 'Visa';

    if (rawNumber) {
      if (rawNumber.startsWith('4')) brand = 'Visa';
      else if (rawNumber.startsWith('5')) brand = 'Mastercard';
      else if (rawNumber.startsWith('3')) brand = 'Amex';
      else if (rawNumber.startsWith('6')) brand = 'Discover';
    }

    if (params.paymentMethodType === 'paypal') {
      brand = 'PayPal';
    } else if (params.paymentMethodType === 'amazon_gift_card') {
      brand = 'Amazon Gift Card';
    } else if (params.paymentMethodType === 'google_pay') {
      brand = 'Google Pay';
    } else if (params.paymentMethodType === 'klarna_bnpl') {
      brand = 'Klarna BNPL (4 installments)';
    }

    // Generate transaction record - strictly NEVER store raw card digits or CVV
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      transactionId,
      provider: this.provider,
      status: PaymentStatus.PAID,
      amount: params.amount,
      currency: 'USD',
      brand,
      last4,
    };
  }

  public static async refundPayment(params: {
    transactionId: string;
    amount: number;
    reason?: string;
  }): Promise<{ success: boolean; refundId: string; refundedAmount: number }> {
    const refundId = `re_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      refundId,
      refundedAmount: params.amount,
    };
  }
}
