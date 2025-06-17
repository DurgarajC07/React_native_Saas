<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Log;
use Stripe\Customer;
use Stripe\EphemeralKey;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request): mixed
    {
        Log::info('Payment intent request received', [
            'user' => auth()->id(),
            'input' => $request->all(),
            'stripe_version' => $request->header('Stripe-Version'),
        ]);
        $request->validate([
            'credits' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $amountInCents = (int) ($request->price * 100);

            $customer = Customer::create([
                'email' => auth()->user()->email,
                'name' => auth()->user()->name,
            ]);

            $ephemeralKey = EphemeralKey::create(
                ['customer' => $customer->id],
                ['stripe_version' => $request->header('Stripe-Version')]
            );
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'usd',
                'customer' => $customer->id,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
                'metadata' => [
                    'credits_amount' => $request->credits,
                    'user_id' => auth()->id(),
                ],
            ]);

            Transaction::create([
                'user_id' => auth()->id(),
                'stripe_payment_intent_id' => $paymentIntent->id,
                'credits_amount' => $request->credits,
                'amount_paid' => $request->price,
                'currency' => 'usd',
                'status' => 'pending',
            ]);

            return response()->json([
                'paymentIntent' => $paymentIntent->client_secret,
                'ephemeralKey' => $ephemeralKey->secret,
                'customer' => $customer->id,
                'publishableKey' => config('services.stripe.key'),
                'paymentIntentId' => $paymentIntent->id,
            ]);

        } catch (\Exception $e) {
            Log::error('' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function handlePaymentSuccess(Request $request)
    {
        try {
            $paymentIntentId = $request->input('payment_intent');

            $transaction = Transaction::where('stripe_payment_intent_id', $paymentIntentId)->where('status', 'pending')->first();

            if ($transaction) {
                $transaction->status = 'completed';
                $transaction->save();

                // Update user credits
                $user = $transaction->user;
                $user->credits += $transaction->credits_amount;
                $user->save();

                return response()->json([
                    'success' => true,
                    'credits' => $user->credits,
                    'credits_added' => $transaction->credits_amount,
                ]);
            }

            return response()->json(['error' => 'Transaction not found'], 404);

        } catch (\Exception $e) {
            Log::error('Payment success handling failed: ' . $e->getMessage());
            return response()->json(['error' => 'Payment processing failed.'], 500);
        }
    }
}
