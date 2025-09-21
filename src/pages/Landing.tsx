import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import sylphieLogo from "@/assets/sylphie-logo.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-glossy relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Top Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:p-8">
        <div className="text-2xl font-bold text-gradient">
          SYLPHIE
        </div>
        <Link 
          to="/about" 
          className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          About Us
          <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 h-[calc(100vh-120px)]">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center justify-center h-full">
          {/* Logo with enhanced styling */}
          <div className="fade-in mb-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-hero rounded-full blur-2xl opacity-30 scale-110"></div>
              <img 
                src={sylphieLogo} 
                alt="SYLPHIE - Your AI Assistant" 
                className="relative w-32 h-32 md:w-40 md:h-40 object-contain float" 
              />
            </div>
          </div>

          {/* Hero Text */}
          <div className="space-y-3 mb-6">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground text-shadow fade-in">
              Meet <span className="text-gradient">SYLPHIE</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto fade-in">
              Your intelligent AI companion for work, life, and everything in between.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-6 fade-in">
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border/50">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium">Intelligent</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border/50">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium">Fast</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border/50">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium">Secure</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="fade-in mb-8">
            <Link to="/chat" className="btn-hero glow inline-flex items-center gap-3">
              Start Conversation
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Trust Indicators - Compact */}
          <div className="text-center fade-in">
            <p className="text-xs text-muted-foreground mb-2">
              Trusted by thousands of users worldwide
            </p>
            <div className="flex justify-center items-center gap-4 opacity-60">
              <div className="w-12 h-6 bg-muted/30 rounded"></div>
              <div className="w-12 h-6 bg-muted/30 rounded"></div>
              <div className="w-12 h-6 bg-muted/30 rounded"></div>
              <div className="w-12 h-6 bg-muted/30 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;