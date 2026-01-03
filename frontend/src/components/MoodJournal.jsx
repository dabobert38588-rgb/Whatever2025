import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
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

const moodColors = {
  neutral: 'bg-gray-500',
  smirk: 'bg-purple-500',
  eyeroll: 'bg-amber-500',
  loving: 'bg-pink-500',
  sassy: 'bg-fuchsia-500',
  thinking: 'bg-blue-500',
  surprised: 'bg-cyan-500',
  concerned: 'bg-orange-500',
  flirty: 'bg-red-500'
};

const MoodJournal = ({ isOpen, onClose }) => {
  const [journalData, setJournalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJournalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API}/mood-journal`);
      setJournalData(response.data);
    } catch (err) {
      setError('Failed to load mood journal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchJournalData();
    }
  }, [isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            data-testid="mood-journal-backdrop"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[80vh] glass z-50 rounded-t-3xl overflow-hidden"
            data-testid="mood-journal-panel"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 
                    className="text-2xl font-bold text-gradient-primary flex items-center gap-2"
                    style={{ fontFamily: 'Unbounded, sans-serif' }}
                  >
                    <Sparkles className="h-6 w-6" />
                    Mood Journal
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track how Anjhelika's been feeling
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchJournalData}
                    disabled={loading}
                    className="rounded-full"
                    data-testid="refresh-journal"
                  >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full"
                    data-testid="close-journal"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                {loading && !journalData ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-muted-foreground">Loading mood data...</div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-destructive">{error}</div>
                  </div>
                ) : journalData ? (
                  <div className="space-y-8 max-w-2xl mx-auto">
                    {/* Commentary */}
                    {journalData.commentary && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-xl bg-primary/10 border border-primary/20 text-center"
                      >
                        <p className="text-lg italic">"{journalData.commentary}"</p>
                        <p className="text-xs text-muted-foreground mt-2">— Anjhelika</p>
                      </motion.div>
                    )}

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-card border border-border text-center">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="text-3xl font-bold">{journalData.total_responses}</div>
                        <div className="text-xs text-muted-foreground">Total Responses</div>
                      </div>
                      <div className="p-4 rounded-lg bg-card border border-border text-center">
                        <div className="text-4xl mb-2">
                          {Object.keys(journalData.mood_stats).length > 0 
                            ? moodEmojis[Object.keys(journalData.mood_stats)[0]] || '😊'
                            : '😊'}
                        </div>
                        <div className="text-sm font-medium capitalize">
                          {Object.keys(journalData.mood_stats)[0] || 'No data'}
                        </div>
                        <div className="text-xs text-muted-foreground">Top Mood</div>
                      </div>
                    </div>

                    {/* Mood Distribution */}
                    {Object.keys(journalData.mood_stats).length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Mood Distribution
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(journalData.mood_stats).map(([mood, data]) => (
                            <motion.div
                              key={mood}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="space-y-1"
                            >
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span className="text-lg">{moodEmojis[mood] || '😊'}</span>
                                  <span className="capitalize">{mood}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  {data.count} ({data.percentage}%)
                                </span>
                              </div>
                              <Progress 
                                value={data.percentage} 
                                className="h-2"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Moods */}
                    {journalData.recent_moods?.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Recent Moods
                        </h3>
                        <div className="space-y-2">
                          {journalData.recent_moods.slice(0, 10).map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                            >
                              <div className={`w-10 h-10 rounded-full ${moodColors[item.mood] || 'bg-gray-500'} flex items-center justify-center text-xl`}>
                                {moodEmojis[item.mood] || '😊'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{item.preview}...</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(item.timestamp)}
                                </p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">
                                {item.mood}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No data state */}
                    {journalData.total_responses === 0 && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-lg font-semibold mb-2">No mood data yet</h3>
                        <p className="text-muted-foreground text-sm">
                          Start chatting with Anjhelika to track her moods!
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MoodJournal;
