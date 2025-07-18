import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  Film, 
  Music, 
  BookOpen, 
  Utensils, 
  Shirt,
  Sparkles,
  Flame,
  Map,
  Target,
  Calendar,
  Clock
} from "lucide-react";

interface ProgressiveStep {
  title: string;
  difficulty: number;
  description: string;
  culturalContext?: string;
  completed?: boolean;
  current?: boolean;
}

interface TasteJourneyProps {
  domain: string;
  progressivePath: ProgressiveStep[];
  currentStep: number;
  onStepComplete: (stepIndex: number) => void;
  onStartChallenge: (step: ProgressiveStep) => void;
}

const getDomainIcon = (domain: string) => {
  const icons: Record<string, any> = {
    film: Film,
    music: Music,
    books: BookOpen,
    food: Utensils,
    fashion: Shirt
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

export const TasteJourneyVisualization = ({ 
  domain, 
  progressivePath, 
  currentStep, 
  onStepComplete, 
  onStartChallenge 
}: TasteJourneyProps) => {
  const DomainIcon = getDomainIcon(domain);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {/* Journey Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-primary">
            <DomainIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">
            {domain.charAt(0).toUpperCase() + domain.slice(1)} Journey
          </h2>
        </div>
        <p className="text-muted-foreground">
          Progressive path to expand your cultural horizons
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Journey Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {progressivePath.length}</span>
            <span>{Math.round(((currentStep + 1) / progressivePath.length) * 100)}% Complete</span>
          </div>
          <Progress value={((currentStep + 1) / progressivePath.length) * 100} className="h-3" />
        </CardContent>
      </Card>

      {/* Horizontal Scroll Journey Path */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-6 pb-4 px-2">
          {progressivePath.map((step, index) => (
            <motion.div
              key={index}
              className="flex-shrink-0 w-80"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card 
                className={`glass-card hover-lift cursor-pointer transition-all duration-300 ${
                  index === currentStep ? 'ring-2 ring-primary shadow-lg shadow-primary/20' :
                  index < currentStep ? 'bg-green-500/10 border-green-500/20' :
                  'opacity-70'
                }`}
                onClick={() => setSelectedStep(selectedStep === index ? null : index)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={index <= currentStep ? "default" : "outline"}
                      className={index === currentStep ? "bg-primary" : index < currentStep ? "bg-green-500" : ""}
                    >
                      Step {index + 1}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: step.difficulty }).map((_, i) => (
                        <Flame key={i} className={`h-3 w-3 ${getDifficultyColor(step.difficulty)}`} />
                      ))}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  
                  {/* Cultural Context (expandable) */}
                  <AnimatePresence>
                    {selectedStep === index && step.culturalContext && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                      >
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground">{step.culturalContext}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Action Button */}
                  <div className="flex justify-center">
                    {index < currentStep ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        ✓ Completed
                      </Badge>
                    ) : index === currentStep ? (
                      <Button 
                        variant="explore" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartChallenge(step);
                        }}
                        className="w-full"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Start Challenge
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Arrow between steps */}
              {index < progressivePath.length - 1 && (
                <div className="flex justify-center items-center h-12">
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className={`h-6 w-6 ${
                      index < currentStep ? 'text-green-400' : 'text-muted-foreground'
                    }`} />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Step Details */}
      {progressivePath[currentStep] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="glass-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Current Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{progressivePath[currentStep].title}</h3>
                  <p className="text-muted-foreground">{progressivePath[currentStep].description}</p>
                </div>
                
                {progressivePath[currentStep].culturalContext && (
                  <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                    <p className="text-sm font-medium text-primary mb-1">Cultural Context</p>
                    <p className="text-sm text-muted-foreground">
                      {progressivePath[currentStep].culturalContext}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Difficulty:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Flame 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < progressivePath[currentStep].difficulty 
                              ? getDifficultyColor(progressivePath[currentStep].difficulty)
                              : 'text-muted/30'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="explore" 
                    onClick={() => onStartChallenge(progressivePath[currentStep])}
                    className="px-8"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Begin This Step
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};