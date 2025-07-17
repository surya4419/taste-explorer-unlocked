import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Film, 
  Music, 
  BookOpen, 
  Utensils, 
  Shirt,
  ArrowRight,
  Brain,
  Heart
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TasteProfile {
  movies: string;
  music: string;
  books: string;
  food: string;
  fashion: string;
}

const domains = [
  { key: 'movies', icon: Film, title: 'Movies & Films', placeholder: 'Marvel, comedy, action movies...' },
  { key: 'music', icon: Music, title: 'Music', placeholder: 'Pop, rock, indie, electronic...' },
  { key: 'books', icon: BookOpen, title: 'Books', placeholder: 'Fantasy, romance, mystery...' },
  { key: 'food', icon: Utensils, title: 'Food', placeholder: 'Italian, sushi, comfort food...' },
  { key: 'fashion', icon: Shirt, title: 'Fashion', placeholder: 'Casual, streetwear, vintage...' }
];

const TasteOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<TasteProfile>({
    movies: '',
    music: '',
    books: '',
    food: '',
    fashion: ''
  });

  const handleNext = () => {
    if (currentStep < domains.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save profile and navigate to dashboard
      localStorage.setItem('tasteProfile', JSON.stringify(profile));
      navigate('/dashboard');
    }
  };

  const handleProfileChange = (key: keyof TasteProfile, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const currentDomain = domains[currentStep];
  const Icon = currentDomain.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Welcome Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <motion.div
              className="p-4 rounded-full bg-gradient-primary glow-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text">
              The Unrecommendation Engine
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Let's map your taste comfort zone... so we can escape it 🚀
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {domains.length}</span>
            <span>{Math.round(((currentStep + 1) / domains.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div 
              className="h-2 bg-gradient-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / domains.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Current Domain Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass-card hover-lift">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-primary">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">{currentDomain.title}</CardTitle>
              </div>
              <p className="text-muted-foreground">
                What do you typically enjoy? Be specific about genres, styles, or preferences.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor={currentDomain.key} className="text-base font-medium">
                  Your current preferences
                </Label>
                <Textarea
                  id={currentDomain.key}
                  placeholder={currentDomain.placeholder}
                  value={profile[currentDomain.key as keyof TasteProfile]}
                  onChange={(e) => handleProfileChange(currentDomain.key as keyof TasteProfile, e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <motion.div 
                className="p-4 rounded-lg bg-accent/10 border border-accent/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-accent">Why we ask</p>
                    <p className="text-sm text-muted-foreground">
                      Understanding your comfort zone helps us find the perfect amount of discomfort 
                      to expand your cultural horizons without overwhelming you.
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!profile[currentDomain.key as keyof TasteProfile].trim()}
                  className="flex-1"
                  variant="explore"
                >
                  {currentStep === domains.length - 1 ? (
                    <>
                      Start Exploring <Sparkles className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 opacity-20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Sparkles className="h-8 w-8 text-primary" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 right-10 opacity-20"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        >
          <Brain className="h-6 w-6 text-secondary" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TasteOnboarding;