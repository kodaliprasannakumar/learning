
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CREDIT_COSTS, CREDIT_REWARDS } from '@/constants';

interface CreditContextType {
  credits: number;
  loading: boolean;
  spendCredits: (amount: number, description: string) => Promise<boolean>;
  earnCredits: (amount: number, description: string) => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const useCreditSystem = () => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCreditSystem must be used within a CreditProvider');
  }
  return context;
};

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user credits
  const refreshCredits = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('amount')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalCredits = data?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
      setCredits(Math.max(0, totalCredits));
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Spend credits
  const spendCredits = async (amount: number, description: string): Promise<boolean> => {
    if (!user || credits < amount) {
      toast({
        title: "Oops! 😅",
        description: "You need more stars to do this! Try earning some by playing games!",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          transaction_type: 'spent',
          description,
        });

      if (error) throw error;

      setCredits(prev => prev - amount);
      
      toast({
        title: "✨ Magic Used!",
        description: `You spent ${amount} stars on ${description}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error spending credits:', error);
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again!",
        variant: "destructive",
      });
      return false;
    }
  };

  // Earn credits
  const earnCredits = async (amount: number, description: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount,
          transaction_type: 'earned',
          description,
        });

      if (error) throw error;

      setCredits(prev => prev + amount);
      
      toast({
        title: "🌟 Stars Earned!",
        description: `You earned ${amount} stars for ${description}!`,
      });
    } catch (error) {
      console.error('Error earning credits:', error);
    }
  };

  // Load credits when user changes
  useEffect(() => {
    if (user) {
      refreshCredits();
      
      // Give new users some starting credits
      earnCredits(CREDIT_REWARDS.PROFILE_SETUP, 'joining Wizzle');
    } else {
      setCredits(0);
      setLoading(false);
    }
  }, [user]);

  const value = {
    credits,
    loading,
    spendCredits,
    earnCredits,
    refreshCredits,
  };

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
};
