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
  Brain
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DiscomfortItem {
  id: string;
  domain: string;
  title: string;
  description: string;
  difficulty: number;
  imageUrl: string;
  reason: string;
  culturalContext: string;
}

const mockDiscomfortItems: DiscomfortItem[] = [
  {
    id: "1",
    domain: "film",
    title: "The Tree of Life",
    description: "Terrence Malick's experimental meditation on existence",
    difficulty: 4,
    imageUrl: "https://images.unsplash.com/photo-1489599651372-014db5c0d3d2?w=400",
    reason: "You enjoy fast-paced Marvel films - this will slow down your perception of time and build patience for visual poetry.",
    culturalContext: "American experimental cinema"
  },
  {
    id: "2", 
    domain: "music",
    title: "Aphex Twin - Selected Ambient Works",
    description: "Pioneering electronic ambient compositions",
    difficulty: 3,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    reason: "Since you prefer pop music, this will expand your appreciation for abstract soundscapes and experimental rhythm.",
    culturalContext: "British electronic avant-garde"
  },
  {
    id: "3",
    domain: "food",
    title: "Natto (Fermented Soybeans)",
    description: "Traditional Japanese breakfast with unique texture",
    difficulty: 5,
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400",
    reason: "You love comfort food - this challenging texture will reset your relationship with familiar flavors.",
    culturalContext: "Japanese traditional cuisine"
  },
  {
    id: "4",
    domain: "fashion",
    title: "Avant-Garde Asymmetrical Jacket",
    description: "Rei Kawakubo-inspired deconstructed silhouette",
    difficulty: 4,
    imageUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400",
    reason: "Your casual style preferences make this architectural approach to clothing a perfect discomfort zone.",
    culturalContext: "Japanese conceptual fashion"
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
  const [items, setItems] = useState<DiscomfortItem[]>([]);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Load taste profile and generate discomfort items
    const profile = localStorage.getItem('tasteProfile');
    if (!profile) {
      navigate('/onboarding');
      return;
    }
    
    setItems(mockDiscomfortItems);
  }, [navigate]);

  const currentItem = items[currentIndex];

  const handleAction = (action: 'try' | 'save' | 'skip') => {
    if (action === 'save') {
      setSavedItems(prev => [...prev, currentItem.id]);
    }
    
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reset or navigate to curriculum
      setCurrentIndex(0);
    }
  };

  if (!currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-lg text-muted-foreground">Loading your discomfort zone...</p>
        </div>
      </div>
    );
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
          <span>{savedItems.length} saved for later</span>
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
                    src={currentItem.imageUrl}
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
                    {currentItem.culturalContext}
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
            <p className="text-2xl font-bold text-secondary">{savedItems.length}</p>
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