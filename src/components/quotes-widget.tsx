"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Quote as QuoteIcon, Plus, X, List, Trash2 } from "lucide-react";
import { getDailyQuotes, getQuotes, addQuote, deleteQuote } from "@/app/actions";
import { Quote } from "@/db/schema";
import { toast } from "sonner";

type OptimisticAction = 
  | { type: "add"; payload: Partial<Quote> }
  | { type: "delete"; payload: { id: number } };

export function QuotesWidget() {
  const [displayQuotes, setDisplayQuotes] = useState<Quote[]>([]);
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [newQuote, setNewQuote] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [optimisticAllQuotes, addOptimisticQuote] = useOptimistic(
    allQuotes,
    (state: Quote[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [
            ...state,
            {
              ...action.payload,
              id: Math.random(),
              createdAt: new Date(),
            } as Quote,
          ];
        case "delete":
          return state.filter((q) => q.id !== action.payload.id);
        default:
          return state;
      }
    }
  );

  const fetchDaily = async () => {
    try {
        const quotes = await getDailyQuotes();
        setDisplayQuotes(quotes);
    } catch (e) {
        console.error("Failed to fetch daily quotes", e);
    } finally {
        setLoading(false);
    }
  };

  const fetchAll = async () => {
    try {
        const quotes = await getQuotes();
        setAllQuotes(quotes);
    } catch (e) {
        console.error("Failed to fetch all quotes", e);
    }
  };

  useEffect(() => {
    fetchDaily();

    // Check every minute if the hour has changed to rotate quotes
    let lastHour = new Date().getHours();
    const interval = setInterval(() => {
        const currentHour = new Date().getHours();
        if (currentHour !== lastHour) {
            lastHour = currentHour;
            fetchDaily();
        }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isManaging) {
        fetchAll();
    }
  }, [isManaging]);

  const handleAddQuote = async () => {
    if (!newQuote.trim()) return;
    
    const text = newQuote.trim();
    setNewQuote("");
    setIsAdding(false);
    
    startTransition(async () => {
        addOptimisticQuote({ type: "add", payload: { text } });
        const formData = new FormData();
        formData.append("text", text);
        
        const result = await addQuote(formData);
        if (result?.error) {
            toast.error(result.error);
        } else {
            // Refresh lists on success
            await fetchDaily();
            if (isManaging) await fetchAll();
        }
    });
  };

  const handleDeleteQuote = async (id: number) => {
    startTransition(async () => {
        addOptimisticQuote({ type: "delete", payload: { id } });
        const result = await deleteQuote(id);
        if (result?.error) {
            toast.error(result.error);
        } else {
            await fetchAll();
            await fetchDaily();
        }
    });
  };

  return (
    <Card className="bg-background/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <QuoteIcon className="w-5 h-5 text-primary" />
          Daily Inspiration
        </CardTitle>
        <div className="flex gap-1">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setIsManaging(!isManaging); setIsAdding(false); }}
                className="gap-1"
                title="Manage List"
            >
                <List className="w-4 h-4" />
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setIsAdding(!isAdding); setIsManaging(false); }}
                className="gap-1"
                title="Add Quote"
            >
                <Plus className="w-4 h-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 justify-center">
        {isAdding && (
            <div className="flex gap-2 animate-in slide-in-from-top-2 mb-2">
                <Input 
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    placeholder="Enter your quote..."
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuote()}
                />
                <Button onClick={handleAddQuote} size="sm" disabled={isPending}>Save</Button>
                <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
        )}

        {isManaging ? (
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2">
                {optimisticAllQuotes.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">No quotes saved.</p>
                ) : (
                    optimisticAllQuotes.map((q) => (
                        <div key={q.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 border text-sm group">
                            <span className="flex-1 truncate">{q.text}</span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteQuote(q.id)}
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                disabled={isPending}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        ) : (
            displayQuotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-4 text-muted-foreground opacity-50">
                    <p className="text-2xl font-serif">...</p>
                    <p className="text-xs">{loading ? "Loading..." : "Add a quote for inspiration"}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayQuotes.map((q) => (
                        <div key={q.id} className="flex flex-col gap-2 p-4 rounded-lg bg-muted/30 border border-border/50 italic text-muted-foreground relative">
                            <span className="text-3xl text-primary/20 absolute -top-2 -left-2">“</span>
                            <p className="z-10 relative">{q.text}</p>
                        </div>
                    ))}
                </div>
            )
        )}
      </CardContent>
    </Card>
  );
}