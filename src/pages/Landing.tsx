import { Link } from "react-router-dom";
import sylphieLogo from "@/assets/sylphie-logo.png";
const Landing = () => {
  return <div className="min-h-screen bg-gradient-glossy">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center p-6 md:p-8">
        <div className="text-xl font-semibold text-primary">
          SYLPHIE
        </div>
        <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors duration-200">
          About Us
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 pt-12 pb-20">
        {/* Logo */}
        <div className="fade-in">
          <img src={sylphieLogo} alt="SYLPHIE - Your AI Assistant" className="w-48 h-48 md:w-64 md:h-64 object-contain mb-8" />
        </div>

        {/* App Name */}
        

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-accent-foreground text-center mb-12 fade-in max-w-md">
          Your AI Assistant for Work & Life
        </p>

        {/* Get Started Button */}
        <Link to="/chat" className="btn-hero fade-in">
          Get Started
        </Link>
      </main>
    </div>;
};
export default Landing;