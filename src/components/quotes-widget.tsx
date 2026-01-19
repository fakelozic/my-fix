"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Quote as QuoteIcon, Plus, X, List, Trash2 } from "lucide-react";
import { getDailyQuotes, getQuotes, addQuote, deleteQuote } from "@/app/actions";
import { Quote } from "@/db/schema";

export function QuotesWidget() {
  const [displayQuotes, setDisplayQuotes] = useState<Quote[]>([]);
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [newQuote, setNewQuote] = useState("");
  const [loading, setLoading] = useState(true);

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
  }, []);

  useEffect(() => {
    if (isManaging) {
        fetchAll();
    }
  }, [isManaging]);

  const handleAddQuote = async () => {
    if (!newQuote.trim()) return;
    
    const formData = new FormData();
    formData.append("text", newQuote.trim());
    
    await addQuote(formData);
    
    setNewQuote("");
    setIsAdding(false);
    
    // Refresh lists
    await fetchDaily();
    if (isManaging) await fetchAll();
  };

  const handleDeleteQuote = async (id: number) => {
    await deleteQuote(id);
    await fetchAll();
    await fetchDaily(); // Update display if the deleted one was shown
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
                <Button onClick={handleAddQuote} size="sm">Save</Button>
                <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
        )}

        {isManaging ? (
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2">
                {allQuotes.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">No quotes saved.</p>
                ) : (
                    allQuotes.map((q) => (
                        <div key={q.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 border text-sm group">
                            <span className="flex-1 truncate">{q.text}</span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteQuote(q.id)}
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
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