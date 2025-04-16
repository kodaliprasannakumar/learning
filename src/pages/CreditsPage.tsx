import { useState } from 'react';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, TrendingUp, Clock, Gift, ChevronRight, Calendar, Star, Puzzle, Lightbulb } from 'lucide-react';

export default function CreditsPage() {
  const { credits, transactions } = useCreditSystem();
  const [activeTab, setActiveTab] = useState('history');
  
  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.created_at).toISOString().split('T')[0];
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort().reverse();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-amber-700 text-transparent bg-clip-text pb-2">
          Credits & Rewards
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Earn credits by completing activities and use them to unlock special features!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card className="col-span-1 md:col-span-2 bg-amber-50/70 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Coins className="h-5 w-5 text-amber-500" />
              Your Credit Balance
            </CardTitle>
            <CardDescription>
              Your credits can be used to access special AI features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-8 bg-white/60 rounded-xl shadow-sm">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 flex items-center justify-center shadow-inner">
                  <Coins className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-4xl font-bold text-amber-600">
                    {credits}
                  </h3>
                  <p className="text-muted-foreground">Available Credits</p>
                </div>
              </div>
              
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Gift className="mr-2 h-4 w-4" />
                Daily Bonus Available
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 bg-gradient-to-br from-amber-50 to-amber-100/30 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Star className="h-5 w-5 text-amber-500" />
              Credit Stats
            </CardTitle>
            <CardDescription>
              Your credit activity overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">This Month</span>
                </div>
                <span className="font-bold text-lg">+{transactions.filter(tx => 
                  tx.transaction_type === 'earn' && 
                  new Date(tx.created_at).getMonth() === new Date().getMonth()
                ).reduce((sum, tx) => sum + tx.amount, 0)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Earned Total</span>
                </div>
                <span className="font-bold text-lg">+{transactions.filter(tx => 
                  tx.transaction_type === 'earn'
                ).reduce((sum, tx) => sum + tx.amount, 0)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium">Spent Total</span>
                </div>
                <span className="font-bold text-lg">-{transactions.filter(tx => 
                  tx.transaction_type === 'spend'
                ).reduce((sum, tx) => sum + tx.amount, 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="earn">Ways to Earn</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
          {sortedDates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Coins className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
              <p className="text-sm">Start using the app to earn and spend credits!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedDates.map(date => (
                <div key={date}>
                  <div className="px-6 py-3 bg-gray-50/50">
                    <h3 className="text-sm font-medium text-gray-500">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {groupedTransactions[date].map(transaction => (
                      <div key={transaction.id} className="p-4 hover:bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.transaction_type === 'earn' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-500'
                            }`}>
                              {transaction.transaction_type === 'earn' 
                                ? <TrendingUp className="h-5 w-5" /> 
                                : <Clock className="h-5 w-5" />}
                            </div>
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`font-bold ${
                            transaction.transaction_type === 'earn' 
                              ? 'text-green-600' 
                              : 'text-red-500'
                          }`}>
                            {transaction.transaction_type === 'earn' ? '+' : '-'}{transaction.amount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="earn" className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 text-amber-800">Ways to Earn Credits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/80 hover:bg-white/100 transition-colors">
              <CardContent className="p-4 flex gap-4">
                <div className="p-3 bg-green-100 rounded-xl h-fit">
                  <Coins className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-700 flex items-center justify-between">
                    Daily Login
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">+5 Credits</Badge>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Log in every day to receive your daily bonus
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 hover:bg-white/100 transition-colors">
              <CardContent className="p-4 flex gap-4">
                <div className="p-3 bg-blue-100 rounded-xl h-fit">
                  <Puzzle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-700 flex items-center justify-between">
                    Complete Puzzles
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">+3 Credits</Badge>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Each completed puzzle rewards you with credits
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 hover:bg-white/100 transition-colors">
              <CardContent className="p-4 flex gap-4">
                <div className="p-3 bg-purple-100 rounded-xl h-fit">
                  <Lightbulb className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-700 flex items-center justify-between">
                    Complete Quotes
                    <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">+2 Credits</Badge>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Fill in the missing words in daily quotes
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 hover:bg-white/100 transition-colors">
              <CardContent className="p-4 flex gap-4">
                <div className="p-3 bg-amber-100 rounded-xl h-fit">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-700 flex items-center justify-between">
                    Save Creations
                    <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">+2-3 Credits</Badge>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Save doodles and stories to earn bonus credits
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Separator className="my-6" />
          
          <h2 className="text-xl font-bold mb-4 text-amber-800">How to Spend Credits</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Coins className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">Generate AI Images</h3>
                  <p className="text-sm text-gray-500">Turn doodles into detailed illustrations</p>
                </div>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">5 Credits</Badge>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Coins className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">Generate Stories</h3>
                  <p className="text-sm text-gray-500">Create interactive AI stories</p>
                </div>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">5 Credits</Badge>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Coins className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">Quote Explanations</h3>
                  <p className="text-sm text-gray-500">Get AI explanations for inspirational quotes</p>
                </div>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">2 Credits</Badge>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Coins className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">Story Illustrations</h3>
                  <p className="text-sm text-gray-500">Create illustrations for your stories</p>
                </div>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">3 Credits</Badge>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 