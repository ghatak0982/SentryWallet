import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Settings, Wrench, Clock, Rocket, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const WorkInProgress = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          navigate('/login');
          return;
        }

        if (!session) {
          navigate('/login');
          return;
        }

        console.log('User authenticated in WorkInProgress:', session.user);
        setUser(session.user);
        setLoading(false);
      } catch (error) {
        navigate('/login');
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          navigate('/login');
        } else {
          setUser(session.user);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-accent">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  const upcomingFeatures = [
    {
      icon: Shield,
      title: "Social Recovery Setup",
      description: "Configure trusted guardians to help recover your wallet",
      status: "Coming Soon"
    },
    {
      icon: Rocket,
      title: "Gasless Transactions",
      description: "Send transactions without paying gas fees on BlockDAG",
      status: "In Development"
    },
    {
      icon: Settings,
      title: "Wallet Management",
      description: "Full crypto wallet functionality with DeFi integrations",
      status: "Planned"
    }
  ];

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

  return (
    <div className="min-h-screen gradient-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-primary mr-3" />
            <span className="text-2xl font-bold text-accent">SentryWallet</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user?.user_metadata?.avatar_url && (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-accent font-medium hidden md:block">
              {user?.user_metadata?.full_name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-accent transition-colors duration-300 p-2 rounded-lg hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Welcome Section */}
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center">
              <Wrench className="w-12 h-12 text-primary" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-accent mb-4">
              Welcome to SentryWallet!
            </h1>
            
            <p className="text-xl text-gray-600 mb-6">
              Thanks for joining us early! Your smart wallet is currently under construction.
            </p>

            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
              <Clock className="w-4 h-4 mr-2" />
              Work in Progress
            </div>
          </motion.div>

          {/* User Welcome Card */}
          <motion.div
            className="neumorphic rounded-3xl p-8 mb-12"
            variants={itemVariants}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-accent mb-2">
                  Account Successfully Created!
                </h2>
                <p className="text-gray-600 mb-4">
                  {user?.user_metadata?.full_name && `Hi ${user.user_metadata.full_name}! `}
                  Your SentryWallet account has been set up with {user?.email}. 
                  You'll be notified as soon as new features become available.
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="text-sm">
                    <strong className="text-accent">Login Method:</strong> 
                    <span className="ml-2 text-gray-600">
                      {user?.app_metadata?.provider === 'google' ? 'Google OAuth' : 'Email & Password'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <strong className="text-accent">Joined:</strong> 
                    <span className="ml-2 text-gray-600">
                      {new Date(user?.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Features */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-accent mb-8 text-center">
              What's Coming Next
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {upcomingFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="neumorphic rounded-3xl p-6 text-center"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-accent mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {feature.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            className="text-center py-12 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl"
            variants={itemVariants}
          >
            <h3 className="text-2xl font-bold text-accent mb-4">
              Stay Updated
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're working hard to bring you the most secure and user-friendly crypto wallet experience. 
              Follow our progress and be the first to know when new features launch!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition-colors duration-300">
                Join Our Newsletter
              </button>
              <button className="px-6 py-3 border-2 border-accent text-accent rounded-2xl font-semibold hover:bg-accent hover:text-white transition-all duration-300">
                Follow on Twitter
              </button>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div 
            className="text-center mt-8"
            variants={itemVariants}
          >
            <button
              onClick={() => navigate('/')}
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
            >
              ← Back to Homepage
            </button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default WorkInProgress;