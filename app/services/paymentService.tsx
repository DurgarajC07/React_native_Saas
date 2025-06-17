import axiosInstance from "@/config/axiosConfig";

interface PaymentSheetParams {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
}

export interface PaymentResult {
  success: boolean;
  credits?: number;
  credits_added?: number;
  error?: string;
}

class PaymentService {
  private paymentIntentId: string = '';

  async fetchPaymentSheetParams(credits: number, price: number):
  Promise<PaymentSheetParams> {
    try {
      const response = await axiosInstance.post('/api/payment/create-payment-intent', {
        credits,
        price,
      },{
        headers: {
          'Stripe-Version': '2022-11-15',
        }
      });

      if(response.data.paymentIntentId){
        this.paymentIntentId = response.data.paymentIntentId;
      }else if(response.data.paymentIntent){
        const clientSecret = response.data.paymentIntent;
        const parts = clientSecret.split('_secret_');
        if(parts.length > 0){
          this.paymentIntentId = parts[0];
        }
      }
      return {
        paymentIntent: response.data.paymentIntent,
        ephemeralKey: response.data.ephemeralKey,
        customer: response.data.customer,
      };
    } catch (error) {
      console.error("Failed to fetch payment sheet params:", error);
      throw error;
    }
  }
  
  getPaymentIntentId(): string {
    return this.paymentIntentId;
  }

  async handlePaymentSuccess(): Promise<PaymentResult> {
    try {
      const response = await axiosInstance.post('/api/payment/handle-payment-success', {
        payment_intent: this.paymentIntentId
      });      
      if (response.data.success) {
        return {
          success: true,
          credits: response.data.credits,
          credits_added: response.data.credits_added,
        };
      } else {
        return {
          success: false,
          error: 'Payment failed',
        };
      }
    } catch (error) {
      console.error("Failed to handle payment success:", error);
      return {
        success: false,
        error: 'Payment was successfull, but we could not update your credits. Please try again later.',
      };
    }
  }

  async fetchUserData(){
    try {
      const userResponse = await axiosInstance.get('/api/user');
      return userResponse.data;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      throw error;
    }
  }
}

export default new PaymentService();
