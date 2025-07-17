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
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
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
