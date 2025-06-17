import { useSession } from "@/context/AuthContext";
import paymentService from "@/services/paymentService";
import { useStripe } from "@stripe/stripe-react-native";
import { useState, useCallback } from "react";
import { Alert } from "react-native";

export const useCredits = () => { 
  const { user, updateUser } = useSession();
  const [ isLoading, setIsLoading ] = useState(false);
  const [ selectedPackage, setSelectedPackage ] = useState<null | {credits:number, price: number}>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const initializePaymentSheet = useCallback(async (credits: number, price: number) => {
    try {
      const { paymentIntent, ephemeralKey, customer } = await paymentService.fetchPaymentSheetParams(credits, price);
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Image Processing App',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: false,
        style: 'automatic',
        returnURL: 'image-processing://stripe-redirect',
      });

      if (error) {
        console.error("Failed to initialize payment sheet:", error);
        Alert.alert("Payment Error", "Failed to initialize payment. Please try again.");
        return false;
      }

      return true;

    } catch (error) {
      console.error("Error initializing payment sheet:", error);
      Alert.alert("Payment Error", "An error occurred while initializing payment. Please try again.");
      return false;

    }
  },[initPaymentSheet]);

  const handlePurchase = useCallback(async (credits: number, price: number) => {
    if (isLoading) return;

    try{
      setIsLoading(true);
      setSelectedPackage({credits, price});

      const initialized = await initializePaymentSheet(credits, price);
      if (!initialized) {
        setIsLoading(false);
        return;
      }

      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          console.log("Payment was canceled by the user.");
        } else {
          Alert.alert("Payment Error", error.message);
        }
        setSelectedPackage(null);
        return;
      }

      const result = await paymentService.handlePaymentSuccess();
      if (result.success) {
        try {
          if (user) {
            const updatedUser = {
              ...user,  
              credits: result.credits,
            };
            await updateUser(updatedUser);

            Alert.alert("Success", `Successfully added ${result.credits_added} credits to your account!`);
          } else {
            const userData = await paymentService.fetchUserData();
            if (userData) {
              await updateUser(userData);
              Alert.alert("Success", `Successfully added ${result.credits_added} credits to your account!`);
            } 
          }
        } catch (error) {
          console.error("Failed to update user data after payment:", error);
          throw new Error("Failed to update user data after payment.");
        }
      } else {
        Alert.alert("Error", result.error || "Payment was successful, but we could not update your credits. Please try again later.");
      }

    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error","Failed to complete payment. Please try again later.");
    } finally {
      setIsLoading(false);
      setSelectedPackage(null);
    }
  },[isLoading, initializePaymentSheet, presentPaymentSheet, user, updateUser]);

  return {
    user,
    isLoading,
    selectedPackage,
    handlePurchase
  };

};