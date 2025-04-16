import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [credits, setCredits] = useState<number>(50); // Default starting credits
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  
  // Local storage key for credits
  const getLocalStorageKey = () => {
    return user ? `doodle_credits_${user.id}` : null;
  };

  // Function to fetch user's credit balance from local storage
  const fetchCredits = async () => {
    if (!user) {
      setCredits(0);
      setIsLoading(false);
      return;
    }

    try {
      const key = getLocalStorageKey();
      if (!key) return;
      
      const savedCredits = localStorage.getItem(key);
      if (savedCredits) {
        setCredits(parseInt(savedCredits, 10));
      }
    } catch (error) {
      console.error("Error in fetchCredits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save credits to local storage
  const saveCredits = (newAmount: number) => {
    const key = getLocalStorageKey();
    if (!key) return;
    
    localStorage.setItem(key, newAmount.toString());
    setCredits(newAmount);
  };

  // Function to fetch user's transaction history from local storage
  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const key = `${getLocalStorageKey()}_transactions`;
      if (!key) return;
      
      const savedTransactions = localStorage.getItem(key);
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.error("Error in fetchTransactions:", error);
    }
  };

  // Save transactions to local storage
  const saveTransactions = (newTransactions: CreditTransaction[]) => {
    const key = `${getLocalStorageKey()}_transactions`;
    if (!key) return;
    
    localStorage.setItem(key, JSON.stringify(newTransactions));
    setTransactions(newTransactions);
  };

  // Combined refresh function
  const refreshCredits = async () => {
    setIsLoading(true);
    await fetchCredits();
    await fetchTransactions();
    setIsLoading(false);
  };

  // Function to check for daily login bonus
  const checkDailyLoginBonus = async () => {
    if (!user) return;

    try {
      // Check if the user already got a login bonus today
      const today = new Date().toISOString().split('T')[0];
      const lastBonusKey = `${getLocalStorageKey()}_last_bonus`;
      if (!lastBonusKey) return;
      
      const lastBonusDate = localStorage.getItem(lastBonusKey);
      
      // If no bonus found for today, award the login bonus
      if (lastBonusDate !== today) {
        const loginBonusAmount = 5;
        const success = await earnCredits(loginBonusAmount, "Daily login bonus");
        if (success) {
          localStorage.setItem(lastBonusKey, today);
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
      // Update credits
      const newCredits = credits + amount;
      saveCredits(newCredits);
      
      // Create transaction record
      const newTransaction: CreditTransaction = {
        id: crypto.randomUUID(),
        user_id: user.id,
        amount: amount,
        description: description,
        transaction_type: 'earn',
        created_at: new Date().toISOString()
      };
      
      // Add to transaction history
      const updatedTransactions = [newTransaction, ...transactions];
      saveTransactions(updatedTransactions);

      return true;
    } catch (error) {
      console.error("Error in earnCredits:", error);
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
      // Update credits
      const newCredits = credits - amount;
      saveCredits(newCredits);
      
      // Create transaction record
      const newTransaction: CreditTransaction = {
        id: crypto.randomUUID(),
        user_id: user.id,
        amount: amount,
        description: description,
        transaction_type: 'spend',
        created_at: new Date().toISOString()
      };
      
      // Add to transaction history
      const updatedTransactions = [newTransaction, ...transactions];
      saveTransactions(updatedTransactions);

      return true;
    } catch (error) {
      console.error("Error in spendCredits:", error);
      return false;
    }
  };

  // Load credits when user changes
  useEffect(() => {
    fetchCredits();
    fetchTransactions();
    
    // Check for daily login bonus when user logs in
    if (user) {
      checkDailyLoginBonus();
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