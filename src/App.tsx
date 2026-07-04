import React, { useState, useEffect } from 'react';
import { 
  UsersThree,
  UsersThree as Users2, 
  ChartPie as PieChart, 
  Gear as Settings,
  List as AlignLeft,
  XCircle,
  List as Menu,
  X,
  CurrencyDollar as DollarSign,
  Trophy,
  SignOut as LogOut,
  CircleNotch as Loader2,
  UserCircle,
  House,
  PenNib,
  Hexagon,
  Path,
  ChatsCircle,
  ChartLineUp,
  BookOpen,
  Sparkle,
  ShieldCheck
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { auth, onAuthStateChanged, db, logout, FirebaseUser, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';

// Components
import Dashboard from './components/Dashboard';
import ContentStudio from './components/ContentStudio';
import BrandingEngine from './components/BrandingEngine';
import Roadmap from './components/Roadmap';
import Community from './components/Community';
import Reports from './components/Reports';
import PerfectPromptCopilot from './components/PerfectPromptCopilot';
import Profile from './components/Profile';
import Login from './components/Login';
import LoadingScreen from './components/LoadingScreen';
import BrandIcon from './components/BrandIcon';
// Remove IdentityIcons to use Phosphor directly
import Onboarding from './components/Onboarding';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import LandingPage from './components/LandingPage';
import HelpCenter from './components/HelpCenter';
import HelpArticle from './components/HelpArticle';
import CreatorHub from './components/CreatorHub';
import SupportHub from './components/SupportHub';
import { ErrorBoundary } from './components/ErrorBoundary';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: House, component: Dashboard },
  { id: 'create', label: 'Create', icon: PenNib, component: ContentStudio },
  { id: 'brand', label: 'Brand', icon: Hexagon, component: BrandingEngine },
  { id: 'roadmap', label: 'Roadmap', icon: Path, component: Roadmap },
  { id: 'hub', label: 'Creator Hub', icon: UsersThree, component: CreatorHub, locked: true },
  { id: 'community', label: 'Community', icon: ChatsCircle, component: Community },
  { id: 'reports', label: 'Reports', icon: ChartLineUp, component: Reports },
  { id: 'help', label: 'Help', icon: BookOpen, component: HelpCenter },
  { id: 'prompts', label: 'Co-Pilot', icon: Sparkle, component: PerfectPromptCopilot },
  { id: 'profile', label: 'Profile', icon: UserCircle, component: Profile },
  { id: 'support', label: 'Support Hub', icon: ShieldCheck, component: SupportHub, devOnly: true },
];

const DEVELOPER_EMAILS = ['danengelsman@gmail.com'];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [brand, setBrand] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Sync user profile to Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              accountProvider: firebaseUser.providerData[0]?.providerId || 'google',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              subscriptionTier: 'free',
              accountStatus: 'active'
            });
          } else {
            await setDoc(userRef, {
              lastLogin: serverTimestamp()
            }, { merge: true });
          }
          setUser(firebaseUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error during auth state change:", error);
        // Still set user so they can at least see the app, or handle error state
        setUser(firebaseUser);
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Real-time user data update
      const userRef = doc(db, 'users', user.uid);
      const unsubscribeUser = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          setUserData(snap.data());
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      });

      // Real-time brand update
      const brandRef = doc(db, 'projects', `brand_${user.uid}`);
      const unsubscribeBrand = onSnapshot(brandRef, (snap) => {
        if (snap.exists()) {
          setBrand(snap.data().data);
          setShowOnboarding(false);
        } else {
          setBrand(null);
          setShowOnboarding(true);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `projects/brand_${user.uid}`);
      });

      // Real-time projects update (content created in studio)
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const unsubscribeProjects = onSnapshot(q, (snap) => {
        const projectsData = snap.docs
          .filter(doc => !doc.id.startsWith('brand_')) // Filter out brand doc
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        setProjects(projectsData);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'projects');
      });

      return () => {
        unsubscribeUser();
        unsubscribeBrand();
        unsubscribeProjects();
      };
    }
  }, [user]);

  const isDeveloper = user?.email && DEVELOPER_EMAILS.includes(user.email);
  const visibleNavItems = NAV_ITEMS.filter(item => !item.devOnly || isDeveloper);

  const ActiveComponent = visibleNavItems.find(item => item.id === activeTab)?.component || Dashboard;

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  if (currentPath === '/privacy') {
    return <PrivacyPolicy onBack={() => navigate('/')} />;
  }

  if (currentPath === '/terms') {
    return <TermsOfService onBack={() => navigate('/')} />;
  }

  if (currentPath === '/roadmap') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--label-primary)] font-sans">
        <nav className="sticky top-0 z-[100] bg-[var(--bg-material-thick)] backdrop-blur-xl border-b border-[var(--separator)] px-6 h-16 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <BrandIcon size={20} className="text-[var(--accent)]" />
              <span className="font-bold text-[19px] tracking-tight">CreatorOS</span>
            </div>
            <button onClick={() => navigate('/')} className="ios-button ios-button-tinted h-9 px-4 text-[14px]">
              Back to Home
            </button>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Roadmap brand={null} user={null} />
        </div>
      </div>
    );
  }

  if (currentPath === '/help') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--label-primary)] font-sans">
        <nav className="sticky top-0 z-[100] bg-[var(--bg-material-thick)] backdrop-blur-xl border-b border-[var(--separator)] px-6 h-16 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <BrandIcon size={20} className="text-[var(--accent)]" />
              <span className="font-bold text-[19px] tracking-tight">CreatorOS</span>
            </div>
            <button onClick={() => navigate('/')} className="ios-button ios-button-tinted h-9 px-4 text-[14px]">
              Back to Home
            </button>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <HelpCenter user={null} navigate={(path) => navigate(path)} />
        </div>
      </div>
    );
  }

  if (currentPath.startsWith('/help/')) {
    const topicId = currentPath.replace('/help/', '');
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--label-primary)] font-sans">
        <nav className="sticky top-0 z-[100] bg-[var(--bg-material-thick)] backdrop-blur-xl border-b border-[var(--separator)] px-6 h-16 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <BrandIcon size={20} className="text-[var(--accent)]" />
              <span className="font-bold text-[19px] tracking-tight">CreatorOS</span>
            </div>
            <button onClick={() => navigate('/help')} className="ios-button ios-button-tinted h-9 px-4 text-[14px]">
              Back to Help
            </button>
          </div>
        </nav>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <HelpArticle topic={topicId} onBack={() => navigate('/help')} />
        </div>
      </div>
    );
  }

  if (!user) {
    document.body.classList.remove('is-app');
    return <LandingPage navigate={navigate} />;
  }

  document.body.classList.add('is-app');

  const handleOnboardingComplete = (targetTab?: string) => {
    setShowOnboarding(false);
    if (targetTab) {
      setActiveTab(targetTab);
    }
  };

  const userPhoto = userData?.photoURL || user?.photoURL || '';

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--label-primary)] font-sans overflow-hidden relative">
        <AnimatePresence>
          {showOnboarding && (
            <Onboarding onComplete={handleOnboardingComplete} user={user} />
          )}
        </AnimatePresence>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          
          {/* iOS Navigation Bar (Header) */}
          <header className="fixed top-0 left-0 right-0 lg:absolute z-[70] material-thin border-b border-[var(--separator)] flex items-center justify-between px-4 pb-2 pt-[env(safe-area-inset-top,16px)] h-[calc(env(safe-area-inset-top,0px)+52px)]">
            <div className="flex-1 flex items-center h-full">
               <button 
                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                 className="p-2 -ml-2 hidden lg:flex items-center gap-2 text-[var(--accent)] hover:opacity-80 transition-opacity"
               >
                 {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
                 <span className="font-bold text-lg hidden sm:block tracking-tight text-[var(--label-primary)]">CreatorOS</span>
               </button>
               {/* Mobile Logo Logo */}
               <div className="lg:hidden flex items-center gap-2">
                 <BrandIcon size={20} className="text-[var(--accent)]" />
                 <span className="font-bold tracking-tight text-[var(--label-primary)]">CreatorOS</span>
               </div>
            </div>
            
            <div className="flex flex-col items-center flex-1 justify-center h-full">
              <span className="font-semibold text-[17px] tracking-[-0.014em]">
                {visibleNavItems.find(item => item.id === activeTab)?.label}
              </span>
            </div>
            
            <div className="flex-1 flex justify-end h-full items-center gap-3">
              <div 
                onClick={() => setActiveTab('profile')}
                className="cursor-pointer active:scale-95 transition-transform"
              >
                <img 
                  src={userPhoto} 
                  alt="" 
                  className="w-8 h-8 rounded-full border border-[var(--separator)] object-cover shadow-sm bg-[var(--bg-secondary)]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </header>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 z-[60] hidden lg:block"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <motion.nav
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed top-[calc(env(safe-area-inset-top,0px)+60px)] left-4 w-80 bg-[var(--bg-secondary)] ios-card shadow-2xl z-[65] max-h-[80vh] overflow-y-auto custom-scrollbar border border-[var(--separator)] hidden lg:block"
                >
                  <div className="p-2 space-y-1">
                    {visibleNavItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.locked && projects.length === 0) return;
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                          activeTab === item.id 
                            ? "bg-[var(--accent)] text-white shadow-md shadow-[#007AFF1A]" 
                            : "text-[var(--label-secondary)] hover:bg-[var(--separator)]",
                          item.locked && projects.length === 0 && "opacity-40 cursor-not-allowed grayscale"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={20} className="flex-shrink-0" weight={activeTab === item.id ? "duotone" : "regular"} />
                          <span className="font-semibold text-[15px]">{item.label}</span>
                        </div>
                      </button>
                    ))}
                    
                    <div className="my-2 border-t border-[var(--separator)]" />
                    
                    <button 
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[var(--system-red)] hover:bg-[var(--separator)] transition-colors rounded-xl"
                    >
                      <LogOut size={20} />
                      <span className="text-[15px] font-semibold">Logout</span>
                    </button>
                  </div>
                </motion.nav>
              </>
            )}
          </AnimatePresence>

          <main className="flex-1 overflow-y-auto pt-[calc(env(safe-area-inset-top,0px)+64px)] pb-[calc(env(safe-area-inset-bottom,0px)+83px)] lg:pb-12 px-4 lg:px-10">
            <div className="max-w-[1400px] mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {(() => {
                    const Component = ActiveComponent as any;
                    
                    if (currentPath.startsWith('/help/')) {
                      const topicId = currentPath.replace('/help/', '');
                      return <HelpArticle topic={topicId} onBack={() => {
                        navigate('/'); // Reset path
                        setActiveTab('help');
                      }} />;
                    }
                    
                    return <Component brand={brand} setBrand={setBrand} setActiveTab={setActiveTab} navigate={navigate} user={user} userData={userData} projects={projects} />;
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* iOS Tab Bar (Mobile Only) */}
          <nav className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden material-thick border-t border-[var(--separator)] px-2 pb-[env(safe-area-inset-bottom,4px)] pt-1 h-[calc(env(safe-area-inset-bottom,0px)+49px)]">
            <div className="flex items-center justify-around h-full">
              {visibleNavItems.filter(item => ['home', 'create', 'brand', 'roadmap', 'profile'].includes(item.id)).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 gap-1 py-1 transition-colors",
                    activeTab === item.id ? "text-[var(--accent)]" : "text-[var(--label-secondary)]"
                  )}
                >
                  <item.icon size={23} weight={activeTab === item.id ? "duotone" : "regular"} />
                  <span className="text-[10px] font-medium tracking-[0.01em]">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </ErrorBoundary>
  );
}
