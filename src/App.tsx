import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  PieChart, 
  Settings,
  AlignLeft,
  XCircle,
  DollarSign,
  Trophy,
  LogOut,
  Loader2,
  UserCircle,
} from 'lucide-react';
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
import PromptArchitect from './components/PromptArchitect';
import Profile from './components/Profile';
import Login from './components/Login';
import LoadingScreen from './components/LoadingScreen';
import BrandIcon from './components/BrandIcon';
import { StudioIcon, HubIcon, RoadmapIcon, CommunityIcon, IntelligenceIcon, ProfileIcon } from './components/IdentityIcons';
import { BookOpen, Sparkles } from 'lucide-react';
import Onboarding from './components/Onboarding';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import LandingPage from './components/LandingPage';
import HelpCenter from './components/HelpCenter';
import CreatorHub from './components/CreatorHub';
import SupportHub from './components/SupportHub';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ShieldCheck } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: HubIcon, component: Dashboard },
  { id: 'create', label: 'Create', icon: StudioIcon, component: ContentStudio },
  { id: 'brand', label: 'Brand', icon: BrandIcon, component: BrandingEngine },
  { id: 'roadmap', label: 'Roadmap', icon: RoadmapIcon, component: Roadmap },
  { id: 'hub', label: 'Creator Hub', icon: HubIcon, component: CreatorHub, locked: true },
  { id: 'community', label: 'Community', icon: CommunityIcon, component: Community },
  { id: 'reports', label: 'Reports', icon: IntelligenceIcon, component: Reports },
  { id: 'help', label: 'Help', icon: BookOpen, component: HelpCenter },
  { id: 'prompts', label: 'Architect', icon: Sparkles, component: PromptArchitect },
  { id: 'profile', label: 'Profile', icon: ProfileIcon, component: Profile },
  { id: 'support', label: 'Support Hub', icon: ShieldCheck, component: SupportHub, devOnly: true },
];

const DEVELOPER_EMAILS = ['danengelsman@gmail.com'];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  if (!user) {
    document.body.classList.remove('is-app');
    return <LandingPage />;
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
            <Onboarding onComplete={handleOnboardingComplete} />
          )}
        </AnimatePresence>
        
        {/* Sidebar (Desktop Only) */}
        <motion.aside 
          initial={false}
          animate={{ 
            width: isSidebarOpen ? 240 : 80,
          }}
          className={cn(
            "bg-[var(--bg-secondary)] border-r border-[var(--separator)] flex flex-col z-[70] hidden lg:flex h-full",
          )}
        >
          <div className="h-[env(safe-area-inset-top,64px)] flex items-center px-6">
            <div className={cn("flex items-center gap-3 transition-opacity", !isSidebarOpen && "opacity-0")}>
              <BrandIcon size={20} className="text-[var(--accent)]" />
              <span className="font-bold text-xl tracking-tight">CreatorOS</span>
            </div>
            {!isSidebarOpen && (
              <div className="absolute inset-x-0 top-0 h-16 flex items-center justify-center">
                 <BrandIcon size={20} className="text-[var(--accent)]" />
              </div>
            )}
          </div>

          <nav className="flex-1 px-3 space-y-1 mt-2">
            {visibleNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.locked && projects.length === 0) return;
                  setActiveTab(item.id);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all group relative h-[44px]",
                  activeTab === item.id 
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[#007AFF1A]" 
                    : "text-[var(--label-secondary)] hover:bg-[var(--separator)]",
                  item.locked && projects.length === 0 && "opacity-40 cursor-not-allowed grayscale"
                )}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="font-semibold text-[15px]">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-[var(--separator)] space-y-1 pb-[env(safe-area-inset-bottom,12px)]">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center gap-3 px-4 py-2 text-[var(--label-secondary)] hover:text-[var(--label-primary)] transition-colors rounded-xl h-[44px]"
            >
              {isSidebarOpen ? <XCircle size={18} /> : <AlignLeft size={18} className="mx-auto" />}
              {isSidebarOpen && <span className="text-[15px] font-semibold">Collapse</span>}
            </button>
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-2 text-[var(--system-red)] transition-colors rounded-xl h-[44px]"
            >
              <LogOut size={18} className={cn(!isSidebarOpen && "mx-auto")} />
              {isSidebarOpen && <span className="text-[15px] font-semibold">Logout</span>}
            </button>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          
          {/* iOS Navigation Bar (Header) */}
          <header className="fixed top-0 left-0 right-0 lg:absolute z-50 material-thin border-b border-[var(--separator)] flex items-center justify-between px-4 pb-2 pt-[env(safe-area-inset-top,16px)] h-[calc(env(safe-area-inset-top,0px)+52px)]">
            <div className="flex-1">
               {/* Leading item (empty usually or Back) */}
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <span className="font-semibold text-[17px] tracking-[-0.014em]">
                {visibleNavItems.find(item => item.id === activeTab)?.label}
              </span>
            </div>
            
            <div className="flex-1 flex justify-end gap-3">
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
                    return <Component brand={brand} setBrand={setBrand} setActiveTab={setActiveTab} user={user} userData={userData} projects={projects} />;
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
                  <item.icon size={23} />
                  <span className="text-[10px] font-medium tracking-[0.01em]">
                    {item.label === 'Home' ? 'Insights' : item.label === 'Brand' ? 'Identity' : item.label}
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
