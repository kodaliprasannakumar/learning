import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
interface CreditContextType {
  credits: number;
  isLoading: boolean;
  earnCredits: (amount: number, description: string) => Promise<boolean>;
  spendCredits: (amount: number, description: string) => Promise<boolean>;
  refreshCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const useCreditSystem = (): CreditContextType => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error("useCreditSystem must be used within a CreditProvider");
  }
  return context;
};

export const CreditProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to fetch user's current credits from Supabase
  const fetchCredits = async () => {
    if (!user) {
      setCredits(0);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
    }

      if (data) {
        setCredits(data.credits_balance || 0);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      setCredits(0);
    }
  };

  // Combined refresh function
  const refreshCredits = async () => {
    setIsLoading(true);
    await fetchCredits();
    setIsLoading(false);
  };

  // Function to earn credits
  const earnCredits = async (amount: number, description: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Get current credits
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('credits_balance, lifetime_credits')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const newCredits = (currentProfile?.credits_balance || 0) + amount;
      const newLifetimeCredits = (currentProfile?.lifetime_credits || 0) + amount;
      
      // Update profile with new credit balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          credits_balance: newCredits,
          lifetime_credits: newLifetimeCredits
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setCredits(newCredits);

      return true;
    } catch (error) {
      console.error("Error in earnCredits:", error);
      toast.error("Failed to earn credits. Please try again.");
      return false;
    }
  };

  // Function to spend credits
  const spendCredits = async (amount: number, description: string): Promise<boolean> => {
    if (!user) return false;
    
    // Check if the user has enough credits
    if (credits < amount) {
      toast.error(`Not enough credits! You need ${amount} credits but have ${credits}.`);
      return false;
    }
    
    try {
      // Get current credits
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const newCredits = (currentProfile?.credits_balance || 0) - amount;

      // Ensure we don't go negative (double-check)
      if (newCredits < 0) {
        toast.error(`Not enough credits! You need ${amount} credits but have ${currentProfile?.credits_balance || 0}.`);
        return false;
      }

      // Update profile with new credit balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits_balance: newCredits })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setCredits(newCredits);

      return true;
    } catch (error) {
      console.error("Error in spendCredits:", error);
      toast.error("Failed to spend credits. Please try again.");
      return false;
    }
  };

  // Load credits when user changes
  useEffect(() => {
    if (user) {
      refreshCredits();
    } else {
      setCredits(0);
      setIsLoading(false);
    }
  }, [user]);

  return (
    <CreditContext.Provider
      value={{
        credits,
        isLoading,
        earnCredits,
        spendCredits,
        refreshCredits
      }}
    >
      {children}
    </CreditContext.Provider>
  );
}; 