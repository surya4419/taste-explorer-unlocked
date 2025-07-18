import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Target, 
  TrendingUp,
  Film,
  Music,
  BookOpen,
  Utensils,
  Shirt,
  Zap,
  Compass,
  LogIn,
  LogOut,
  User,
  Calendar,
  Map
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useTasteJourney } from "@/hooks/useTasteJourney";
import { useUserProgress } from "@/hooks/useUserProgress";
import { TasteJourneyVisualization } from "@/components/TasteJourneyVisualization";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { profile } = useUserProgress();
  const { 
    journeyData, 
    loading: journeyLoading, 
    startTasteJourney, 
    generateProgressivePath,
    createFiveDayPlan 
  } = useTasteJourney();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('film');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Auto-start taste journey when user logs in and has completed onboarding
  useEffect(() => {
    if (user && profile?.onboarding_completed && profile?.taste_preferences && !journeyData) {
      console.log('User logged in with completed onboarding, starting taste journey...');
      setShowJourney(true);
      startTasteJourney(profile.taste_preferences)
        .then(() => {
          // Generate initial progressive path for film domain
          return generateProgressivePath('film', 'Marvel Movies', 'Andrei Tarkovsky Films');
        })
        .catch(error => {
          console.error('Error starting taste journey:', error);
        });
    }
  }, [user, profile, journeyData, startTasteJourney, generateProgressivePath]);

  const handleSignOut = async () => {
    await signOut();
    setShowJourney(false);
  };

  const handleStepComplete = (stepIndex: number) => {
    setCurrentStep(stepIndex + 1);
  };

  const handleStartChallenge = (step: any) => {
    console.log('Starting challenge:', step);
    navigate('/dashboard');
  };

  const handleDomainChange = async (domain: string) => {
    setSelectedDomain(domain);
    setCurrentStep(0);
    
    if (journeyData) {
      // Generate new progressive path for selected domain
      const domainTargets: Record<string, { current: string; target: string }> = {
        film: { current: 'Marvel Movies', target: 'Andrei Tarkovsky Films' },
        music: { current: 'Pop Music', target: 'Experimental Jazz' },
        books: { current: 'Popular Fiction', target: 'Modernist Literature' },
        food: { current: 'Comfort Food', target: 'Fermented Cuisine' },
        fashion: { current: 'Casual Style', target: 'Avant-Garde Fashion' }
      };
      
      const targets = domainTargets[domain];
      if (targets) {
        await generateProgressivePath(domain, targets.current, targets.target);
      }
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Taste Analysis",
      description: "Gemini analyzes your comfort zones and creates personalized discomfort challenges"
    },
    {
      icon: Target,
      title: "Cultural Graph Mapping",
      description: "Qloo's cultural graph finds perfect opposite recommendations across all domains"
    },
    {
      icon: TrendingUp,
      title: "Growth Tracking",
      description: "Visualize your taste evolution and cultural expansion over time"
    }
  ];

  const domains = [
    { icon: Film, name: "Film", color: "text-red-400" },
    { icon: Music, name: "Music", color: "text-blue-400" },
    { icon: BookOpen, name: "Books", color: "text-green-400" },
    { icon: Utensils, name: "Food", color: "text-orange-400" },
    { icon: Shirt, name: "Fashion", color: "text-purple-400" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="h-16 w-16 rounded-full bg-gradient-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Auth Navigation */}
      <div className="absolute top-4 right-4 z-20">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {user.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate('/auth')}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/20 blur-xl"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-secondary/20 blur-xl"
          animate={{ 
            scale: [1.5, 1, 1.5],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-accent/20 blur-xl"
          animate={{ 
            scale: [1, 2, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="p-4 rounded-full bg-gradient-primary glow-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-12 w-12 text-white" />
            </motion.div>
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl font-bold gradient-text leading-tight">
                The Unrecommendation
              </h1>
              <h1 className="text-5xl md:text-7xl font-bold gradient-text-accent leading-tight">
                Engine
              </h1>
            </div>
          </motion.div>

          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Escape your cultural comfort zone. Powered by AI and designed for{" "}
            <span className="text-primary font-semibold">discomfort-based growth</span>.
          </motion.p>

          {/* Domain Icons */}
          <motion.div 
            className="flex justify-center gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {domains.map((domain, index) => {
              const Icon = domain.icon;
              return (
                <motion.div
                  key={domain.name}
                  className="flex flex-col items-center gap-2"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: index * 0.2 
                  }}
                >
                  <div className="p-3 rounded-full glass-card">
                    <Icon className={`h-6 w-6 ${domain.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{domain.name}</span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button 
              size="xl" 
              variant="explore"
              onClick={() => navigate('/onboarding')}
              className="group"
            >
              <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
              Start Your Taste Journey
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="xl" 
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <Compass className="h-5 w-5 mr-2" />
              Explore Dashboard
            </Button>
          </motion.div>
        </motion.div>

        {/* Dynamic Taste Journey - Shows After Login */}
        {user && showJourney && journeyData && (
          <motion.div 
            className="max-w-6xl mx-auto mb-16 w-full"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {/* Journey Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold gradient-text mb-4">Your Personalized Taste Journey</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                AI-powered progressive paths designed to expand your cultural horizons
              </p>
            </div>

            {/* AI Onboarding Report */}
            {journeyData.onboardingReport && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <Card className="glass-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI Analysis Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {journeyData.onboardingReport}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Domain Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <div className="flex justify-center gap-2 mb-6">
                {domains.map((domain) => {
                  const Icon = domain.icon;
                  return (
                    <Button
                      key={domain.name}
                      variant={selectedDomain === domain.name.toLowerCase() ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDomainChange(domain.name.toLowerCase())}
                      className="flex items-center gap-2"
                      disabled={journeyLoading}
                    >
                      <Icon className="h-4 w-4" />
                      {domain.name}
                    </Button>
                  );
                })}
              </div>
            </motion.div>

            {/* Progressive Path Visualization */}
            {journeyData.progressivePaths[selectedDomain] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <TasteJourneyVisualization
                  domain={selectedDomain}
                  progressivePath={journeyData.progressivePaths[selectedDomain]}
                  currentStep={currentStep}
                  onStepComplete={handleStepComplete}
                  onStartChallenge={handleStartChallenge}
                />
              </motion.div>
            )}

            {/* 5-Day Plan Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 text-center"
            >
              <Button
                variant="explore"
                size="lg"
                onClick={() => createFiveDayPlan(profile?.taste_preferences, selectedDomain)}
                disabled={journeyLoading}
                className="group"
              >
                <Calendar className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                {journeyLoading ? 'Creating Plan...' : 'Generate 5-Day Challenge Plan'}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Journey Loading State */}
            {journeyLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center py-8"
              >
                <div className="text-center">
                  <motion.div
                    className="h-12 w-12 mx-auto mb-4 rounded-full bg-gradient-primary"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-muted-foreground">
                    AI is crafting your personalized journey...
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Features Section */}
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 40 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              AI-powered cultural exploration that expands your horizons
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                  transition={{ duration: 0.8, delay: 1.2 + index * 0.2 }}
                >
                  <Card className="glass-card hover-lift h-full">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-primary w-fit">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-32 right-20 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-8 w-8 text-primary" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-32 left-20 opacity-20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        >
          <Target className="h-10 w-10 text-secondary" />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
