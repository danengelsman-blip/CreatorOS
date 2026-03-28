import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  ExternalLink, 
  Share2, 
  Award, 
  Zap, 
  TrendingUp, 
  Globe, 
  Camera, 
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db, updateProfile, handleFirestoreError, OperationType, compressBase64Image } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import AvatarGenerator from './AvatarGenerator';
import BrandIcon from './BrandIcon';

import { User as FirebaseUser } from 'firebase/auth';

export default function Profile({ user, userData, brand }: { user: FirebaseUser, userData: any, brand: any }) {
  const [isUploading, setIsUploading] = useState(false);
  const [showAvatarGenerator, setShowAvatarGenerator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setIsUploading(true);
    try {
      // Convert to base64 for storage since we don't have Firebase Storage set up
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        
        try {
          const compressedBase64 = await compressBase64Image(rawBase64);
          
          // 1. Update Firebase Auth Profile
          await updateProfile(auth.currentUser!, {
            photoURL: compressedBase64
          });

          // 2. Update Firestore User Document
          const userRef = doc(db, 'users', auth.currentUser!.uid);
          await updateDoc(userRef, {
            photoURL: compressedBase64,
            avatarType: 'uploaded',
            updatedAt: new Date().toISOString()
          });

          // Force a reload or update local state if needed
          window.location.reload(); 
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser?.uid}`);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-10">
      <AnimatePresence>
        {showAvatarGenerator && (
          <AvatarGenerator 
            onClose={() => setShowAvatarGenerator(false)} 
            onAvatarSet={() => window.location.reload()} 
          />
        )}
      </AnimatePresence>

      <div className="p-10 bg-premium-ink text-white relative overflow-hidden shadow-2xl shadow-black/20 border border-premium-border rounded-[24px] transition-all duration-300">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
              <img 
                src={user?.photoURL || 'https://picsum.photos/seed/user/200/200'} 
                alt={user?.displayName} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 bg-white/20 hover:bg-white/40 rounded-xl transition-all"
                  title="Upload Photo"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent-emerald rounded-2xl flex items-center justify-center border-4 border-premium-ink">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <h2 className="text-4xl font-extrabold tracking-tight">{userData?.displayName || user?.displayName || 'Creator'}</h2>
                {userData?.accountStatus && (
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg",
                    userData.accountStatus === 'active' 
                      ? "bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30" 
                      : "bg-amber-500/20 text-amber-500 border-amber-500/30"
                  )}>
                    {userData.accountStatus}
                  </div>
                )}
                {userData?.avatarType === 'ai_generated' && (
                  <div className="px-2 py-0.5 bg-accent-violet/20 text-accent-violet rounded-md text-[10px] font-bold uppercase tracking-widest border border-accent-violet/20 flex items-center gap-1">
                    <BrandIcon size={12} />
                    AI Avatar
                  </div>
                )}
              </div>
              <p className="text-white/50 font-medium flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="px-4 py-1.5 bg-white/10 rounded-full text-[11px] font-bold uppercase tracking-widest border border-white/10 backdrop-blur-md">
                {brand?.archetype || 'Visionary'} Creator
              </div>
              <div className="px-4 py-1.5 bg-accent-violet/20 text-accent-violet rounded-full text-[11px] font-bold uppercase tracking-widest border border-accent-violet/20">
                Pro Member
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setShowAvatarGenerator(true)}
              className="px-8 py-4 bg-accent-violet text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <BrandIcon size={16} />
              Generate AI Avatar
            </button>
            <div className="flex gap-3">
              <button className="flex-1 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="flex-1 px-8 py-4 bg-premium-surface border border-premium-border text-premium-ink rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-violet/10 rounded-full blur-[100px] -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-emerald/10 rounded-full blur-[100px] -ml-20 -mb-20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Reach', value: '124.5K', icon: TrendingUp, color: 'text-accent-violet' },
          { label: 'Content Score', value: '94/100', icon: Award, color: 'text-accent-gold' },
          { label: 'Streak Days', value: '42', icon: Zap, color: 'text-accent-emerald' },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-8 bg-premium-surface">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-premium-muted uppercase tracking-[0.2em]">{stat.label}</span>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="premium-card p-10 bg-premium-surface">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Globe className="w-6 h-6 text-accent-cobalt" />
            Public Portfolio
          </h3>
          <div className="space-y-6">
            <div className="p-6 bg-premium-bg rounded-2xl border border-premium-border">
              <p className="text-sm font-bold text-premium-muted uppercase tracking-widest mb-2">Live URL</p>
              <div className="flex items-center justify-between gap-4">
                <code className="text-accent-cobalt font-mono text-sm truncate">creatoros.app/profile/{user?.uid?.slice(0, 8)}</code>
                <ExternalLink className="w-4 h-4 text-premium-muted cursor-pointer hover:text-premium-ink" />
              </div>
            </div>
            <p className="text-premium-muted text-sm leading-relaxed">
              Your public portfolio is active and indexing. Every piece of content you "Publish" in the Content Studio is automatically showcased here.
            </p>
            <button className="w-full py-4 bg-premium-ink text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
              Customize Portfolio
            </button>
          </div>
        </div>

        <div className="premium-card p-10 bg-premium-surface">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-accent-violet" />
            Account Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-bottom border-premium-border">
              <span className="text-premium-muted font-medium">Member Since</span>
              <span className="font-bold">March 2024</span>
            </div>
            <div className="flex items-center justify-between py-3 border-bottom border-premium-border">
              <span className="text-premium-muted font-medium">Plan</span>
              <span className="font-bold text-accent-violet">{userData?.subscriptionTier === 'pro' ? 'Creator Pro' : 'Free Plan'}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-bottom border-premium-border">
              <span className="text-premium-muted font-medium">Account Status</span>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  userData?.accountStatus === 'active' ? "bg-accent-emerald" : "bg-amber-500"
                )} />
                <span className="font-bold capitalize">{userData?.accountStatus || 'Active'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-bottom border-premium-border">
              <span className="text-premium-muted font-medium">Connected Accounts</span>
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-black rounded-full" />
                <div className="w-6 h-6 bg-blue-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
