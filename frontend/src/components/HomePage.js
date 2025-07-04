import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Rocket, Mail, Github, BookOpen, MessageCircle } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    hover: { 
      scale: 1.05,
      y: -10,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <div className="min-h-screen gradient-background">
      {/* Hero Section */}
      <motion.div 
        className="relative min-h-screen flex items-center justify-center px-4 hero-image"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background/80"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div 
            className="mb-8"
            variants={itemVariants}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-primary/20 rounded-3xl flex items-center justify-center neumorphic">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-accent mb-4 leading-tight">
              The Smart Wallet
              <br />
              <span className="text-primary">You Can't Lose</span>
            </h1>
          </motion.div>

          <motion.p 
            className="text-xl md:text-2xl text-gray-600 mb-4 font-medium"
            variants={itemVariants}
          >
            Social recovery. Web2 login. Gasless UX — powered by BlockDAG.
          </motion.p>

          <motion.p 
            className="text-lg text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            SentryWallet is a smart, recoverable crypto wallet that uses Web2 login, social guardians, and gasless transactions — built on BlockDAG.
          </motion.p>

          <motion.button
            className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 backdrop-blur-sm border-2 border-white/50 hover:border-white/70 shadow-lg"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
          >
            Launch App
          </motion.button>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-primary/30 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-accent/20 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-primary/40 rounded-full animate-float-delayed-2"></div>
      </motion.div>

      {/* What Makes SentryWallet Different Section */}
      <motion.div 
        className="py-20 px-4 bg-gradient-to-r from-primary/5 to-accent/5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center text-accent mb-16"
            variants={itemVariants}
          >
            💡 What Makes SentryWallet Different
          </motion.h2>

          <motion.div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            variants={itemVariants}
          >
            <p className="text-xl mb-6 font-medium text-accent">
              SentryWallet is not just a crypto wallet — it's a smart wallet designed for real people.
            </p>

            <div className="space-y-6 text-lg">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p>
                  <strong>No seed phrases, no panic.</strong> Users can log in with Google and set trusted "guardians" (friends/family) to recover access if they lose their device.
                </p>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p>
                  <strong>Gasless transactions.</strong> The wallet runs on BlockDAG, an ultra-fast Layer 1 chain, and uses gasless meta-transactions so users don't even need tokens to interact.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 my-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-accent mb-4">This solves two huge problems in crypto:</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <p><strong>People forgetting seed phrases</strong> (and losing funds forever)</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <p><strong>Users stuck with wallets but no gas</strong> to use them</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p>
                  <strong>Web2 UX meets Web3 power.</strong> We combine Web2 UX, Smart Contract recovery logic, and sponsor gas — making SentryWallet ideal for onboarding non-technical users to Web3.
                </p>
              </div>

              <div className="bg-primary/10 rounded-2xl p-6 mt-8">
                <p className="text-accent font-medium text-center">
                  <strong>This is why wallets like MetaMask haven't fully solved the mainstream adoption problem</strong> — they rely on seed phrases and gas payments. <span className="text-primary font-bold">SentryWallet fixes both.</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="py-20 px-4 max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center text-accent mb-16"
          variants={itemVariants}
        >
          Why Choose SentryWallet?
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            className="text-center p-8 rounded-3xl neumorphic cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-accent mb-4">Web2 Login</h3>
            <p className="text-gray-600 leading-relaxed">
              Sign in with your Gmail account. No need to remember complex seed phrases or private keys.
            </p>
          </motion.div>

          <motion.div
            className="text-center p-8 rounded-3xl neumorphic cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-accent mb-4">Guardian Recovery</h3>
            <p className="text-gray-600 leading-relaxed">
              Your trusted friends and family can help you recover your wallet if you lose access.
            </p>
          </motion.div>

          <motion.div
            className="text-center p-8 rounded-3xl neumorphic cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-400 rounded-2xl flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-accent mb-4">No Gas Fees</h3>
            <p className="text-gray-600 leading-relaxed">
              Enjoy gasless transactions with sponsored transactions on the BlockDAG network.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="py-20 px-4 text-center bg-gradient-to-r from-primary/10 to-accent/10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-accent mb-6"
          variants={itemVariants}
        >
          Ready to Get Started?
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Join thousands of users who trust SentryWallet for their crypto needs.
        </motion.p>
        <motion.button
          className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 neumorphic shadow-lg hover:shadow-xl border-2 border-white/30"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
        >
          Launch App Now
        </motion.button>
      </motion.div>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Shield className="w-8 h-8 text-primary mr-3" />
              <span className="text-2xl font-bold text-accent">SentryWallet</span>
            </div>
            
            <div className="flex space-x-6">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-primary transition-colors duration-300"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </a>
              <a 
                href="https://blockdag.network" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-primary transition-colors duration-300"
              >
                <Rocket className="w-5 h-5 mr-2" />
                BlockDAG
              </a>
              <a 
                href="#docs" 
                className="flex items-center text-gray-600 hover:text-primary transition-colors duration-300"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Docs
              </a>
              <a 
                href="#contact" 
                className="flex items-center text-gray-600 hover:text-primary transition-colors duration-300"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2025 SentryWallet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;