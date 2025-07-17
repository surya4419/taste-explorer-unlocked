import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Brain, 
  Award, 
  Calendar,
  Film,
  Music,
  BookOpen,
  Utensils,
  Shirt,
  BarChart3,
  LineChart,
  Target,
  Sparkles,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DomainProgress {
  domain: string;
  icon: any;
  current: number;
  target: number;
  weeklyChange: number;
  level: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  earned: boolean;
  date?: string;
}

const domainProgress: DomainProgress[] = [
  {
    domain: "Film",
    icon: Film,
    current: 72,
    target: 85,
    weeklyChange: +12,
    level: "Expanding"
  },
  {
    domain: "Music", 
    icon: Music,
    current: 45,
    target: 70,
    weeklyChange: +8,
    level: "Exploring"
  },
  {
    domain: "Books",
    icon: BookOpen,
    current: 30,
    target: 60,
    weeklyChange: +5,
    level: "Beginning"
  },
  {
    domain: "Food",
    icon: Utensils,
    current: 68,
    target: 80,
    weeklyChange: +15,
    level: "Adventurous"
  },
  {
    domain: "Fashion",
    icon: Shirt,
    current: 25,
    target: 50,
    weeklyChange: +3,
    level: "Curious"
  }
];

const achievements: Achievement[] = [
  {
    id: "1",
    title: "First Discomfort",
    description: "Completed your first challenging recommendation",
    icon: Target,
    earned: true,
    date: "2 days ago"
  },
  {
    id: "2",
    title: "Genre Jumper",
    description: "Explored 3 different film genres",
    icon: Film,
    earned: true,
    date: "1 week ago"
  },
  {
    id: "3",
    title: "Sonic Explorer",
    description: "Listened to experimental music for 2 hours",
    icon: Music,
    earned: false
  },
  {
    id: "4",
    title: "Cultural Bridge",
    description: "Completed a full curriculum pathway",
    icon: Brain,
    earned: false
  }
];

const GrowthDashboard = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const overallProgress = Math.round(domainProgress.reduce((acc, domain) => acc + domain.current, 0) / domainProgress.length);
  const earnedAchievements = achievements.filter(a => a.earned).length;

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <motion.div 
        className="max-w-6xl mx-auto mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-full bg-gradient-accent glow-accent"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Growth Dashboard</h1>
              <p className="text-muted-foreground">Track your cultural expansion journey</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <Brain className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate('/curriculum')}>
              Curriculum
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Overview Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card text-center p-6">
            <div className="text-3xl font-bold text-primary mb-2">{overallProgress}%</div>
            <p className="text-sm text-muted-foreground">Cultural Exposure</p>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-400 border-green-400">
                +12% this week
              </Badge>
            </div>
          </Card>

          <Card className="glass-card text-center p-6">
            <div className="text-3xl font-bold text-secondary mb-2">147</div>
            <p className="text-sm text-muted-foreground">Discomfort Points</p>
            <div className="mt-2">
              <Badge variant="outline" className="text-orange-400 border-orange-400">
                +23 this week
              </Badge>
            </div>
          </Card>

          <Card className="glass-card text-center p-6">
            <div className="text-3xl font-bold text-accent mb-2">{earnedAchievements}</div>
            <p className="text-sm text-muted-foreground">Achievements</p>
            <div className="mt-2">
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                2 unlocked
              </Badge>
            </div>
          </Card>

          <Card className="glass-card text-center p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">18</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
            <div className="mt-2">
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                Personal best
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Domain Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Domain Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {domainProgress.map((domain, index) => {
                const Icon = domain.icon;
                const progressPercentage = (domain.current / domain.target) * 100;
                
                return (
                  <motion.div 
                    key={domain.domain}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{domain.domain}</p>
                          <p className="text-sm text-muted-foreground">Level: {domain.level}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">{domain.current}%</p>
                        <p className="text-sm text-green-400">+{domain.weeklyChange}% this week</p>
                      </div>
                    </div>
                    
                    <Progress value={progressPercentage} className="h-2" />
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Current: {domain.current}%</span>
                      <span>Target: {domain.target}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Growth Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                  <p className="text-sm font-medium text-primary mb-1">Cultural Momentum</p>
                  <p className="text-sm text-muted-foreground">
                    Your film taste has shifted 48% toward contemplative cinema this week. 
                    The progression from Marvel to Nolan is building your patience for complex narratives.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                  <p className="text-sm font-medium text-secondary mb-1">Breakthrough Area</p>
                  <p className="text-sm text-muted-foreground">
                    Food exploration shows exceptional growth. Your willingness to try fermented foods 
                    suggests you're ready for advanced umami challenges.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                  <p className="text-sm font-medium text-accent mb-1">Next Challenge</p>
                  <p className="text-sm text-muted-foreground">
                    Based on your progress patterns, experimental jazz would be an optimal next step 
                    for expanding your musical boundaries.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        achievement.earned 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-muted/50 border-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.earned 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {achievement.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                          {achievement.earned && achievement.date && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-green-400" />
                              <span className="text-xs text-green-400">{achievement.date}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default GrowthDashboard;