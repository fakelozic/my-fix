"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, StickyNote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Note {
  id: string;
  text: string;
  color: string;
}

const COLORS = [
  "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  "bg-pink-100 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
];

export function StickyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("focusflow-sticky-notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load notes", e);
      }
    } else {
        // Default note
        setNotes([{ id: "1", text: "Welcome to Sticky Notes!", color: COLORS[0] }]);
    }
  }, []);

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem("focusflow-sticky-notes", JSON.stringify(newNotes));
  };

  const addNote = () => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newNote = { id: Date.now().toString(), text: "", color };
    saveNotes([...notes, newNote]);
  };

  const updateNote = (id: string, text: string) => {
    const newNotes = notes.map(n => n.id === id ? { ...n, text } : n);
    saveNotes(newNotes);
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter(n => n.id !== id));
  };

  return (
    <Card className="h-full bg-background/50 backdrop-blur-sm border-none shadow-none flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-primary" />
          Sticky Notes
        </CardTitle>
        <Button size="sm" variant="outline" onClick={addNote} className="gap-1 h-8">
          <Plus className="w-3 h-3" /> New Note
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
          {notes.map((note) => (
            <div 
              key={note.id} 
              className={`relative p-3 rounded-lg border shadow-sm min-h-[150px] flex flex-col group transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:z-10 ${note.color}`}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 dark:hover:bg-white/10"
                onClick={() => deleteNote(note.id)}
              >
                <X className="w-3 h-3" />
              </Button>
              <Textarea
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value)}
                placeholder="Type here..."
                className="flex-1 resize-none border-none bg-transparent focus-visible:ring-0 p-0 text-sm leading-relaxed"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
