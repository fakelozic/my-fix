"use client";

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Coffee, Brain, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerMode = "focus30" | "focus60" | "shortBreak";

interface ModeConfig {
  label: string;
  minutes: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export interface PomodoroTimerRef {
  startSession: (mode: TimerMode) => void;
  stopSession: () => void;
}

const MODES: Record<TimerMode, ModeConfig> = {
  focus30: { label: "30m Focus", minutes: 30, icon: Brain, color: "text-red-500", bgColor: "bg-red-500/10" },
  focus60: { label: "60m Focus", minutes: 60, icon: Brain, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  shortBreak: { label: "Short Break", minutes: 5, icon: Coffee, color: "text-blue-500", bgColor: "bg-blue-500/10" },
};

export const PomodoroTimer = forwardRef<PomodoroTimerRef>((props, ref) => {
  const [mode, setMode] = useState<TimerMode>("focus30");
  const [timeLeft, setTimeLeft] = useState(MODES.focus30.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const startSession = useCallback((selectedMode: TimerMode) => {
    setMode(selectedMode);
    const mins = MODES[selectedMode].minutes;
    setTimeLeft(mins * 60);
    setIsRunning(true);
    setIsSessionActive(true);
    setShowCompletionModal(false);
  }, []);

  const stopSession = useCallback(() => {
    setIsRunning(false);
    setIsSessionActive(false);
  }, []);

  useImperativeHandle(ref, () => ({
    startSession,
    stopSession
  }));

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

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRunning(false);
      setShowCompletionModal(true);
      playNotificationSound();
      if (Notification.permission === "granted") {
        new Notification("Time's up!", { body: `${MODES[mode].label} session finished.` });
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, playNotificationSound]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const toggleTimer = () => setIsRunning(!isRunning);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentTotalMinutes = MODES[mode].minutes;
  const totalSeconds = currentTotalMinutes * 60;
  const percentageCompleted = ((totalSeconds - timeLeft) / totalSeconds) * 100;

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
      default:
        return { title: "Well Done!", body: "Session completed successfully." };
    }
  };

  const completion = getCompletionMessage();

  if (!isSessionActive) {
    return (
      <Card className="w-full h-full min-h-[300px] flex flex-col justify-center p-4 gap-y-4 bg-background/50 backdrop-blur-sm border-2">
        <div className="flex flex-col gap-3 flex-1 justify-center">
            <Button 
                variant="outline"
                className="h-24 text-2xl font-bold flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => startSession("focus30")}
            >
                <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                    30m Focus
                </div>
                <span className="text-xs font-normal text-muted-foreground">Quick session for momentum</span>
            </Button>
            
            <Button 
                variant="outline"
                className="h-24 text-2xl font-bold flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => startSession("focus60")}
            >
                <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
                    60m Focus
                </div>
                 <span className="text-xs font-normal text-muted-foreground">Deep work block</span>
            </Button>

            <Button 
                variant="outline"
                className="h-16 text-lg font-bold flex flex-col gap-1 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => startSession("shortBreak")}
            >
                <div className="flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    Short Break
                </div>
            </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="relative w-full h-full min-h-[300px] flex flex-col mx-auto overflow-hidden bg-background/50 backdrop-blur-sm border-2 z-0">
        {/* Subtle Background Shade */}
        <div 
          className={cn("absolute bottom-0 left-0 right-0 z-0 transition-all duration-1000 ease-linear", MODES[mode].bgColor)}
          style={{ height: `${percentageCompleted}%` }}
        />

        <div className="relative z-10 flex-1 flex flex-col p-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              {(() => {
                const Icon = MODES[mode].icon;
                return <Icon className={cn("w-5 h-5", MODES[mode].color)} />;
              })()}
              {MODES[mode].label}
            </CardTitle>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={stopSession}
                title="Cancel Session"
            >
                <RotateCcw className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
            <div className="text-7xl font-mono tracking-tighter tabular-nums font-bold text-foreground">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                size="lg" 
                className={cn("w-36 h-12 text-lg rounded-full shadow-lg transition-transform active:scale-95",
                  isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-primary hover:bg-primary/90"
                )}
                onClick={toggleTimer}
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" /> Resume
                  </>
                )}
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
});
PomodoroTimer.displayName = "PomodoroTimer";
