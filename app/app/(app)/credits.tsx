import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { STRIPE_PUBLISHABLE_KEY } from "@/config/.env";
import CreditPackageCard from "@/components/app/CreditPackageCard";
import { CreditPackage } from "@/components/app/CreditPackageCard";
import { useThemeColors } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { useSession } from "@/context/AuthContext";

const CREDIT_PACKAGES: Omit<CreditPackage, "gradient">[] = [
 {
    credits:10,
    price: 2,
    popular: false
 },
  {
      credits: 50,
      price: 10,
      popular: true,
  },
  {
      credits: 100,
      price: 15,
      popular: false
  },
];

function CreditsContent() {
  const { user, isLoading } = useSession();
  const colors = useThemeColors();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 p-4">
      <View className="items-center mb-8">
        <MaterialIcons name="stars" size={60} color={colors.primary} />
        <Text className="text-4xl text-gray-800 dark:text-white my-2">
          {user?.credits || 0}
        </Text>
        <Text className="text-lg text-gray-600 dark:text-gray-300">
         Available Credits
        </Text>
      </View>
      <Text className="text-xl font-bold dark:text-white text-gray-800 mb-4">
        Get More Credits
      </Text>

      <View>
        {CREDIT_PACKAGES.map((pkg) => {

          const completePackage: CreditPackage = {
            ...pkg, 
            gradient: [colors.card, colors.surface] as readonly [string, string, ...string[]],
          };

          return (
            <CreditPackageCard
              key={completePackage.credits}
              package={completePackage}
              onPress={()=>{}}
              disabled={isLoading}
            />
          );
        })}
      </View>
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-black/10 dark:bg-black/30">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      {!isLoading && user?.credits === 0 && (
        <View className="items-center justify-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg my-4">
          <MaterialIcons name='image-not-supported' size={48} color={colors.secondaryText} />
          <Text className="text-gray-500 dark:text-gray-400 mt-2">
            You haven't purchased any credits yet.
          </Text>
        </View>
      )}
    </View>
  );
}

export default function Credits() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <CreditsContent />
    </StripeProvider>
  );
}