import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import sylphieLogo from "@/assets/sylphie-logo.png";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-glossy">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 md:p-8">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
        <div className="text-2xl font-bold text-gradient">
          SYLPHIE
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12 fade-in">
          <img 
            src={sylphieLogo} 
            alt="SYLPHIE Logo" 
            className="w-32 h-32 object-contain mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-gradient mb-4">About SYLPHIE</h1>
          <p className="text-xl text-accent-foreground">
            Your Intelligent AI Assistant
          </p>
        </div>

        <div className="prose prose-lg mx-auto text-foreground fade-in">
          <div className="rounded-3xl p-8 shadow-glossy mb-8" style={{ background: 'var(--gradient-card)' }}>
            <h2 className="text-2xl font-semibold text-gradient mb-4">What is SYLPHIE?</h2>
            <p className="text-card-foreground leading-relaxed">
              SYLPHIE is your personal AI assistant designed to seamlessly integrate into both your professional 
              and personal life. With an elegant, intuitive interface and powerful conversational abilities, 
              SYLPHIE helps you stay organized, productive, and informed.
            </p>
          </div>

          <div className="rounded-3xl p-8 shadow-glossy mb-8" style={{ background: 'var(--gradient-card)' }}>
            <h2 className="text-2xl font-semibold text-gradient mb-4">Our Mission</h2>
            <p className="text-card-foreground leading-relaxed">
              We believe that AI should be approachable, helpful, and designed with elegance in mind. 
              SYLPHIE represents our commitment to creating technology that enhances human potential 
              while maintaining the grace and sophistication you deserve.
            </p>
          </div>

          <div className="rounded-3xl p-8 shadow-glossy" style={{ background: 'var(--gradient-card)' }}>
            <h2 className="text-2xl font-semibold text-gradient mb-4">Why Choose SYLPHIE?</h2>
            <ul className="space-y-3 text-card-foreground">
              <li className="flex items-start space-x-3">
                <span className="text-primary">•</span>
                <span>Elegant, minimalistic design that focuses on what matters</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary">•</span>
                <span>Intelligent conversations that adapt to your needs</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary">•</span>
                <span>Professional-grade assistance for work and personal tasks</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary">•</span>
                <span>Privacy-focused approach to AI interaction</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-12 fade-in">
          <Link 
            to="/chat" 
            className="btn-hero"
          >
            Start Chatting with SYLPHIE
          </Link>
        </div>
      </main>
    </div>
  );
};

export default About;