'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../../components/AuthProvider';
import { 
  Loader2, Save, User, BookOpen, Briefcase, Award, Globe, 
  MapPin, GraduationCap, Building, Trophy, Calendar, CheckCircle2,
  Cpu, Workflow, AlertCircle, Plus, Trash2, Mail, Link as LinkIcon,
  Download, FileJson, ShieldCheck, LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  field: string;
  startYear: string;
  endYear: string;
}

interface CareerItem {
  id: string;
  position: string;
  organization: string;
  location: string;
  startYear: string;
  endYear: string;
}

export default function UserPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  // Navigation Tabs matching Material 3 tab bars
  const [activeTab, setActiveTab] = useState<'profile' | 'education' | 'career' | 'scholar' | 'agents'>('profile');
  
  const [profile, setProfile] = useState<any>({
    full_name: '',
    bio: '',
    orcid: '',
    demographics: {
      age: '',
      gender: '',
      nationality: '',
      location: '',
      affiliation: '',
      academicTitle: '',
      primaryDiscipline: '',
      secondaryDiscipline: '',
      preferredLanguage: '',
    },
    education: [] as EducationItem[],
    career: [] as CareerItem[],
    publications: [] as string[],
    awards: [] as string[],
    modelSettings: {
      engine: 'gemini-3.5-flash'
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Temp list input states
  const [newPub, setNewPub] = useState('');
  const [newAward, setNewAward] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    const loadProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (active && snap.exists()) {
          const data = snap.data();
          // Ensure structure is correct
          setProfile({
            full_name: data.full_name || '',
            bio: data.bio || '',
            orcid: data.orcid || '',
            demographics: {
              age: data.demographics?.age || '',
              gender: data.demographics?.gender || '',
              nationality: data.demographics?.nationality || '',
              location: data.demographics?.location || '',
              affiliation: data.demographics?.affiliation || '',
              academicTitle: data.demographics?.academicTitle || '',
              primaryDiscipline: data.demographics?.primaryDiscipline || '',
              secondaryDiscipline: data.demographics?.secondaryDiscipline || '',
              preferredLanguage: data.demographics?.preferredLanguage || '',
            },
            education: data.education || [],
            career: data.career || [],
            publications: data.publications || [],
            awards: data.awards || [],
            modelSettings: {
              engine: data.modelSettings?.engine || 'gemini-3.5-flash'
            }
          });
        }
      } catch (err) {
        console.warn("Could not load user settings profile from Firestore:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveStatus({ type: null, message: '' });
    try {
      await setDoc(doc(db, 'users', user.uid), { ...profile, uid: user.uid }, { merge: true });
      setSaveStatus({ type: 'success', message: 'Your settings and multi-agent configurations have been successfully saved.' });
      
      // Auto dismiss banner after 4 seconds
      setTimeout(() => {
        setSaveStatus({ type: null, message: '' });
      }, 4000);
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || 'Failed to save settings to cloud servers.' });
    } finally {
      setSaving(false);
    }
  };

  // Education Helpers
  const addEducation = () => {
    const newItem: EducationItem = {
      id: Math.random().toString(36).substring(2, 9),
      degree: '',
      institution: '',
      field: '',
      startYear: '',
      endYear: ''
    };
    setProfile({
      ...profile,
      education: [...profile.education, newItem]
    });
  };

  const removeEducation = (id: string) => {
    setProfile({
      ...profile,
      education: profile.education.filter((item: any) => item.id !== id)
    });
  };

  const updateEducation = (id: string, field: keyof EducationItem, val: string) => {
    setProfile({
      ...profile,
      education: profile.education.map((item: any) => item.id === id ? { ...item, [field]: val } : item)
    });
  };

  // Career Helpers
  const addCareer = () => {
    const newItem: CareerItem = {
      id: Math.random().toString(36).substring(2, 9),
      position: '',
      organization: '',
      location: '',
      startYear: '',
      endYear: ''
    };
    setProfile({
      ...profile,
      career: [...profile.career, newItem]
    });
  };

  const removeCareer = (id: string) => {
    setProfile({
      ...profile,
      career: profile.career.filter((item: any) => item.id !== id)
    });
  };

  const updateCareer = (id: string, field: keyof CareerItem, val: string) => {
    setProfile({
      ...profile,
      career: profile.career.map((item: any) => item.id === id ? { ...item, [field]: val } : item)
    });
  };

  // Publications & Awards list updates
  const addPublication = () => {
    if (!newPub.trim()) return;
    setProfile({
      ...profile,
      publications: [...profile.publications, newPub.trim()]
    });
    setNewPub('');
  };

  const removePublication = (index: number) => {
    setProfile({
      ...profile,
      publications: profile.publications.filter((_: any, idx: number) => idx !== index)
    });
  };

  const addAward = () => {
    if (!newAward.trim()) return;
    setProfile({
      ...profile,
      awards: [...profile.awards, newAward.trim()]
    });
    setNewAward('');
  };

  const removeAward = (index: number) => {
    setProfile({
      ...profile,
      awards: profile.awards.filter((_: any, idx: number) => idx !== index)
    });
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-6 pt-8 w-full px-4">
      {/* Skeleton Title block */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-3 w-full max-w-sm">
          <div className="h-8 bg-[#68BA7F]/20 rounded-md w-3/4 animate-pulse"></div>
          <div className="h-4 bg-[#68BA7F]/10 rounded w-full animate-pulse"></div>
        </div>
        <div className="h-10 bg-[#68BA7F]/20 rounded-[1.25rem] w-32 animate-pulse"></div>
      </div>
      
      {/* Skeleton Header Card */}
      <div className="p-6 rounded-[1.25rem] bg-white border border-[#68BA7F]/20 shadow-sm flex items-center gap-6 animate-pulse">
        <div className="w-20 h-20 rounded-full bg-[#68BA7F]/20"></div>
        <div className="space-y-3">
          <div className="h-6 bg-[#68BA7F]/20 rounded w-48"></div>
          <div className="h-4 bg-[#68BA7F]/10 rounded w-32"></div>
        </div>
      </div>
      
      {/* Skeleton Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-3 pt-4">
          <div className="h-8 bg-[#68BA7F]/10 rounded w-full animate-pulse"></div>
          <div className="h-8 bg-[#68BA7F]/10 rounded w-full animate-pulse"></div>
          <div className="h-8 bg-[#68BA7F]/10 rounded w-full animate-pulse"></div>
        </div>
        <div className="md:col-span-3">
          <div className="p-6 rounded-[1.25rem] bg-white border border-[#68BA7F]/20 shadow-sm space-y-6 animate-pulse">
            <div className="h-6 bg-[#68BA7F]/20 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-[#68BA7F]/10 rounded-md w-full"></div>
              <div className="h-12 bg-[#68BA7F]/10 rounded-md w-full"></div>
              <div className="h-12 bg-[#68BA7F]/10 rounded-md w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Title block */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#253D2C] tracking-tight">{user?.displayName || 'User'} Profile & Settings</h1>
          <p className="text-sm text-[#2E6F40]/80">Manage identity, demographics, and multi-agent orchestration.</p>
        </div>
        
        <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="px-6 py-3 bg-[#2E6F40] hover:bg-[#253D2C] text-white rounded-[1.25rem] font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm shrink-0"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save size={16}/>}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={async () => { await signOut(); router.push('/login'); }}
              className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-[1.25rem] font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg text-sm shrink-0"
            >
              <LogOut size={16}/> Sign Out
            </button>
        </div>
      </div>

      {/* Save status notification block */}
      {saveStatus.type && (
        <div className={`p-4 rounded-[1.25rem] border flex items-center gap-3 text-sm animate-in fade-in duration-300 ${
          saveStatus.type === 'success' 
            ? 'bg-[#CFFFDC]/95 border-[#68BA7F] text-[#253D2C]' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {saveStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-[#2E6F40] shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Material 3 Expressive Tabs Bar */}
      <div className="flex border-b border-[#68BA7F]/20 mb-6">
        {[
          { id: 'profile', label: 'Demographics', icon: User },
          { id: 'education', label: 'Education', icon: BookOpen },
          { id: 'career', label: 'Career History', icon: Briefcase },
          { id: 'scholar', label: 'Portfolio', icon: Award },
          { id: 'agents', label: 'Multi-Agent Swarm', icon: Cpu },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex justify-center items-center gap-2 py-4 text-xs sm:text-sm font-bold tracking-tight transition-all relative ${
              activeTab === tab.id ? 'text-[#2E6F40]' : 'text-[#2e6f40]/60 hover:text-[#2E6F40]'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 w-full h-1 bg-[#2E6F40] rounded-t-full animate-in slide-in-from-bottom-2 duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-[#68BA7F]/20 rounded-[1.5rem] p-6 sm:p-8 shadow-sm">
        
        {/* TAB 1: DEMOGRAPHICS */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#68BA7F]/10 pb-3 mb-4">
              <User className="text-[#2E6F40]" size={22} />
              <h2 className="text-xl font-bold text-[#253D2C]">Academic Profile & Demographics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Full Name</label>
                <input 
                  type="text"
                  className="w-full p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-[#253D2C] bg-[#F4F9F5]/20 text-sm" 
                  placeholder="e.g. Dr. Ada Lovelace" 
                  value={profile.full_name || ''} 
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">ORCID iD</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-green-600 font-mono text-[10px] uppercase font-bold tracking-wide">orcid.org/</span>
                  <input 
                    type="text"
                    className="w-full pl-24 pr-3 p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-[#253D2C] bg-[#F4F9F5]/20 text-sm font-mono" 
                    placeholder="0000-0002-1825-0097" 
                    value={profile.orcid || ''} 
                    onChange={(e) => setProfile({...profile, orcid: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Research Bio & Scientific Intersections</label>
                <textarea 
                  className="w-full p-3 h-28 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-[#253D2C] bg-[#F4F9F5]/20 text-sm resize-none" 
                  placeholder="Tell CatalystLab about your specialized research focuses..." 
                  value={profile.bio || ''} 
                  onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                />
              </div>

              {/* Sub Grids for Demographics Metadata */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider font-mono">Academic Title / Affiliation</label>
                <input 
                  type="text"
                  className="w-full p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-[#253D2C] bg-[#F4F9F5]/20 text-sm" 
                  placeholder="Assistant Professor, MIT" 
                  value={profile.demographics?.affiliation || ''} 
                  onChange={(e) => setProfile({
                    ...profile,
                    demographics: { ...profile.demographics, affiliation: e.target.value }
                  })} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Primary Research Discipline</label>
                <input 
                  type="text"
                  className="w-full p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-[#253D2C] bg-[#F4F9F5]/20 text-sm" 
                  placeholder="Bioinformatics, Quantum Materials, etc." 
                  value={profile.demographics?.primaryDiscipline || ''} 
                  onChange={(e) => setProfile({
                    ...profile,
                    demographics: { ...profile.demographics, primaryDiscipline: e.target.value }
                  })} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Secondary Specialized Sub-Field</label>
                <input 
                  type="text"
                  className="w-full p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-[#253D2C] bg-[#F4F9F5]/20 text-sm" 
                  placeholder="Deep Reinforcement Learning, Complex Networks" 
                  value={profile.demographics?.secondaryDiscipline || ''} 
                  onChange={(e) => setProfile({
                    ...profile,
                    demographics: { ...profile.demographics, secondaryDiscipline: e.target.value }
                  })} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Country / Primary Geographic Base</label>
                <input 
                  type="text"
                  className="w-full p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-[#253D2C] bg-[#F4F9F5]/20 text-sm" 
                  placeholder="United States, Bangladesh, Germany" 
                  value={profile.demographics?.location || ''} 
                  onChange={(e) => setProfile({
                    ...profile,
                    demographics: { ...profile.demographics, location: e.target.value }
                  })} 
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Age Group</label>
                  <input 
                    type="text"
                    className="w-full p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-[#253D2C] bg-[#F4F9F5]/20 text-sm" 
                    placeholder="e.g. 29" 
                    value={profile.demographics?.age || ''} 
                    onChange={(e) => setProfile({
                      ...profile,
                      demographics: { ...profile.demographics, age: e.target.value }
                    })} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Gender</label>
                  <input 
                    type="text"
                    className="w-full p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-[#253D2C] bg-[#F4F9F5]/20 text-sm" 
                    placeholder="e.g. Female" 
                    value={profile.demographics?.gender || ''} 
                    onChange={(e) => setProfile({
                      ...profile,
                      demographics: { ...profile.demographics, gender: e.target.value }
                    })} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Language</label>
                  <input 
                    type="text"
                    className="w-full p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-[#253D2C] bg-[#F4F9F5]/20 text-sm" 
                    placeholder="e.g. English" 
                    value={profile.demographics?.preferredLanguage || ''} 
                    onChange={(e) => setProfile({
                      ...profile,
                      demographics: { ...profile.demographics, preferredLanguage: e.target.value }
                    })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Nationality</label>
                <input 
                  type="text"
                  className="w-full p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-[#253D2C] bg-[#F4F9F5]/20 text-sm" 
                  placeholder="Global, or specific state" 
                  value={profile.demographics?.nationality || ''} 
                  onChange={(e) => setProfile({
                    ...profile,
                    demographics: { ...profile.demographics, nationality: e.target.value }
                  })} 
                />
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: EDUCATION (Highly intuitive dynamic lists in Material 3 style) */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#68BA7F]/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-[#2E6F40]" size={22} />
                <h2 className="text-xl font-bold text-[#253D2C]">Academic Credentials & Degrees</h2>
              </div>
              <button 
                onClick={addEducation}
                className="flex items-center gap-1 px-4 py-2 bg-[#F4F9F5] hover:bg-[#CFFFDC] text-[#2E6F40] font-bold text-xs rounded-full border border-[#68BA7F]/30 transition-all shrink-0"
              >
                <Plus size={14} /> Add Degree
              </button>
            </div>

            {profile.education.length === 0 ? (
              <div className="text-center py-12 bg-[#F4F9F5]/40 rounded-3xl border border-dashed border-[#68BA7F]/20">
                <GraduationCap className="w-12 h-12 text-[#2E6F40]/30 mx-auto mb-2" />
                <p className="text-[#253D2C]/60 text-sm">No education credentials declared yet.</p>
                <button 
                  onClick={addEducation}
                  className="mt-4 px-4 py-2 bg-[#2E6F40] text-white text-xs font-bold rounded-xl hover:bg-[#253D2C] transition-colors"
                >
                  Configure My First Degree
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.education.map((item: EducationItem, idx: number) => (
                  <div key={item.id || idx} className="p-5 rounded-2xl bg-[#F4F9F5]/30 border border-[#68BA7F]/20 relative group hover:border-[#68BA7F]/50 transition-all space-y-4 shadow-sm">
                    
                    <button 
                      onClick={() => removeEducation(item.id)}
                      className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition"
                      title="Remove this credential"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="pr-8 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#CFFFDC] text-[#2E6F40] font-bold text-[10px] flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-[#253D2C]">Academic Degree Block</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#2E6F40]/80 uppercase tracking-widest">Degree (e.g. Ph.D)</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 bg-white border border-[#68BA7F]/30 rounded-lg text-sm focus:ring-1 focus:ring-[#2E6F40] focus:outline-none"
                          placeholder="Ph.D., M.Sc., B.S." 
                          value={item.degree} 
                          onChange={(e) => updateEducation(item.id, 'degree', e.target.value)} 
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#2E6F40]/80 uppercase tracking-widest">School / University</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 bg-white border border-[#68BA7F]/30 rounded-lg text-sm focus:ring-1 focus:ring-[#2E6F40] focus:outline-none"
                          placeholder="Stanford University, Oxford" 
                          value={item.institution} 
                          onChange={(e) => updateEducation(item.id, 'institution', e.target.value)} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#2E6F40]/80 uppercase tracking-widest">Field of Study</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 bg-white border border-[#68BA7F]/30 rounded-lg text-sm focus:ring-1 focus:ring-[#2E6F40] focus:outline-none"
                          placeholder="Astrophysics, Computer Science" 
                          value={item.field} 
                          onChange={(e) => updateEducation(item.id, 'field', e.target.value)} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#2E6F40]/80 uppercase tracking-widest font-mono">Start Year</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 bg-white border border-[#68BA7F]/30 rounded-lg text-sm focus:ring-1 focus:ring-[#2E6F40] focus:outline-none font-mono"
                          placeholder="e.g. 2018" 
                          value={item.startYear} 
                          onChange={(e) => updateEducation(item.id, 'startYear', e.target.value)} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#2E6F40]/80 uppercase tracking-widest font-mono">End Year (or Present)</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 bg-white border border-[#68BA7F]/30 rounded-lg text-sm focus:ring-1 focus:ring-[#2E6F40] focus:outline-none font-mono"
                          placeholder="e.g. 2022" 
                          value={item.endYear} 
                          onChange={(e) => updateEducation(item.id, 'endYear', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CAREER HISTORY */}
        {activeTab === 'career' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#68BA7F]/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="text-[#2E6F40]" size={22} />
                <h2 className="text-xl font-bold text-[#253D2C]">Professional Career Log</h2>
              </div>
              <button 
                onClick={addCareer}
                className="flex items-center gap-1 px-4 py-2 bg-[#F4F9F5] hover:bg-[#CFFFDC] text-[#2E6F40] font-bold text-xs rounded-full border border-[#68BA7F]/30 transition-all shrink-0"
              >
                <Plus size={14} /> Add Position
              </button>
            </div>

            {profile.career.length === 0 ? (
              <div className="text-center py-12 bg-[#F4F9F5]/40 rounded-3xl border border-dashed border-[#68BA7F]/20">
                <Briefcase className="w-12 h-12 text-[#2E6F40]/30 mx-auto mb-2" />
                <p className="text-[#253D2C]/60 text-sm">No careers logged yet.</p>
                <button 
                  onClick={addCareer}
                  className="mt-4 px-4 py-2 bg-[#2E6F40] text-white text-xs font-bold rounded-xl hover:bg-[#253D2C] transition-colors"
                >
                  Record Core Achievements
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.career.map((item: CareerItem, idx: number) => (
                  <div key={item.id || idx} className="p-5 rounded-2xl bg-[#F4F9F5]/30 border border-[#68BA7F]/20 relative group hover:border-[#68BA7F]/50 transition-all space-y-4 shadow-sm">
                    
                    <button 
                      onClick={() => removeCareer(item.id)}
                      className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition"
                      title="Remove this career block"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="pr-8 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#CFFFDC] text-[#2E6F40] font-bold text-[10px] flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-[#253D2C]">Career Node Block</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#2E6F40]/80 uppercase tracking-widest">Position / Title</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 bg-white border border-[#68BA7F]/30 rounded-lg text-sm focus:ring-1 focus:ring-[#2E6F40] focus:outline-none"
                          placeholder="Senior Principal Scientist, DeepMind" 
                          value={item.position} 
                          onChange={(e) => updateCareer(item.id, 'position', e.target.value)} 
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#2E6F40]/80 uppercase tracking-widest">Institute / Company</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 bg-white border border-[#68BA7F]/30 rounded-lg text-sm focus:ring-1 focus:ring-[#2E6F40] focus:outline-none"
                          placeholder="CERN, Google, MIT Labs" 
                          value={item.organization} 
                          onChange={(e) => updateCareer(item.id, 'organization', e.target.value)} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#2E6F40]/80 uppercase tracking-widest">Geographical Location</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 bg-white border border-[#68BA7F]/30 rounded-lg text-sm focus:ring-1 focus:ring-[#2E6F40] focus:outline-none"
                          placeholder="Geneva, Switzerland" 
                          value={item.location} 
                          onChange={(e) => updateCareer(item.id, 'location', e.target.value)} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#2E6F40]/80 uppercase tracking-widest font-mono">Start Year (e.g. 2012)</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 bg-white border border-[#68BA7F]/30 rounded-lg text-sm focus:ring-1 focus:ring-[#2E6F40] focus:outline-none font-mono"
                          placeholder="e.g. 2021" 
                          value={item.startYear} 
                          onChange={(e) => updateCareer(item.id, 'startYear', e.target.value)} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#2E6F40]/80 uppercase tracking-widest font-mono">End Year (or Present)</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 bg-white border border-[#68BA7F]/30 rounded-lg text-sm focus:ring-1 focus:ring-[#2E6F40] focus:outline-none"
                          placeholder="Present, or 2025" 
                          value={item.endYear} 
                          onChange={(e) => updateCareer(item.id, 'endYear', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PORTFOLIO (Publications & Awards) */}
        {activeTab === 'scholar' && (
          <div className="space-y-8">
            {/* Publications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#68BA7F]/10 pb-3">
                <BookOpen className="text-[#2E6F40]" size={20} />
                <h3 className="text-lg font-bold text-[#253D2C]">Selected Publications</h3>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  className="flex-1 p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-sm bg-[#F4F9F5]/20 text-[#253D2C]" 
                  placeholder="Insert DOI, Citation mapping, or publication title..." 
                  value={newPub}
                  onChange={(e) => setNewPub(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPublication()}
                />
                <button 
                  onClick={addPublication}
                  className="px-5 bg-[#2E6F40] text-white font-bold rounded-xl hover:bg-[#253D2C] transition-colors focus:ring-1 focus:ring-indigo-600 text-xs sm:text-sm shrink-0"
                >
                  Add Publication
                </button>
              </div>

              {profile.publications.length === 0 ? (
                <p className="text-xs text-[#2E6F40]/60 italic pl-1">No publications cataloged yet.</p>
              ) : (
                <div className="divide-y divide-[#68BA7F]/10 border border-[#68BA7F]/20 rounded-xl overflow-hidden bg-[#F4F9F5]/20">
                  {profile.publications.map((pub: string, ip: number) => (
                    <div key={ip} className="flex items-center justify-between p-3 hover:bg-[#CFFFDC]/20 transition-all gap-4 text-sm text-[#253D2C]">
                      <span className="leading-relaxed font-mono text-xs pl-1 flex items-baseline gap-2">
                        <span className="text-[#2E6F40] font-bold">[{ip+1}]</span> {pub}
                      </span>
                      <button 
                        onClick={() => removePublication(ip)}
                        className="p-1 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition shrink-0"
                        title="Delete publication"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Awards */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#68BA7F]/10 pb-3">
                <Trophy className="text-[#2E6F40]" size={20} />
                <h3 className="text-lg font-bold text-[#253D2C]">Scholarly Awards & Academic Recognition</h3>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  className="flex-1 p-3 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-sm bg-[#F4F9F5]/20 text-[#253D2C]" 
                  placeholder="National Science Fellowship, Nobel Prize Shortlist..." 
                  value={newAward}
                  onChange={(e) => setNewAward(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAward()}
                />
                <button 
                  onClick={addAward}
                  className="px-5 bg-[#2E6F40] text-white font-bold rounded-xl hover:bg-[#253D2C] transition-colors focus:ring-1 focus:ring-indigo-600 text-xs sm:text-sm shrink-0"
                >
                  Add Award
                </button>
              </div>

              {profile.awards.length === 0 ? (
                <p className="text-xs text-[#2E6F40]/60 italic pl-1">No major awards logged yet.</p>
              ) : (
                <div className="divide-y divide-[#68BA7F]/10 border border-[#68BA7F]/20 rounded-xl overflow-hidden bg-[#F4F9F5]/20">
                  {profile.awards.map((award: string, aw: number) => (
                    <div key={aw} className="flex items-center justify-between p-3 hover:bg-[#CFFFDC]/20 transition-all gap-4 text-sm text-[#253D2C]">
                      <span className="leading-relaxed font-mono text-xs pl-1 flex items-baseline gap-2">
                        <Trophy size={12} className="text-yellow-600 shrink-0 self-center" /> {award}
                      </span>
                      <button 
                        onClick={() => removeAward(aw)}
                        className="p-1 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition shrink-0"
                        title="Delete award"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
