import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, RefreshCw, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const moodEmojis = {
  neutral: '😐',
  smirk: '😏',
  eyeroll: '🙄',
  loving: '🥰',
  sassy: '💅',
  thinking: '🤔',
  surprised: '😲',
  concerned: '😟',
  flirty: '😘'
};

const DailySummary = ({ isOpen, onClose }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/daily-summary`);
      setSummaryData(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
    }
  }, [isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };

  const totalMoodCount = summaryData?.mood_breakdown 
    ? Object.values(summaryData.mood_breakdown).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md glass z-50 rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
            data-testid="daily-summary"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-secondary" />
                <h2 
                  className="text-xl font-bold text-gradient-primary"
                  style={{ fontFamily: 'Unbounded, sans-serif' }}
                >
                  Daily Summary
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchSummary}
                  disabled={loading}
                  className="rounded-full"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {loading && !summaryData ? (
                <div className="py-12 text-center">
                  <div className="animate-pulse text-4xl mb-4">📊</div>
                  <p className="text-muted-foreground">Generating summary...</p>
                </div>
              ) : summaryData ? (
                <>
                  {/* Date */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{formatDate(summaryData.date)}</span>
                  </div>
                  
                  {/* AI Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-primary/10 border border-primary/20"
                  >
                    <p className="text-sm italic leading-relaxed">
                      "{summaryData.ai_summary}"
                    </p>
                    <p className="text-xs text-primary mt-2 text-right">— Anjhelika</p>
                  </motion.div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-card border border-border text-center">
                      <MessageSquare className="h-6 w-6 mx-auto mb-1 text-primary" />
                      <div className="text-2xl font-bold">{summaryData.message_count}</div>
                      <div className="text-xs text-muted-foreground">Messages Today</div>
                    </div>
                    <div className="p-3 rounded-lg bg-card border border-border text-center">
                      <div className="text-3xl mb-1">
                        {moodEmojis[summaryData.dominant_mood] || '😊'}
                      </div>
                      <div className="text-sm font-medium capitalize">{summaryData.dominant_mood}</div>
                      <div className="text-xs text-muted-foreground">Dominant Mood</div>
                    </div>
                  </div>
                  
                  {/* Mood Breakdown */}
                  {Object.keys(summaryData.mood_breakdown).length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Today's Moods
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(summaryData.mood_breakdown)
                          .sort(([,a], [,b]) => b - a)
                          .map(([mood, count]) => (
                            <div key={mood} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span>{moodEmojis[mood] || '😊'}</span>
                                  <span className="capitalize">{mood}</span>
                                </span>
                                <span className="text-muted-foreground">{count}</span>
                              </div>
                              <Progress 
                                value={(count / totalMoodCount) * 100} 
                                className="h-1.5"
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* All-time stat */}
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">
                      Total conversations all-time: <span className="font-bold text-foreground">{summaryData.total_all_time}</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DailySummary;
