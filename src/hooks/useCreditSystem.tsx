import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

// Types
interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  created_at: string;
  transaction_type: "earn" | "spend";
}

interface CreditContextType {
  credits: number;
  isLoading: boolean;
  earnCredits: (amount: number, description: string) => Promise<boolean>;
  spendCredits: (amount: number, description: string) => Promise<boolean>;
  transactions: CreditTransaction[];
  refreshCredits: () => Promise<void>;
}

// Create context
const CreditContext = createContext<CreditContextType | undefined>(undefined);

// Provider component
export const CreditProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  // Function to fetch user's credit balance from Supabase
  const fetchCredits = async () => {
    if (!user) {
      setCredits(0);
      setIsLoading(false);
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
      } else {
        // If no profile found, it will be created by the auth trigger
        setCredits(0);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      setCredits(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch user's transaction history from Supabase
  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to last 50 transactions

      if (error) {
        throw error;
      }

      if (data) {
        const formattedTransactions: CreditTransaction[] = data.map(transaction => ({
          id: transaction.id,
          user_id: transaction.user_id,
          amount: transaction.amount,
          description: transaction.description,
          created_at: transaction.created_at || new Date().toISOString(),
          transaction_type: transaction.transaction_type as "earn" | "spend"
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Combined refresh function
  const refreshCredits = async () => {
    setIsLoading(true);
    await Promise.all([fetchCredits(), fetchTransactions()]);
    setIsLoading(false);
  };

  // Function to check for daily login bonus
  const checkDailyLoginBonus = async () => {
    if (!user) return;

    try {
      // Check if the user already got a login bonus today
      const today = new Date().toISOString().split('T')[0];
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('last_credit_refresh_date')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error checking daily bonus:", profileError);
        return;
      }

      const lastBonusDate = profile?.last_credit_refresh_date 
        ? new Date(profile.last_credit_refresh_date).toISOString().split('T')[0]
        : null;
      
      // If no bonus found for today, award the login bonus
      if (lastBonusDate !== today) {
        const loginBonusAmount = 2;
        const success = await earnCredits(loginBonusAmount, "Daily login bonus");
        if (success) {
          // Update the last refresh date
          await supabase
            .from('profiles')
            .update({ last_credit_refresh_date: new Date().toISOString() })
            .eq('id', user.id);
            
          toast.success(`Welcome back! You received ${loginBonusAmount} credits for logging in today.`);
        }
      }
    } catch (error) {
      console.error("Error in checkDailyLoginBonus:", error);
    }
  };

  // Function to earn credits
  const earnCredits = async (amount: number, description: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Start a transaction to update both credits_balance and insert transaction record
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

      // Insert transaction record
      const transactionData: TablesInsert<'credit_transactions'> = {
        user_id: user.id,
        amount: amount,
        description: description,
        transaction_type: 'earn'
      };

      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert(transactionData);

      if (transactionError) {
        throw transactionError;
      }

      // Update local state
      setCredits(newCredits);
      
      // Refresh transactions to include the new one
      await fetchTransactions();

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
      // Start a transaction to update credits_balance and insert transaction record
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

      // Insert transaction record
      const transactionData: TablesInsert<'credit_transactions'> = {
        user_id: user.id,
        amount: amount,
        description: description,
        transaction_type: 'spend'
      };

      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert(transactionData);

      if (transactionError) {
        throw transactionError;
      }

      // Update local state
      setCredits(newCredits);
      
      // Refresh transactions to include the new one
      await fetchTransactions();

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
      // Check for daily login bonus when user logs in
      checkDailyLoginBonus();
    } else {
      setCredits(0);
      setTransactions([]);
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
        transactions,
        refreshCredits
      }}
    >
      {children}
    </CreditContext.Provider>
  );
};

// Hook for using the credit context
export const useCreditSystem = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error("useCreditSystem must be used within a CreditProvider");
  }
  return context;
}; 