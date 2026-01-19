"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Coffee, Brain, Settings2, Plus, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerMode = "focus30" | "focus60" | "shortBreak" | "custom";

interface ModeConfig {
  label: string;
  minutes: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const MODES: Record<TimerMode, ModeConfig> = {
  focus30: { label: "30m Focus", minutes: 30, icon: Brain, color: "text-red-500", bgColor: "bg-red-500/10" },
  focus60: { label: "60m Focus", minutes: 60, icon: Brain, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  shortBreak: { label: "Short Break", minutes: 5, icon: Coffee, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  custom: { label: "Custom", minutes: 15, icon: Settings2, color: "text-orange-500", bgColor: "bg-orange-500/10" },
};

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("focus30");
  const [customMinutes, setCustomMinutes] = useState(15);
  const [timeLeft, setTimeLeft] = useState(MODES.focus30.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const resetTimer = useCallback((newMode: TimerMode = mode) => {
    setIsActive(false);
    setMode(newMode);
    const mins = newMode === "custom" ? customMinutes : MODES[newMode].minutes;
    setTimeLeft(mins * 60);
    setShowCompletionModal(false);
  }, [mode, customMinutes]);

  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      
      const audioContext = new AudioCtx();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsActive(false);
      setShowCompletionModal(true);
      playNotificationSound();
      if (Notification.permission === "granted") {
        new Notification("Time's up!", { body: `${MODES[mode].label} session finished.` });
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, playNotificationSound]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentTotalMinutes = mode === "custom" ? customMinutes : MODES[mode].minutes;
  const totalSeconds = currentTotalMinutes * 60;
  const percentageLeft = (timeLeft / totalSeconds) * 100;

  const getCompletionMessage = () => {
    switch (mode) {
      case "focus30":
      case "focus60":
        return {
          title: "Session Complete!",
          body: "Amazing work! You've made great progress. Time for a well-deserved break.",
        };
      case "shortBreak":
        return {
          title: "Rest Up!",
          body: "Hope you enjoyed your break! Ready to tackle the next challenge?",
        };
      case "custom":
        return {
          title: "Great Job!",
          body: "You've successfully finished your custom session. Keep that momentum going!",
        };
      default:
        return { title: "Well Done!", body: "Session completed successfully." };
    }
  };

  const completion = getCompletionMessage();

  return (
    <>
      <Card className="relative w-full max-w-md mx-auto overflow-hidden bg-background/50 backdrop-blur-sm border-2 z-0">
        {/* Subtle Background Shade */}
        <div 
          className={cn("absolute bottom-0 left-0 right-0 z-0 transition-all duration-1000 ease-linear", MODES[mode].bgColor)}
          style={{ height: `${percentageLeft}%` }}
        />

        <div className="relative z-10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {(() => {
                const Icon = MODES[mode].icon;
                return <Icon className={cn("w-5 h-5", MODES[mode].color)} />;
              })()}
              {MODES[mode].label}
            </CardTitle>
            <div className="flex gap-1">
              {(Object.keys(MODES) as TimerMode[]).map((m) => (
                <Button
                  key={m}
                  variant={mode === m ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => resetTimer(m)}
                  className={cn("rounded-full", mode === m && "bg-muted")}
                  title={MODES[m].label}
                >
                  <span className={cn("w-2 h-2 rounded-full bg-current", MODES[m].color)} />
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            {mode === "custom" && !isActive && (
              <div className="flex items-center gap-3 mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    const val = Math.max(1, customMinutes - 1);
                    setCustomMinutes(val);
                    setTimeLeft(val * 60);
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="w-16 text-center font-mono text-2xl font-bold tabular-nums">
                  {customMinutes}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    const val = Math.min(120, customMinutes + 1);
                    setCustomMinutes(val);
                    setTimeLeft(val * 60);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="text-8xl font-mono tracking-tighter tabular-nums font-bold text-foreground">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <Button 
                size="lg" 
                className={cn("w-32 h-12 text-lg rounded-full shadow-lg transition-transform active:scale-95",
                  isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-primary hover:bg-primary/90"
                )}
                onClick={toggleTimer}
              >
                {isActive ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" /> Start
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon-lg" 
                onClick={() => resetTimer()}
                className="rounded-full border-2"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300 flex flex-col items-center gap-6 text-center">
            <div className={cn("p-4 rounded-full bg-muted", MODES[mode].color)}>
               {(() => {
                const Icon = MODES[mode].icon;
                return <Icon className="w-12 h-12" />;
              })()}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{completion.title}</h2>
              <p className="text-muted-foreground">
                {completion.body}
              </p>
            </div>
            <Button size="lg" className="w-full" onClick={() => setShowCompletionModal(false)}>
              Keep it up!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}