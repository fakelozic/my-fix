"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Quote, Plus, X } from "lucide-react";

const DEFAULT_QUOTES = [
  "The only way to do great work is to love what you do.",
  "Focus is about saying no.",
  "Your future is created by what you do today, not tomorrow.",
  "Productivity is never an accident. It is always the result of a commitment to excellence.",
  "It's not that I'm so smart, it's just that I stay with problems longer.",
];

export function QuotesWidget() {
  const [quotes, setQuotes] = useState<string[]>([]);
  const [displayQuotes, setDisplayQuotes] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuote, setNewQuote] = useState("");

  const refreshDisplay = (sourceQuotes: string[]) => {
    if (sourceQuotes.length === 0) return;
    const shuffled = [...sourceQuotes].sort(() => 0.5 - Math.random());
    setDisplayQuotes(shuffled.slice(0, 2));
  };

  useEffect(() => {
    const saved = localStorage.getItem("focusflow-quotes");
    const loadedQuotes = saved ? JSON.parse(saved) : DEFAULT_QUOTES;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuotes(loadedQuotes);
    
    // Pick 2 random
    refreshDisplay(loadedQuotes);
  }, []);

  const handleAddQuote = () => {
    if (!newQuote.trim()) return;
    const updated = [...quotes, newQuote.trim()];
    setQuotes(updated);
    localStorage.setItem("focusflow-quotes", JSON.stringify(updated));
    setNewQuote("");
    setIsAdding(false);
    refreshDisplay(updated); // Refresh to potentially show new quote
  };

  return (
    <Card className="bg-background/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Quote className="w-5 h-5 text-primary" />
          Daily Inspiration
        </CardTitle>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsAdding(!isAdding)}
            className="gap-1"
        >
            <Plus className="w-4 h-4" /> Add Quote
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 justify-center">
        {isAdding && (
            <div className="flex gap-2 animate-in slide-in-from-top-2">
                <Input 
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    placeholder="Enter your quote..."
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuote()}
                />
                <Button onClick={handleAddQuote} size="sm">Save</Button>
                <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayQuotes.map((q, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 rounded-lg bg-muted/30 border border-border/50 italic text-muted-foreground relative">
                    <span className="text-3xl text-primary/20 absolute -top-2 -left-2">“</span>
                    <p className="z-10 relative">{q}</p>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
