import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Map, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Star,
  Film,
  Music,
  BookOpen,
  Utensils,
  Shirt,
  Brain,
  Target,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CurriculumStep {
  id: string;
  title: string;
  domain: string;
  description: string;
  difficulty: number;
  estimatedTime: string;
  status: 'completed' | 'current' | 'locked';
  connection: string;
}

const mockCurriculum: CurriculumStep[] = [
  {
    id: "1",
    title: "Marvel to Nolan",
    domain: "film",
    description: "Transition from superhero spectacle to complex narrative structures",
    difficulty: 2,
    estimatedTime: "2 weeks",
    status: "completed",
    connection: "Similar visual effects, more complex storytelling"
  },
  {
    id: "2", 
    title: "Christopher Nolan to Denis Villeneuve",
    domain: "film",
    description: "From puzzle narratives to atmospheric science fiction",
    difficulty: 3,
    estimatedTime: "3 weeks",
    status: "current",
    connection: "Intellectual themes, visual grandeur"
  },
  {
    id: "3",
    title: "Villeneuve to Tarkovsky",
    domain: "film", 
    description: "Enter the realm of philosophical cinema",
    difficulty: 4,
    estimatedTime: "4 weeks",
    status: "locked",
    connection: "Contemplative pacing, existential themes"
  },
  {
    id: "4",
    title: "Pop to Art Rock",
    domain: "music",
    description: "Discover experimental song structures",
    difficulty: 3,
    estimatedTime: "2 weeks", 
    status: "locked",
    connection: "Melodic foundation with creative complexity"
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
  return icons[domain] || Star;
};

const CulturalCurriculum = () => {
  const navigate = useNavigate();
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const currentStep = mockCurriculum.find(step => step.status === 'current');
  const completedSteps = mockCurriculum.filter(step => step.status === 'completed').length;
  const totalSteps = mockCurriculum.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

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
              className="p-3 rounded-full bg-gradient-secondary glow-secondary"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Map className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-accent">Cultural Curriculum</h1>
              <p className="text-muted-foreground">Your personalized taste evolution journey</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <Brain className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate('/growth')}>
              Progress
            </Button>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="glass-card mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Your Journey Progress</h3>
                <p className="text-muted-foreground">
                  {completedSteps} of {totalSteps} steps completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Curriculum Timeline */}
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent opacity-30" />

          <div className="space-y-6">
            {mockCurriculum.map((step, index) => {
              const Icon = getDomainIcon(step.domain);
              const isSelected = selectedStep === step.id;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Timeline Node */}
                  <div className={`absolute left-6 w-4 h-4 rounded-full border-2 ${
                    step.status === 'completed' 
                      ? 'bg-green-500 border-green-500' 
                      : step.status === 'current'
                      ? 'bg-primary border-primary'
                      : 'bg-muted border-muted'
                  }`} />

                  {/* Step Card */}
                  <div className="ml-16">
                    <Card 
                      className={`glass-card hover-lift cursor-pointer transition-all duration-300 ${
                        isSelected ? 'ring-2 ring-primary glow-primary' : ''
                      } ${step.status === 'locked' ? 'opacity-60' : ''}`}
                      onClick={() => step.status !== 'locked' && setSelectedStep(isSelected ? null : step.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              step.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400'
                                : step.status === 'current'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{step.title}</CardTitle>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {step.status === 'completed' && (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            )}
                            {step.status === 'current' && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Target className="h-5 w-5 text-primary" />
                              </motion.div>
                            )}
                            <Badge variant={step.status === 'current' ? 'default' : 'outline'}>
                              {step.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <CardContent className="pt-0">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>Estimated time: {step.estimatedTime}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                  <span>Difficulty level: {step.difficulty}/5</span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-primary mb-1">Connection Strategy</p>
                                  <p className="text-sm text-muted-foreground">{step.connection}</p>
                                </div>
                              </div>
                            </div>

                            {step.status === 'current' && (
                              <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex gap-3">
                                  <Button variant="explore" className="flex-1">
                                    Start This Step
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                  </Button>
                                  <Button variant="outline">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </motion.div>
                      )}
                    </Card>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Current Focus */}
        {currentStep && (
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Current Focus: {currentStep.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{currentStep.description}</p>
                <div className="flex gap-3">
                  <Button variant="explore" size="lg">
                    Continue Journey
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/challenges')}>
                    Practice Challenges
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CulturalCurriculum;