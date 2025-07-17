import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Film, 
  Music, 
  BookOpen, 
  Utensils, 
  Shirt,
  Heart,
  X,
  Bookmark,
  Sparkles,
  TrendingUp,
  Brain,
  RefreshCw,
  LogIn
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useUserProgress } from "@/hooks/useUserProgress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DiscomfortItem {
  id: string;
  domain: string;
  title: string;
  description: string;
  difficulty: number;
  image_url: string;
  reason: string;
  cultural_context: string;
  metadata?: any;
  external_id?: string;
}

const mockDiscomfortItems: DiscomfortItem[] = [
  {
    id: "1",
    domain: "film",
    title: "The Tree of Life",
    description: "Terrence Malick's experimental meditation on existence",
    difficulty: 4,
    image_url: "https://images.unsplash.com/photo-1489599651372-014db5c0d3d2?w=400",
    reason: "You enjoy fast-paced Marvel films - this will slow down your perception of time and build patience for visual poetry.",
    cultural_context: "American experimental cinema"
  },
  {
    id: "2", 
    domain: "music",
    title: "Aphex Twin - Selected Ambient Works",
    description: "Pioneering electronic ambient compositions",
    difficulty: 3,
    image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    reason: "Since you prefer pop music, this will expand your appreciation for abstract soundscapes and experimental rhythm.",
    cultural_context: "British electronic avant-garde"
  },
  {
    id: "3",
    domain: "food",
    title: "Natto (Fermented Soybeans)",
    description: "Traditional Japanese breakfast with unique texture",
    difficulty: 5,
    image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400",
    reason: "You love comfort food - this challenging texture will reset your relationship with familiar flavors.",
    cultural_context: "Japanese traditional cuisine"
  },
  {
    id: "4",
    domain: "fashion",
    title: "Avant-Garde Asymmetrical Jacket",
    description: "Rei Kawakubo-inspired deconstructed silhouette",
    difficulty: 4,
    image_url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400",
    reason: "Your casual style preferences make this architectural approach to clothing a perfect discomfort zone.",
    cultural_context: "Japanese conceptual fashion"
  }
];

const getDomainIcon = (domain: string) => {
  const icons: Record<string, any> = {
    film: Film,
    music: Music,
    food: Utensils,
    fashion: Shirt,
    books: BookOpen
  };
  return icons[domain] || Sparkles;
};

const getDifficultyColor = (difficulty: number) => {
  const colors = [
    "text-green-400",
    "text-yellow-400", 
    "text-orange-400",
    "text-red-400",
    "text-purple-400"
  ];
  return colors[difficulty - 1] || colors[0];
};

const DiscomfortDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { progress, trackProgress, profile } = useUserProgress();
  const { toast } = useToast();
  const [items, setItems] = useState<DiscomfortItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to auth if not logged in
      navigate('/auth');
      return;
    }

    if (user) {
      loadRecommendations();
    }
  }, [user, authLoading, navigate]);

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      setLoadingRecommendations(true);

      // First try to load existing recommendations
      const { data: existingRecs, error: fetchError } = await supabase
        .from('content_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        console.error('Error fetching recommendations:', fetchError);
      }

      if (existingRecs && existingRecs.length > 0) {
        const formattedItems = existingRecs.map(rec => ({
          id: rec.id,
          domain: rec.domain,
          title: rec.title,
          description: rec.description || '',
          difficulty: rec.difficulty || 3,
          image_url: rec.image_url || '',
          reason: rec.reason || '',
          cultural_context: rec.cultural_context || '',
          metadata: rec.metadata,
          external_id: rec.external_id
        }));
        setItems(formattedItems);
      } else {
        // Generate new recommendations if none exist
        await generateRecommendations();
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recommendations',
        variant: 'destructive',
      });
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const generateRecommendations = async () => {
    if (!user) return;

    try {
      setIsGenerating(true);

      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: {
          userId: user.id,
          preferences: profile?.taste_preferences || {},
          domain: 'all',
          difficulty: 3
        }
      });

      if (error) {
        console.error('Error generating recommendations:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate recommendations',
          variant: 'destructive',
        });
        return;
      }

      if (data.recommendations) {
        const formattedItems = data.recommendations.map((rec: any) => ({
          id: rec.id,
          domain: rec.domain,
          title: rec.title,
          description: rec.description || '',
          difficulty: rec.difficulty || 3,
          image_url: rec.image_url || '',
          reason: rec.reason || '',
          cultural_context: rec.cultural_context || '',
          metadata: rec.metadata,
          external_id: rec.external_id
        }));
        setItems(formattedItems);
        setCurrentIndex(0);

        toast({
          title: 'Success!',
          description: 'New recommendations generated',
        });
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentItem = items[currentIndex];

  const handleAction = async (action: 'try' | 'save' | 'skip') => {
    if (!currentItem || !user) return;

    // Track the action in the database
    await trackProgress(
      currentItem.id,
      'recommendation',
      action === 'try' ? 'completed' : action === 'save' ? 'saved' : 'skipped',
      currentItem.domain,
      currentItem.difficulty,
      { action, timestamp: new Date().toISOString() }
    );

    // Move to next item
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reset to beginning or generate new recommendations
      setCurrentIndex(0);
      toast({
        title: 'All recommendations viewed!',
        description: 'Generate new ones or revisit previous challenges.',
      });
    }
  };

  if (authLoading || loadingRecommendations) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-lg text-muted-foreground">
            {authLoading ? 'Checking authentication...' : 'Loading your discomfort zone...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-card text-center max-w-md">
          <CardContent className="p-8">
            <LogIn className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your personalized discomfort dashboard and track your progress.
            </p>
            <Button onClick={() => navigate('/auth')} variant="default" size="lg">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentItem && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-card text-center max-w-md">
          <CardContent className="p-8">
            <Brain className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Ready to Generate Recommendations?</h2>
            <p className="text-muted-foreground mb-6">
              Let's create personalized discomfort challenges based on your preferences.
            </p>
            <Button 
              onClick={generateRecommendations} 
              variant="default" 
              size="lg"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                </motion.div>
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Recommendations'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentItem) {
    return null;
  }

  const Icon = getDomainIcon(currentItem.domain);

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <motion.div 
        className="max-w-4xl mx-auto mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-full bg-gradient-primary glow-primary"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Discomfort Dashboard</h1>
              <p className="text-muted-foreground">Your personalized cultural challenges</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={generateRecommendations}
              disabled={isGenerating}
              size="sm"
            >
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                </motion.div>
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'New Recommendations'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/curriculum')}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Curriculum
            </Button>
            <Button variant="ghost" onClick={() => navigate('/growth')}>
              Progress
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Challenge {currentIndex + 1} of {items.length}</span>
          <span>{progress.filter(p => p.status === 'saved').length} saved for later</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div 
            className="h-2 bg-gradient-accent rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Main Challenge Card */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass-card overflow-hidden hover-lift">
            <div className="md:flex">
              {/* Image Section */}
              <div className="md:w-1/3">
                <div className="relative h-64 md:h-full">
                  <img 
                    src={currentItem.image_url}
                    alt={currentItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/50 text-white border-0">
                      <Icon className="h-3 w-3 mr-1" />
                      {currentItem.domain}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex gap-1">
                      {Array.from({ length: currentItem.difficulty }).map((_, i) => (
                        <Flame key={i} className={`h-4 w-4 ${getDifficultyColor(currentItem.difficulty)}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="md:w-2/3 p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl mb-2">{currentItem.title}</CardTitle>
                  <p className="text-muted-foreground text-lg">
                    {currentItem.description}
                  </p>
                  <Badge variant="outline" className="w-fit">
                    {currentItem.cultural_context}
                  </Badge>
                </CardHeader>

                <CardContent className="px-0 space-y-6">
                  {/* AI Explanation */}
                  <motion.div 
                    className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-primary mb-1">Why this challenges you</p>
                        <p className="text-sm text-muted-foreground">
                          {currentItem.reason}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Difficulty Info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Flame 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < currentItem.difficulty 
                                ? getDifficultyColor(currentItem.difficulty)
                                : 'text-muted/30'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleAction('try')}
                      variant="explore"
                      size="lg"
                      className="flex-1"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Try Now
                    </Button>
                    <Button
                      onClick={() => handleAction('save')}
                      variant="outline"
                      size="lg"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleAction('skip')}
                      variant="ghost"
                      size="lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="mt-8 grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card text-center p-4">
            <p className="text-2xl font-bold text-primary">{currentIndex + 1}</p>
            <p className="text-sm text-muted-foreground">Challenges Seen</p>
          </Card>
          <Card className="glass-card text-center p-4">
            <p className="text-2xl font-bold text-secondary">
              {progress.filter(p => p.status === 'saved').length}
            </p>
            <p className="text-sm text-muted-foreground">Saved</p>
          </Card>
          <Card className="glass-card text-center p-4">
            <p className="text-2xl font-bold text-accent">85%</p>
            <p className="text-sm text-muted-foreground">Discomfort Score</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DiscomfortDashboard;