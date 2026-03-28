import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  PenTool, 
  Palette, 
  Compass, 
  Users2, 
  PieChart, 
  Settings,
  AlignLeft,
  XCircle,
  DollarSign,
  Trophy,
  LogOut,
  Loader2,
  UserCircle
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
import Profile from './components/Profile';
import Login from './components/Login';
import LoadingScreen from './components/LoadingScreen';
import BrandIcon from './components/BrandIcon';
import Onboarding from './components/Onboarding';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { ErrorBoundary } from './components/ErrorBoundary';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: LayoutGrid, component: Dashboard },
  { id: 'create', label: 'Create', icon: PenTool, component: ContentStudio },
  { id: 'brand', label: 'Brand', icon: Palette, component: BrandingEngine },
  { id: 'roadmap', label: 'Roadmap', icon: Compass, component: Roadmap },
  { id: 'community', label: 'Community', icon: Users2, component: Community },
  { id: 'reports', label: 'Reports', icon: PieChart, component: Reports },
  { id: 'profile', label: 'Profile', icon: UserCircle, component: Profile },
];

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

  const ActiveComponent = NAV_ITEMS.find(item => item.id === activeTab)?.component || Dashboard;

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
    return <Login />;
  }

  const handleOnboardingComplete = (targetTab?: string) => {
    setShowOnboarding(false);
    if (targetTab) {
      setActiveTab(targetTab);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-premium-bg text-premium-ink font-sans overflow-hidden relative">
        <AnimatePresence>
          {showOnboarding && (
            <Onboarding onComplete={handleOnboardingComplete} />
          )}
        </AnimatePresence>
        
        {/* Atmospheric Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-violet/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-emerald/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-accent-gold/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 240 : 80,
          x: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -240 : 0)
        }}
        className={cn(
          "bg-premium-surface border-r border-premium-border flex flex-col z-[70] fixed md:relative h-full transition-transform md:translate-x-0",
          !isMobileMenuOpen && "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-20 flex items-center px-6">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-premium-ink rounded-xl flex items-center justify-center shadow-lg shadow-black/5">
                <BrandIcon size={20} className="text-white" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-premium-ink">CreatorOS</span>
            </div>
          ) : (
            <div className="w-9 h-9 bg-premium-ink rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-black/5">
              <BrandIcon size={20} className="text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative",
                activeTab === item.id 
                  ? "bg-premium-ink text-white shadow-xl shadow-black/10" 
                  : "text-premium-muted hover:bg-black/[0.03] hover:text-premium-ink"
              )}
            >
              <item.icon className={cn(
                "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                activeTab === item.id ? "text-white" : "text-premium-muted group-hover:text-premium-ink"
              )} />
              {isSidebarOpen && <span className="font-medium text-[14px]">{item.label}</span>}
              {activeTab === item.id && !isSidebarOpen && (
                <div className="absolute left-0 w-1 h-5 bg-premium-ink rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-premium-border space-y-1">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-premium-muted hover:text-premium-ink transition-colors rounded-xl hover:bg-black/[0.03]"
          >
            {isSidebarOpen ? <XCircle className="w-[18px] h-[18px]" /> : <AlignLeft className="w-[18px] h-[18px] mx-auto" />}
            {isSidebarOpen && <span className="text-[14px] font-medium">Collapse</span>}
          </button>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
          >
            <LogOut className={cn("w-[18px] h-[18px]", !isSidebarOpen && "mx-auto")} />
            {isSidebarOpen && <span className="text-[14px] font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-premium-bg">
        {/* Header */}
        <header className="sticky top-0 bg-premium-ink text-white px-4 md:px-8 h-16 flex items-center justify-between z-40 shadow-xl">
          <div className="flex items-center gap-4 w-1/3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <AlignLeft className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-2 w-1/3">
            <BrandIcon size={16} className="text-accent-gold" glow />
            <span className="font-serif font-bold text-lg tracking-tight">CreatorOS</span>
          </div>
          
          <div className="flex items-center justify-end gap-3 md:gap-4 w-1/3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <div className="w-1 h-1 rounded-full bg-accent-emerald animate-pulse" />
              <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">System Live</span>
            </div>
            <img 
              src={user.photoURL || ''} 
              alt={user.displayName || 'User'} 
              className="w-8 h-8 rounded-full border border-white/10 shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        </header>

        <div className="px-4 md:px-10 pt-20 pb-20 max-w-[1400px] mx-auto">
          {/* Section Indicator */}
          <div className="mb-6 md:mb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-premium-muted/60">
              {NAV_ITEMS.find(item => item.id === activeTab)?.label}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              {(() => {
                const Component = ActiveComponent as any;
                return <Component brand={brand} setBrand={setBrand} setActiveTab={setActiveTab} user={user} userData={userData} projects={projects} />;
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}
