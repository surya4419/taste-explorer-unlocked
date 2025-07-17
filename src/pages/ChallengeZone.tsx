import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gamepad2, 
  Target, 
  Clock, 
  CheckCircle,
  Film,
  Music,
  BookOpen,
  Utensils,
  Shirt,
  Camera,
  Share2,
  Timer,
  Trophy,
  Flame,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Challenge {
  id: string;
  title: string;
  domain: string;
  description: string;
  duration: string;
  difficulty: number;
  points: number;
  type: 'timer' | 'completion' | 'photo';
  status: 'available' | 'active' | 'completed';
  progress?: number;
}

const challenges: Challenge[] = [
  {
    id: "1",
    title: "30-Minute Drone Music Session",
    domain: "music",
    description: "Listen to ambient drone music without distractions",
    duration: "30 min",
    difficulty: 4,
    points: 50,
    type: "timer",
    status: "available"
  },
  {
    id: "2",
    title: "Try Fermented Food",
    domain: "food", 
    description: "Order and finish a dish with fermented ingredients",
    duration: "1 meal",
    difficulty: 3,
    points: 30,
    type: "photo",
    status: "available"
  },
  {
    id: "3",
    title: "Watch Foreign Film with Subtitles",
    domain: "film",
    description: "Complete a non-English film from your comfort zone",
    duration: "2 hours",
    difficulty: 2,
    points: 40,
    type: "completion",
    status: "completed"
  },
  {
    id: "4",
    title: "Wear Unconventional Color Combo",
    domain: "fashion",
    description: "Style an outfit with colors outside your usual palette",
    duration: "1 day",
    difficulty: 2,
    points: 25,
    type: "photo",
    status: "active",
    progress: 65
  },
  {
    id: "5",
    title: "Read Poetry for 20 Minutes",
    domain: "books",
    description: "Engage with contemporary poetry collection",
    duration: "20 min",
    difficulty: 3,
    points: 35,
    type: "timer",
    status: "available"
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
  return icons[domain] || Target;
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    timer: Timer,
    completion: CheckCircle,
    photo: Camera
  };
  return icons[type] || Target;
};

const ChallengeZone = () => {
  const navigate = useNavigate();
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const availableChallenges = challenges.filter(c => c.status === 'available');
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const totalPoints = completedChallenges.reduce((sum, c) => sum + c.points, 0);

  const startChallenge = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge?.type === 'timer') {
      setActiveChallenge(challengeId);
      // Convert duration to seconds (simplified)
      const minutes = parseInt(challenge.duration);
      setTimeRemaining(minutes * 60);
      setTimerRunning(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 glow-secondary"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gamepad2 className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Challenge Zone
              </h1>
              <p className="text-muted-foreground">Gamified discomfort experiences</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <Target className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate('/growth')}>
              Progress
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card text-center p-4">
            <div className="text-2xl font-bold text-orange-400 mb-1">{totalPoints}</div>
            <p className="text-sm text-muted-foreground">Points Earned</p>
          </Card>
          <Card className="glass-card text-center p-4">
            <div className="text-2xl font-bold text-green-400 mb-1">{completedChallenges.length}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </Card>
          <Card className="glass-card text-center p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">{activeChallenges.length}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </Card>
          <Card className="glass-card text-center p-4">
            <div className="text-2xl font-bold text-purple-400 mb-1">7</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </Card>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Active Challenge Timer */}
        {activeChallenge && timerRunning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="glass-card bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-orange-400 mb-2">Challenge Active</p>
                  <div className="text-2xl font-bold text-white mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setTimerRunning(!timerRunning)}>
                      {timerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveChallenge(null)}>
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Active Challenges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.map((challenge) => {
                const DomainIcon = getDomainIcon(challenge.domain);
                const TypeIcon = getTypeIcon(challenge.type);
                
                return (
                  <Card key={challenge.id} className="glass-card hover-lift">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DomainIcon className="h-5 w-5 text-blue-400" />
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {challenge.domain}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: challenge.difficulty }).map((_, i) => (
                            <Flame key={i} className="h-3 w-3 text-orange-400" />
                          ))}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      
                      {challenge.progress && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <Progress value={challenge.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TypeIcon className="h-4 w-4" />
                          <span>{challenge.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-orange-400" />
                          <span className="text-sm font-medium">{challenge.points} pts</span>
                        </div>
                      </div>
                      
                      <Button className="w-full" variant="challenge">
                        Continue Challenge
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Available Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Available Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableChallenges.map((challenge, index) => {
              const DomainIcon = getDomainIcon(challenge.domain);
              const TypeIcon = getTypeIcon(challenge.type);
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="glass-card hover-lift h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DomainIcon className="h-5 w-5 text-primary" />
                          <Badge variant="outline">{challenge.domain}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: challenge.difficulty }).map((_, i) => (
                            <Flame key={i} className="h-3 w-3 text-orange-400" />
                          ))}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground flex-1">
                        {challenge.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TypeIcon className="h-4 w-4" />
                          <span>{challenge.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-orange-400" />
                          <span className="text-sm font-medium">{challenge.points} pts</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        variant="explore"
                        onClick={() => startChallenge(challenge.id)}
                      >
                        Start Challenge
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Completed Challenges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedChallenges.map((challenge, index) => {
                const DomainIcon = getDomainIcon(challenge.domain);
                
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Card className="glass-card bg-green-500/10 border-green-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <DomainIcon className="h-4 w-4 text-green-400" />
                            <span className="text-sm font-medium">{challenge.title}</span>
                          </div>
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-400">Completed</span>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-orange-400" />
                            <span className="text-xs font-medium">+{challenge.points}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChallengeZone;