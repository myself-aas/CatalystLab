'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { 
  doc, getDoc, setDoc, collection, query, getDocs, 
  onSnapshot, limit, serverTimestamp, addDoc, orderBy, where
} from 'firebase/firestore';
import { useAuth } from '../../../components/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, Save, User, BookOpen, Briefcase, Award, Globe, 
  MapPin, GraduationCap, Building, Trophy, Calendar, CheckCircle2,
  Cpu, Workflow, AlertCircle, Plus, Trash2, Mail, Link as LinkIcon,
  LogOut, Heart, MessageSquare, Send, Users, ThumbsUp, Flame, 
  Settings2, PlusCircle, Check, Sparkles, SendHorizontal, FileText, ChevronRight, Beaker
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

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

interface Researcher {
  id: string;
  full_name: string;
  bio: string;
  orcid: string;
  avatarColor: string;
  initials: string;
  demographics: {
    age: string;
    gender: string;
    nationality: string;
    location: string;
    affiliation: string;
    academicTitle: string;
    primaryDiscipline: string;
    secondaryDiscipline: string;
    preferredLanguage: string;
  };
  education: EducationItem[];
  career: CareerItem[];
  publications: string[];
  awards: string[];
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorTitle: string;
  authorInitials: string;
  authorColor: string;
  content: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  hashtags: string[];
  comments: {
    id: string;
    authorName: string;
    content: string;
    timestamp: string;
  }[];
  attachment?: {
    type: 'hypothesis' | 'dataset' | 'publication';
    title: string;
    link?: string;
  };
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface ChatThread {
  researcherId: string;
  messages: Message[];
}

const ZONE_MAPPING: Record<string, string> = {
  'Thought Collider': 'Idea Catalyst',
  'Research Multiverse': 'Idea Catalyst',
  'Concept Alchemy': 'Idea Catalyst',
  'Assumption Excavator': 'Idea Catalyst',
  'Divergent Dialectic': 'Idea Catalyst',
  'Phenomenon Prism': 'Idea Catalyst',
  'Paradigm Disruptor': 'Idea Catalyst',

  'Pressure Chamber': 'Analytical Foundry',
  'Contradiction Finder': 'Analytical Foundry',
  'Metaphorical Bridge': 'Analytical Foundry',
  'Boundary Scalpel': 'Analytical Foundry',
  'Methodological Replicator': 'Analytical Foundry',
  'Vulnerability Auditor': 'Analytical Foundry',
  'Heuristic Decoupler': 'Analytical Foundry',

  'Temporal Telescope': 'Strategic Discovery',
  'Serendipity Radar': 'Strategic Discovery',
  'Horizon Mapper': 'Strategic Discovery',
  'Interdisciplinary Loom': 'Strategic Discovery',
  'Literature Navigator': 'Strategic Discovery',
  'Cognitive Cartographer': 'Strategic Discovery',
  'Vanguard Signal': 'Strategic Discovery',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const sessions = payload[0].payload.sessions;
    let label = 'Quiet Focus';
    let labelColor = 'text-gray-500';
    let indicatorBg = 'bg-[#E4E9E5]';
    
    if (sessions === 1) {
      label = 'Moderate Momentum';
      labelColor = 'text-[#68BA7F] font-semibold';
      indicatorBg = 'bg-[#68BA7F]';
    } else if (sessions === 2) {
      label = 'Strong Study Focus';
      labelColor = 'text-[#2E6F40] font-bold';
      indicatorBg = 'bg-[#2E6F40]';
    } else if (sessions >= 3) {
      label = 'Peak Discovery';
      labelColor = 'text-[#EAB308] font-black';
      indicatorBg = 'bg-[#EAB308]';
    }

    return (
      <div className="bg-white border border-[#68BA7F]/30 p-4 rounded-[1.25rem] shadow-xl text-xs text-[#253D2C] space-y-1.5 min-w-[210px]">
        <p className="text-gray-400 font-medium">{payload[0].payload.fullDate}</p>
        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="font-bold flex items-center gap-1.5 text-sm text-[#253D2C]">
            <span className={`w-2.5 h-2.5 rounded-full ${indicatorBg} inline-block`} />
            {payload[0].value} {payload[0].value === 1 ? 'Session' : 'Sessions'}
          </p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#F4F9F5] border border-[#68BA7F]/20 ${labelColor}`}>
            {label}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function UserPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Active view: who are we viewing? Either 'self' or mock researcher id
  const [activeProfileId, setActiveProfileId] = useState<string>('self');
  
  // Tab within the profile view
  const [activeTab, setActiveTab] = useState<'feed' | 'credentials' | 'network' | 'chat' | 'analytics'>('feed');

  // Analytics states
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartMounted, setChartMounted] = useState(false);

  // Interactive connection state
  const [connections, setConnections] = useState<Record<string, 'disconnected' | 'pending' | 'connected'>>({});

  // Collaboration request modal state
  const [collabModal, setCollabModal] = useState<{ isOpen: boolean; targetResearcherId: string | null }>({
    isOpen: false,
    targetResearcherId: null
  });
  const [collabPitch, setCollabPitch] = useState('');
  const [collabInstrument, setCollabInstrument] = useState('Thought Collider');

  // Edit profile configuration popup
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editTab, setEditTab] = useState<'demographics' | 'education' | 'career' | 'scholar'>('demographics');

  // User Profile state (backed by actual Firebase cloud)
  const [profile, setProfile] = useState<Researcher>({
    id: 'self',
    full_name: '',
    bio: '',
    orcid: '',
    avatarColor: 'from-[#2E6F40] to-[#1E4D2B]',
    initials: 'UA',
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
    education: [],
    career: [],
    publications: [],
    awards: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });

  // Directory of Network Colleagues fetched dynamically from Firebase
  const [researchers, setResearchers] = useState<Record<string, Researcher>>({});

  // State-driven publication/posts social network feeds loaded dynamically
  const [posts, setPosts] = useState<Post[]>([]);

  // Social chat threads loaded dynamically
  const [chats, setChats] = useState<Record<string, Message[]>>({});

  const [activeChatId, setActiveChatId] = useState<string>('');
  const [chatInput, setChatInput] = useState('');

  // Write new post state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostHashtags, setNewPostHashtags] = useState('');
  const [newPostAttachmentTitle, setNewPostAttachmentTitle] = useState('');

  // Temp lists for editing form
  const [tempPub, setTempPub] = useState('');
  const [tempAward, setTempAward] = useState('');

  // Subscribe to all directory colleagues and seed empty profiles once to help guide the UI experience
  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, async (snap) => {
      // If no other colleagues of this system have registered, pre-populate standard test collaborators
      if (snap.size <= 1) {
        try {
          const seeds = [
            {
              id: 'elena',
              full_name: 'Dr. Elena Rostova',
              bio: 'Pioneering non-invasive spectroscopy, digital field phenotyping, and deep neural model architectures for early-stage phytophthora containment.',
              orcid: '0000-0003-8841-4439',
              avatarColor: 'from-emerald-600 to-teal-800',
              initials: 'ER',
              demographics: {
                age: '34',
                gender: 'Female',
                nationality: 'Dutch',
                location: 'Wageningen, Netherlands',
                affiliation: 'Wageningen Bio-Diagnostics Lab',
                academicTitle: 'Principal Agronomy Investigator',
                primaryDiscipline: 'computational Agronomy',
                secondaryDiscipline: 'Deep Learning Diagnostics',
                preferredLanguage: 'English'
              },
              education: [
                { id: '1', degree: 'Ph.D. in Agricultural AI', institution: 'Wageningen University', field: 'Phytopathology Deep Networks', startYear: '2016', endYear: '2020' },
                { id: '2', degree: 'M.Sc. in Plant Pathology', institution: 'University of Munich', field: 'Fungal Biology', startYear: '2014', endYear: '2016' }
              ],
              career: [
                { id: '1', position: 'Head of Plant Pathogens Division', organization: 'Wageningen Research Labs', location: 'Netherlands', startYear: '2022', endYear: 'Present' },
                { id: '2', position: 'Diagnostics Associate', organization: 'Syngenta Bio-Lab Corp', location: 'Basel, Switzerland', startYear: '2020', endYear: '2022' }
              ],
              publications: [
                'Hyperspectral spectroscopy signature classifiers for Solanaceae crop pathogen detection (2025)',
                'Generative convolutional synthesis of synthetic leaf dataset labels (2024)',
                'Fluidic transport models of aerial fungal blight across protected glasshouses (2023)'
              ],
              awards: [
                'Gold Vanguard in Precision Agriculture Award (2025)',
                'Top Innovative Agri-Bio Tech Fellow, European Science Council (2024)'
              ]
            },
            {
              id: 'kenji',
              full_name: 'Prof. Kenji Takahashi',
              bio: 'Investigating microfluidic biosensors, cellular lipid signaling pathways, and optimal light spectra algorithms for vertical rice crop cultivation.',
              orcid: '0000-0001-9255-7712',
              avatarColor: 'from-purple-600 to-indigo-800',
              initials: 'KT',
              demographics: {
                age: '51',
                gender: 'Male',
                nationality: 'Japanese',
                location: 'Kyoto, Japan',
                affiliation: 'Kyoto Institute of Biosystems',
                academicTitle: 'Distinguished Professor & Director',
                primaryDiscipline: 'Molecular Agriculture & Photonics',
                secondaryDiscipline: 'Controlled Environment Systems',
                preferredLanguage: 'Japanese / English'
              },
              education: [
                { id: '3', degree: 'Doctor of Science (D.Sc)', institution: 'University of Tokyo', field: 'Lipid Molecular Signaling', startYear: '1998', endYear: '2002' }
              ],
              career: [
                { id: '3', position: 'Professor & Director', organization: 'Kyoto Precision Biosystems Center', location: 'Kyoto, Japan', startYear: '2012', endYear: 'Present' },
                { id: '4', position: 'Research Lead on Photonic Farming', organization: 'RIKEN Molecular Innovation Corp', location: 'Tokyo, Japan', startYear: '2005', endYear: '2012' }
              ],
              publications: [
                'Photonic optimization parameters of chlorophyll-A excitation arrays in indoor rice models (2026)',
                'Lipid biosensors for real-time macronutrient stress detection (2025)',
                'Synthetic cellular signal transmitters responding to ambient far-red spectra triggers (2024)'
              ],
              awards: [
                'Imperial Order of Science (Japan, 2024)',
                'Fellow of the World Agrophysical Society (2023)'
              ]
            }
          ];

          for (const s of seeds) {
            await setDoc(doc(db, 'users', s.id), s);
          }
        } catch (e) {
          console.warn("Colleague seeding error:", e);
        }
        return;
      }

      const resData: Record<string, Researcher> = {};
      snap.forEach((docSnap) => {
        if (docSnap.id === user.uid) return;
        const data = docSnap.data();
        
        const initials = (data.full_name || 'R')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);

        resData[docSnap.id] = {
          id: docSnap.id,
          full_name: data.full_name || 'Anonymous Researcher',
          bio: data.bio || 'Intersections of agricultural engineering & research workflows.',
          orcid: data.orcid || 'N/A',
          avatarColor: data.avatarColor || 'from-[#2E6F40] to-teal-800',
          initials: data.initials || initials || 'R',
          demographics: {
            age: data.demographics?.age || '',
            gender: data.demographics?.gender || '',
            nationality: data.demographics?.nationality || '',
            location: data.demographics?.location || '',
            affiliation: data.demographics?.affiliation || '',
            academicTitle: data.demographics?.academicTitle || 'Partner Contributor',
            primaryDiscipline: data.demographics?.primaryDiscipline || '',
            secondaryDiscipline: data.demographics?.secondaryDiscipline || '',
            preferredLanguage: data.demographics?.preferredLanguage || 'English',
          },
          education: data.education || [],
          career: data.career || [],
          publications: data.publications || [],
          awards: data.awards || []
        };
      });
      setResearchers(resData);
    }, (err) => {
      console.warn("Failed colleague directory query:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Load posts dynamically from Firebase
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        try {
          const starterPosts = [
            {
              authorId: 'elena',
              authorName: 'Dr. Elena Rostova',
              authorTitle: 'Principal Agronomy Investigator',
              authorInitials: 'ER',
              authorColor: 'from-emerald-600 to-teal-800',
              content: 'Thrilled to share that our real-time spectroscopy data validation arrays in Wageningen just passed accuracy checks! Integrating machine learning into local glasshouses allows us to locate crop disease hotspots with 94.2% sensitivity. We look forward to testing this loop on other Solanaceae families.',
              createdAt: serverTimestamp(),
              likes: 42,
              likedBy: [],
              hashtags: ['CropPathology', 'MachineLearning', 'PrecisionAg', 'Wageningen'],
              comments: [
                { id: 'c1', authorName: 'Prof. Kenji Takahashi', content: 'Incredible sensitivity, Elena! How does it handle far-red interference in modern high-intensity light arrays?', timestamp: '1 hour ago' }
              ],
              attachment: {
                type: 'dataset',
                title: 'Glasshouse Pathogen Spectroscopy Raw Arrays (Spectral_WA_2026.json)',
              }
            },
            {
              authorId: 'kenji',
              authorName: 'Prof. Kenji Takahashi',
              authorTitle: 'Distinguished Professor & Director',
              authorInitials: 'KT',
              authorColor: 'from-purple-600 to-indigo-800',
              content: 'Sustainable high-density vertical systems require absolute bio-feedback synchronization. Our team has engineered micro-fluidic lipid indicators that signal crop nitrogen deficiency before any discoloration is visible to scanners. This has a profound implication for predictive resource allocation in modular multi-tier farms.',
              createdAt: serverTimestamp(),
              likes: 64,
              likedBy: ['elena'],
              hashtags: ['VerticalFarming', 'Biosensors', 'ControlTheory', 'RiceFarming'],
              comments: [],
              attachment: null
            }
          ];

          for (const sp of starterPosts) {
            await addDoc(collection(db, 'posts'), sp);
          }
        } catch (e) {
          console.warn("Seeding initial feed posts failed:", e);
        }
        return;
      }

      const dbPosts = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        let timestamp = 'Just now';
        if (data.createdAt?.toDate) {
          const date = data.createdAt.toDate();
          const diffMs = Date.now() - date.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          if (diffMins < 1) timestamp = 'Just now';
          else if (diffMins < 60) timestamp = `${diffMins}m ago`;
          else if (diffHours < 24) timestamp = `${diffHours}h ago`;
          else timestamp = date.toLocaleDateString();
        }
        return {
          id: docSnap.id,
          authorId: data.authorId || 'unknown',
          authorName: data.authorName || 'Anonymous Researcher',
          authorTitle: data.authorTitle || 'Researcher',
          authorInitials: data.authorInitials || (data.authorName || 'R')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2),
          authorColor: data.authorColor || 'from-[#2E6F40] to-teal-800',
          content: data.content || '',
          timestamp: timestamp,
          likes: data.likes || 0,
          likedBy: data.likedBy || [],
          hashtags: data.hashtags || [],
          comments: data.comments || [],
          attachment: data.attachment || undefined
        };
      }) as Post[];
      setPosts(dbPosts);
    }, (err) => {
      console.warn("Error subscribing and loading community posts:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Set companion chat selectively
  useEffect(() => {
    const keys = Object.keys(researchers);
    if (keys.length > 0 && !activeChatId) {
      if (keys.includes('elena')) {
        setActiveChatId('elena');
      } else {
        setActiveChatId(keys[0]);
      }
    }
  }, [researchers, activeChatId]);

  // Load chat threads dynamically with prompt fallbacks
  useEffect(() => {
    if (!user || !activeChatId || activeChatId === 'self') return;
    
    const threadId = [user.uid, activeChatId].sort().join('_');
    const unsubscribe = onSnapshot(doc(db, 'chats', threadId), async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setChats(prev => ({
          ...prev,
          [activeChatId]: data.messages || []
        }));
      } else {
        const initialMessages: Message[] = [];
        if (activeChatId === 'elena') {
          initialMessages.push(
            { id: 'm1', senderId: 'elena', text: 'Greetings, colleague! I reviewed your recent Thought Collider experiment exploring spectral light ratios. Excellent hypotheses.', timestamp: '3:15 PM' },
            { id: 'm2', senderId: 'self', text: 'Thank you, Elena! I really admire your Wageningen pathogen detection system. We should definitely sync our datasets.', timestamp: '3:18 PM' },
            { id: 'm3', senderId: 'elena', text: 'Exactly my thoughts. Perhaps we can dispatch a parallel simulation matching biological constants under our Alchemy engine? Let me know when you run the compiler!', timestamp: '3:20 PM' }
          );
        } else if (activeChatId === 'kenji') {
          initialMessages.push(
            { id: 'm4', senderId: 'kenji', text: 'Greetings, researcher. Have you had a chance to evaluate the microfluidic sensor calibration rates for vertical farms?', timestamp: 'Yesterday' }
          );
        } else {
          initialMessages.push(
            { id: 'm5', senderId: activeChatId, text: `Hello! I'm registered in the platform as a Research Colleague. Click below or send me a chat to initiate a custom workspace reaction study!`, timestamp: 'Just now' }
          );
        }

        try {
          await setDoc(doc(db, 'chats', threadId), { messages: initialMessages });
        } catch (e) {
          console.warn("Seeding initial thread chats failed:", e);
        }

        setChats(prev => ({
          ...prev,
          [activeChatId]: initialMessages
        }));
      }
    }, (err) => {
      console.warn("Error subscribing to chat thread:", err);
    });

    return () => unsubscribe();
  }, [user, activeChatId, researchers]);

  // Fire cloud loading for main user profile & dynamic connection maps
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const initials = (data.full_name || user.displayName || user.email || 'UA')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

          const fetchedProfile: Researcher = {
            id: 'self',
            full_name: data.full_name || user.displayName || 'Ashif Ahmed Shuvo',
            bio: data.bio || 'Sustainable food engineering & automation research lead at CatalystLab. Exploring micro-climate sensor networks for vertical crops.',
            orcid: data.orcid || '0000-0002-1807-0016',
            avatarColor: 'from-[#2E6F40] to-[#1E4D2B]',
            initials: initials || 'AS',
            demographics: {
              age: data.demographics?.age || '27',
              gender: data.demographics?.gender || 'Male',
              nationality: data.demographics?.nationality || 'Bangladeshi',
              location: data.demographics?.location || 'Mymensingh, Bangladesh',
              affiliation: data.demographics?.affiliation || 'Bangladesh Agricultural University',
              academicTitle: data.demographics?.academicTitle || 'Research Fellow',
              primaryDiscipline: data.demographics?.primaryDiscipline || 'Agricultural Automation',
              secondaryDiscipline: data.demographics?.secondaryDiscipline || 'Smart Biosensors',
              preferredLanguage: data.demographics?.preferredLanguage || 'English, Bengali',
            },
            education: data.education || [
              { id: 's1', degree: 'M.S. in Farm Power and Machinery', institution: 'Bangladesh Agricultural University', field: 'Precision IoT automation', startYear: '2021', endYear: '2023' },
              { id: 's2', degree: 'B.Sc. in Agricultural Engineering', institution: 'BAU Faculty of Agricultural Engineering & Tech', field: 'Smart Systems', startYear: '2016', endYear: '2020' }
            ],
            career: data.career || [
              { id: 'c1', position: 'Automation Research Lead', organization: 'Sustainable Biosystems Unit', location: 'Bangladesh', startYear: '2023', endYear: 'Present' }
            ],
            publications: data.publications || [
              'IoT-enabled real-time localized irrigation schedules using solar canopy telemetry (2025)',
              'Sensor network calibration algorithms for organic substrates in modular setups (2024)'
            ],
            awards: data.awards || [
              'Presidential Tech Innovation Grant Award (2025)',
              'Academic Excellence Bio-Engineering Fellowship (2022)'
            ]
          };
          setProfile(fetchedProfile);
          setConnections(data.connections || {});
        } else {
          const initials = 'AS';
          const preDefault: Researcher = {
            id: 'self',
            full_name: user?.displayName || 'Ashif Ahmed Shuvo',
            bio: 'Sustainable food engineering & automation research lead at CatalystLab. Exploring microclimate sensor networks and smart robotic setups.',
            orcid: '0000-0002-1807-0016',
            avatarColor: 'from-[#2E6F40] to-[#1E4D2B]',
            initials: initials,
            demographics: {
              age: '27',
              gender: 'Male',
              nationality: 'Bangladeshi',
              location: 'Mymensingh, Bangladesh',
              affiliation: 'Bangladesh Agricultural University',
              academicTitle: 'Research Fellow',
              primaryDiscipline: 'Agricultural Automation',
              secondaryDiscipline: 'Smart Biosensors',
              preferredLanguage: 'English, Bengali',
            },
            education: [
              { id: 's1', degree: 'M.S. in Farm Power & Machinery', institution: 'Bangladesh Agricultural University', field: 'Precision IoT automation', startYear: '2021', endYear: '2023' },
              { id: 's2', degree: 'B.Sc. in Agricultural Engineering', institution: 'BAU Faculty of Agricultural Engineering & Tech', field: 'Smart Systems', startYear: '2016', endYear: '2020' }
            ],
            career: [
              { id: 'c1', position: 'Automation Research Lead', organization: 'Sustainable Biosystems Unit', location: 'Bangladesh', startYear: '2023', endYear: 'Present' }
            ],
            publications: [
              'IoT-enabled real-time localized irrigation schedules using solar canopy telemetry (2025)',
              'Sensor network calibration algorithms for organic substrates in modular setups (2024)'
            ],
            awards: [
              'Presidential Tech Innovation Grant Award (2025)',
              'Academic Excellence Bio-Engineering Fellowship (2022)'
            ]
          };
          setProfile(preDefault);
          setConnections({});
        }
      } catch (err) {
        console.warn("Firestore user profile fetch error.", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    setChartMounted(true);
  }, []);

  useEffect(() => {
    async function fetchChartData() {
      if (!user) return;
      setChartLoading(true);
      try {
        const targetUid = activeProfileId === 'self' ? user.uid : activeProfileId;
        
        // Fetch all user sessions to calculate date-wise statistics for last 30 days
        const qAll = query(
          collection(db, 'sessions'),
          where('uid', '==', targetUid)
        );
        const snapAll = await getDocs(qAll);
        let allSessions = snapAll.docs.map(doc => {
          const data = doc.data();
          let dateVal: Date;
          if (data.createdAt?.toDate) {
            dateVal = data.createdAt.toDate();
          } else if (data.createdAt?.toMillis) {
            dateVal = new Date(data.createdAt.toMillis());
          } else if (data.createdAt) {
            dateVal = new Date(data.createdAt);
          } else {
            dateVal = new Date();
          }
          return {
            id: doc.id,
            ...data,
            dateValue: dateVal
          };
        });

        // If there are exactly 0 sessions for non-self profiles (mocking Elena and Kenji),
        // seed mock sessions to display impressive, realistic dynamic charts instead of empty blocks!
        if (allSessions.length === 0 && activeProfileId !== 'self') {
          // Generate deterministic mock sessions for researchers
          const mockSessions = [];
          const now = new Date();
          const seed = activeProfileId === 'elena' ? 7 : 11;
          
          // Let's create about 12-15 dummy sessions over the last 30 days
          for (let i = 0; i < 30; i += 2) {
            const dateVal = new Date();
            dateVal.setDate(now.getDate() - i);
            
            // Deterministic randomized count (0 to 3) based on date & seed
            const count = (i + seed) % 5 === 0 ? 3 : (i + seed) % 3 === 0 ? 2 : (i + seed) % 2 === 0 ? 1 : 0;
            for (let c = 0; c < count; c++) {
              // Alternate instruments
              const instruments = activeProfileId === 'elena' 
                ? ['Thought Collider', 'Phenomenon Prism', 'Pressure Chamber', 'Literature Navigator']
                : ['Metaphorical Bridge', 'Concept Alchemy', 'Vulnerability Auditor', 'Serendipity Radar'];
              const instName = instruments[(i + c) % instruments.length];
              
              mockSessions.push({
                instrumentName: instName,
                dateValue: dateVal
              });
            }
          }
          allSessions = mockSessions;
        }

        // Construct chronologically ordered 30-day activity datasets
        const chartDataArray = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
          
          // Filter sessions matching this specific day
          const sessionsOnDay = allSessions.filter(s => {
            return s.dateValue.getDate() === d.getDate() &&
                   s.dateValue.getMonth() === d.getMonth() &&
                   s.dateValue.getFullYear() === d.getFullYear();
          });
          
          chartDataArray.push({
            date: dateStr,
            sessions: sessionsOnDay.length,
            fullDate: d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          });
        }
        setChartData(chartDataArray);

        // Calculate distribution
        const counts: Record<string, number> = {
          'Idea Catalyst': 0,
          'Analytical Foundry': 0,
          'Strategic Discovery': 0,
          'Uncategorized': 0
        };

        allSessions.forEach(s => {
          const cat = ZONE_MAPPING[s.instrumentName] || 'Uncategorized';
          counts[cat]++;
        });

        const pieData = Object.entries(counts)
          .filter(([_, count]) => count > 0)
          .map(([name, value]) => ({ name, value }));

        setCategoryData(pieData);
      } catch (err) {
        console.error("Profile charts fetch error:", err);
      } finally {
        setChartLoading(false);
      }
    }
    fetchChartData();
  }, [user, activeProfileId]);

  // Handle Cloud Saving
  const triggerSave = async (updatedResearcher: Researcher) => {
    if (!user) {
      showToast('info', 'Not signed in. Running in offline preview mode.');
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), updatedResearcher, { merge: true });
      showToast('success', 'Profile and credentials synchronized to secure cloud servers successfully.');
    } catch (e: any) {
      showToast('error', e.message || 'Cloud storage request timed out.');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: null, message: '' }), 4000);
  };

  // Profile lookup
  const getActiveProfile = (): Researcher => {
    if (activeProfileId === 'self') return profile;
    return researchers[activeProfileId] || profile;
  };

  const activeProfile = getActiveProfile();

  // Social updates
  const handleLike = async (postId: string) => {
    if (!user) return;
    const postToLike = posts.find(p => p.id === postId);
    if (!postToLike) return;

    const alreadyLiked = postToLike.likedBy.includes(user.uid);
    const updatedLikedBy = alreadyLiked 
      ? postToLike.likedBy.filter(uid => uid !== user.uid)
      : [...postToLike.likedBy, user.uid];
    
    const updatedLikes = alreadyLiked ? Math.max(0, postToLike.likes - 1) : postToLike.likes + 1;

    try {
      await setDoc(doc(db, 'posts', postId), {
        likes: updatedLikes,
        likedBy: updatedLikedBy
      }, { merge: true });
    } catch (err) {
      console.warn("Failed to update post likes in database:", err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    const authorName = profile.full_name || 'Anonymous Researcher';
    const authorTitle = `${profile.demographics.academicTitle || 'Scholar'}, ${profile.demographics.affiliation || 'CatalystLab'}`;
    const authorInitials = profile.initials;

    const parsedHashtags = newPostHashtags
      .split(' ')
      .map(h => h.trim().replace('#', ''))
      .filter(h => h.length > 0);

    const postPayload = {
      authorId: user?.uid || 'self',
      authorName,
      authorTitle,
      authorInitials,
      authorColor: profile.avatarColor,
      content: newPostContent.trim(),
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
      hashtags: parsedHashtags.length > 0 ? parsedHashtags : ['ResearchUpdate', 'CatalystLab'],
      comments: [],
      attachment: newPostAttachmentTitle ? {
        type: 'hypothesis',
        title: newPostAttachmentTitle,
      } : null
    };

    try {
      await addDoc(collection(db, 'posts'), postPayload);
      setNewPostContent('');
      setNewPostHashtags('');
      setNewPostAttachmentTitle('');
      showToast('success', 'Published scientific update to network feed.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to post to cloud feed.');
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!commentText.trim() || !user) return;
    const postToComment = posts.find(p => p.id === postId);
    if (!postToComment) return;

    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      authorName: profile.full_name || user.displayName || 'Ashif Ahmed Shuvo',
      content: commentText.trim(),
      timestamp: 'Just now'
    };

    try {
      await setDoc(doc(db, 'posts', postId), {
        comments: [...(postToComment.comments || []), newComment]
      }, { merge: true });
    } catch (err) {
      console.warn("Failed to add comment in database:", err);
    }
  };

  // Connection persistence in Cloud Firestore
  const handleConnect = async (resId: string) => {
    if (!user) {
      showToast('info', 'Offline mode. Connect simulated.');
      return;
    }
    const currentStatus = connections[resId] || 'disconnected';
    let newStatus: 'disconnected' | 'pending' | 'connected' = 'disconnected';
    
    if (currentStatus === 'disconnected') {
      newStatus = 'pending';
      const updated = { ...connections, [resId]: newStatus };
      setConnections(updated);
      showToast('info', `Sent connection request to ${researchers[resId]?.full_name || 'Researcher'}.`);
      
      try {
        await setDoc(doc(db, 'users', user.uid), { connections: updated }, { merge: true });
      } catch (e) {
        console.warn("Failed to update connections in cloud:", e);
      }

      // Auto-accept response simulation to mimic collaborator approval
      setTimeout(async () => {
        const approved = { ...updated, [resId]: 'connected' };
        setConnections(approved);
        showToast('success', `You are now officially collaborating with ${researchers[resId]?.full_name || 'Researcher'}!`);
        try {
          await setDoc(doc(db, 'users', user.uid), { connections: approved }, { merge: true });
        } catch (e) {
          console.warn("Failed to update approved connections in cloud:", e);
        }
      }, 2000);
    } else {
      const archived = { ...connections, [resId]: 'disconnected' };
      setConnections(archived);
      showToast('info', `Archived collaboration link with ${researchers[resId]?.full_name || 'Researcher'}.`);
      try {
        await setDoc(doc(db, 'users', user.uid), { connections: archived }, { merge: true });
      } catch (e) {
        console.warn("Failed to update archived connections in cloud:", e);
      }
    }
  };

  // Launch joint reaction pitch and save to cloud feed & chats
  const handlePublishCollaboration = async () => {
    if (!collabPitch.trim() || !collabModal.targetResearcherId || !user) return;
    const target = researchers[collabModal.targetResearcherId];
    if (!target) return;

    // Add notification alert to feed as a special post
    const systemAlertPost = {
      authorId: user.uid,
      authorName: `${profile.full_name || 'Ashif Ahmed Shuvo'} 🤝 ${target.full_name}`,
      authorTitle: `Joint Research Initiative | Instrument: ${collabInstrument}`,
      authorInitials: `${profile.initials}/${target.initials}`,
      authorColor: 'from-[#2E6F40] to-teal-700',
      content: `Collaboration Sequence initialized! Hypothesis Pitch: "${collabPitch.trim()}". Analyzing real-time variable correlations over academic datasets using CatalystLab.`,
      createdAt: serverTimestamp(),
      likes: 12,
      likedBy: [user.uid],
      hashtags: ['CollaborativeInference', collabInstrument.replace(' ', ''), 'OpenScience'],
      comments: [
        { id: Math.random().toString(36).substring(2, 9), authorName: target.full_name, content: 'Excited to begin analysis on this pathway. Standard models loading.', timestamp: 'Just now' }
      ],
      attachment: {
        type: 'hypothesis',
        title: `Joint Pitch Workspace: ${collabInstrument} Response Stream`
      }
    };

    try {
      await addDoc(collection(db, 'posts'), systemAlertPost);
      
      const colleagueId = collabModal.targetResearcherId;
      const threadId = [user.uid, colleagueId].sort().join('_');
      const currentMessages = chats[colleagueId] || [];

      const alertMessage: Message = {
        id: Math.random().toString(36).substring(2, 9),
        senderId: colleagueId,
        text: `Hello Ashif, I reviewed your collaboration initiative regarding: "${collabPitch.trim()}". I am configuring our lab constants on port 3000 to match. Let's start the synthesis reaction!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedMessages = [...currentMessages, alertMessage];

      await setDoc(doc(db, 'chats', threadId), {
        messages: updatedMessages
      }, { merge: true });

      setChats(prev => ({
        ...prev,
        [colleagueId]: updatedMessages
      }));

      setCollabModal({ isOpen: false, targetResearcherId: null });
      setCollabPitch('');
      showToast('success', `Collaboration proposal dispatched. Scientific sequence launched in the ${collabInstrument}!`);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to publish joint sequence details.');
    }
  };

  // Chat Messenger
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user || !activeChatId || activeChatId === 'self') return;
    const textMsg = chatInput.trim();
    
    const threadId = [user.uid, activeChatId].sort().join('_');
    const currentMessages = chats[activeChatId] || [];

    const newMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      senderId: user.uid,
      text: textMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...currentMessages, newMsg];

    setChats(prev => ({
      ...prev,
      [activeChatId]: updatedMessages
    }));
    setChatInput('');

    try {
      await setDoc(doc(db, 'chats', threadId), {
        messages: updatedMessages
      }, { merge: true });
    } catch (err) {
      console.warn("Failed to write sender chat in Firestore:", err);
    }

    // Interactive reply script automatically records back into cloud thread
    setTimeout(async () => {
      let replyText = "Fascinating parameters. Let me compile current metrics on our side.";
      
      if (activeChatId === 'elena') {
        if (textMsg.toLowerCase().includes('spectroscopy') || textMsg.toLowerCase().includes('data') || textMsg.toLowerCase().includes('pathogen')) {
          replyText = "Absolutely. My raw Wageningen spectroscopy datasets contain 4,200 labeled glasshouse runs. If we plug this into our Gemini 3.5 Synthesis Engine, we can easily isolate the outlier blights.";
        } else {
          replyText = "Got it! Let's arrange a joint reaction sequence. We can load our plant pathology models and test structural correlations.";
        }
      } else if (activeChatId === 'kenji') {
        replyText = "Colleague, our cellular biosensors in Kyoto are recording highly responsive signaling rates. I suggest we run your Thought Collider constants through our sensor pipeline.";
      } else if (activeChatId === 'sarah') {
        replyText = "That metabolic pathway looks exceptionally sound. Have you calculated the bioreactor viscous drag ratios? We should test it with cellular protein strings under our flow models.";
      }

      const companionReply: Message = {
        id: Math.random().toString(36).substring(2, 9),
        senderId: activeChatId,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, companionReply];

      setChats(prev => ({
        ...prev,
        [activeChatId]: finalMessages
      }));

      try {
        await setDoc(doc(db, 'chats', threadId), {
          messages: finalMessages
        }, { merge: true });
        showToast('info', `${researchers[activeChatId]?.full_name || 'Companion'} replied in Collaboration Chat.`);
      } catch (err) {
        console.warn("Failed to save companion response in database:", err);
      }
    }, 1500);
  };

  return (
    <div className="max-w-[1300px] mx-auto space-y-8 p-1 relative">
      
      {/* Toast Notifier */}
      <AnimatePresence>
        {toast.type && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-2xl border flex items-center gap-3 shadow-xl max-w-md ${
              toast.type === 'success' 
                ? 'bg-[#CFFFDC]/95 border-[#68BA7F] text-[#253D2C]' 
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#2E6F40]" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-600" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header & Bio Splash Card */}
      <div className="relative rounded-[2rem] border border-[#68BA7F]/20 bg-white overflow-hidden shadow-xl">
        <div className="h-44 sm:h-52 bg-gradient-to-r from-[#FAFDF6] via-[#E5F3E9] to-[#CFFFDC]/40 relative flex items-end">
          {/* Abstract background graphics pattern in the background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg width="100%" height="100%">
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#2E6F40" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          {/* Scientific Badge indicator on banner */}
          <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#68BA7F]/20 flex items-center gap-2 text-[11px] font-bold text-[#1E4D2B] uppercase tracking-wider shadow-sm select-none">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Impact Factor: 42.8</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 pt-0 relative flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 md:-mt-12">
          {/* Big Circular Avatar with initials */}
          <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${activeProfile.avatarColor} text-white flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-xl border-4 border-white shrink-0 uppercase relative overflow-hidden group transition-transform`}>
            {activeProfile.initials}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex-1 space-y-2.5 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#253D2C] tracking-tight">
                    {activeProfile.full_name}
                  </h1>
                  <span className="bg-[#CFFFDC] text-[#1E4D2B] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#68BA7F]/30 shadow-sm flex items-center gap-1 shrink-0 select-none">
                    <Check className="w-3 h-3" /> VERIFIED COLLEAGUE
                  </span>
                </div>
                
                <p className="text-[#2E6F40]/90 font-medium text-sm sm:text-base flex items-center gap-2.5 flex-wrap mt-1">
                  <span className="font-bold">{activeProfile.demographics.academicTitle || 'Researcher'}</span>
                  <span className="text-[#68BA7F]">|</span>
                  <span className="font-semibold text-[#253D2C]/80">{activeProfile.demographics.affiliation || 'University'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {activeProfileId === 'self' ? (
                  <>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-5 py-2.5 bg-[#FAFDF6] hover:bg-[#68BA7F]/10 border border-[#68BA7F]/40 text-[#1E4D2B] font-bold rounded-2xl flex items-center gap-2 text-sm transition-all shadow-sm shrink-0 hover:shadow-md"
                    >
                      <Settings2 className="w-4 h-4" /> Edit Profile
                    </button>
                    <button
                      onClick={async () => { await signOut(); router.push('/login'); }}
                      className="p-2.5 bg-red-100/40 hover:bg-red-100 text-red-700 rounded-2xl border border-red-200/50 transition-all shrink-0"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Send Message action button shifts directly to Message Workspace Tab */}
                    <button
                      onClick={() => {
                        setActiveChatId(activeProfileId);
                        setActiveTab('chat');
                      }}
                      className="px-5 py-2.5 bg-[#FAFDF6] hover:bg-[#68BA7F]/10 border border-[#68BA7F]/40 text-[#1E4D2B] font-bold rounded-2xl flex items-center gap-2 text-sm transition-all shadow-sm shrink-0 hover:shadow-md"
                    >
                      <MessageSquare className="w-4 h-4" /> Message
                    </button>

                    {/* Collaboration sequence activator */}
                    <button
                      onClick={() => setCollabModal({ isOpen: true, targetResearcherId: activeProfileId })}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center gap-2 text-sm transition-all shadow-md shrink-0 hover:shadow-lg"
                    >
                      <Workflow className="w-4 h-4" /> Initialize Collab
                    </button>

                    {/* Quick Connection Action */}
                    <button
                      onClick={() => handleConnect(activeProfileId)}
                      className={`px-5 py-2.5 font-bold rounded-2xl flex items-center gap-2 text-sm transition-all shadow-sm shrink-0 hover:shadow-md border ${
                        connections[activeProfileId] === 'connected'
                          ? 'bg-[#CFFFDC] text-[#1E4D2B] border-[#68BA7F]'
                          : connections[activeProfileId] === 'pending'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-[#2E6F40] hover:bg-[#253D2C] text-white border-transparent'
                      }`}
                    >
                      {connections[activeProfileId] === 'connected' ? (
                        <>
                          <Check className="w-4 h-4" /> Connected
                        </>
                      ) : connections[activeProfileId] === 'pending' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Pending
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Connect
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="text-[#2E6F40]/80 text-sm sm:text-base leading-relaxed max-w-3xl pt-2">
              {activeProfile.bio}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#2E6F40]/70 font-mono font-medium pt-2 select-none">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#68BA7F]" />
                {activeProfile.demographics.location || 'Global Base'}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#68BA7F]" />
                ORCID: {activeProfile.orcid || 'N/A'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#68BA7F]" />
                {activeProfileId === 'self' ? '128' : '264'} Connections
              </span>
            </div>
          </div>
        </div>

        {/* Back navigation button if looking at other's workspace */}
        {activeProfileId !== 'self' && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#68BA7F]/20 flex items-center gap-2 text-xs font-bold text-[#1E4D2B] cursor-pointer shadow-sm select-none hover:bg-[#F4F9F5] transition"
               onClick={() => setActiveProfileId('self')}>
            <span>← Return to My Profile</span>
          </div>
        )}
      </div>

      {/* Main Secondary Module Grid (Dual Columns: Sidebar Directory on Left/Right, Content on opposite) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Short Demographics quick box + Other Colleagues lookup directory */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Mini Professional Fact Box Card */}
          <div className="bg-white border border-[#68BA7F]/20 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-[#253D2C] uppercase tracking-wider border-b border-[#68BA7F]/10 pb-2">
              Scientific Metadata
            </h3>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between py-1 border-b border-[#FAFDF6]">
                <span className="text-[#2E6F40]/70 font-medium">Primary Field</span>
                <span className="font-bold text-[#253D2C] text-right max-w-[160px] truncate" title={activeProfile.demographics.primaryDiscipline}>
                  {activeProfile.demographics.primaryDiscipline || 'General Research'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#FAFDF6]">
                <span className="text-[#2E6F40]/70 font-medium">Sub-Specialty</span>
                <span className="font-bold text-[#253D2C] text-right max-w-[160px] truncate" title={activeProfile.demographics.secondaryDiscipline}>
                  {activeProfile.demographics.secondaryDiscipline || 'Non-declared'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#FAFDF6]">
                <span className="text-[#2E6F40]/70 font-medium">Focus Base</span>
                <span className="font-bold text-[#253D2C] text-right max-w-[160px] truncate" title={activeProfile.demographics.nationality}>
                  {activeProfile.demographics.nationality || 'Earth'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#FAFDF6]">
                <span className="text-[#2E6F40]/70 font-medium">Main Language</span>
                <span className="font-bold text-[#253D2C] text-right">
                  {activeProfile.demographics.preferredLanguage || 'English'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#2E6F40]/70 font-medium">Age & Gender</span>
                <span className="font-bold text-[#253D2C]">
                  {activeProfile.demographics.gender || 'Unknown'} ({activeProfile.demographics.age || 'N/A'})
                </span>
              </div>
            </div>
          </div>

          {/* Research Peer Directory */}
          <div className="bg-white border border-[#68BA7F]/20 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#68BA7F]/10 pb-2">
              <h3 className="text-sm font-bold text-[#253D2C] uppercase tracking-wider flex items-center gap-1.5">
                <Users size={16} className="text-[#2E6F40]" />
                <span>Colleague Directory</span>
              </h3>
              <span className="text-[10px] bg-[#F4F9F5] px-2 py-0.5 rounded-full font-mono text-[#2E6F40]">
                {Object.keys(researchers).length} Members
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Logged in self shortcut always in directory */}
              <div 
                onClick={() => {
                  setActiveProfileId('self');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  activeProfileId === 'self' 
                    ? 'bg-[#CFFFDC]/40 border-[#68BA7F] shadow-inner' 
                    : 'bg-[#FAFDF6]/50 border-transparent hover:border-[#68BA7F]/20 hover:bg-[#F4F9F5]/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2E6F40] to-[#1E4D2B] text-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  {profile.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#253D2C] truncate">
                    {profile.full_name || 'My Profile'} (You)
                  </h4>
                  <p className="text-[10px] text-[#2E6F40]/70 truncate">
                    {profile.demographics.affiliation || 'Bangladesh Agricultural University'}
                  </p>
                </div>
                <ChevronRight size={14} className="text-[#68BA7F]" />
              </div>

              {Object.values(researchers).map((res) => {
                const connStatus = connections[res.id] || 'disconnected';
                return (
                  <div 
                    key={res.id}
                    onClick={() => {
                      setActiveProfileId(res.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      activeProfileId === res.id 
                        ? 'bg-[#CFFFDC]/40 border-[#68BA7F] shadow-inner' 
                        : 'bg-[#FAFDF6]/50 border-transparent hover:border-[#68BA7F]/20 hover:bg-[#F4F9F5]/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${res.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 select-none`}>
                      {res.initials}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-bold text-[#253D2C] truncate">{res.full_name}</h4>
                        {connStatus === 'connected' && (
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Connected" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#2E6F40]/70 truncate">
                        {res.demographics.affiliation}
                      </p>
                    </div>

                    <ChevronRight size={14} className="text-[#68BA7F]" />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Adaptive, Expressive Tabs Control View */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tab Selection Row */}
          <div className="flex bg-white/70 p-1 rounded-2xl border border-[#68BA7F]/20 shadow-sm backdrop-blur-md overflow-x-auto max-w-full gap-1">
            {[
              { id: 'feed', label: 'Updates & Feed', icon: ThumbsUp },
              { id: 'credentials', label: 'Credentials & About', icon: BookOpen },
              { id: 'analytics', label: 'Activity Dynamics', icon: Flame },
              { id: 'chat', label: 'Collaboration Chat', icon: MessageSquare },
            ].map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setActiveTab(tabItem.id as any)}
                className={`relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all shrink-0 grow ${
                  activeTab === tabItem.id 
                    ? 'text-[#1E4D2B]' 
                    : 'text-[#2E6F40]/70 hover:text-[#2E6F40] hover:bg-[#68BA7F]/10'
                }`}
              >
                {activeTab === tabItem.id && (
                  <motion.div
                    layoutId="m3-user-tab-pill"
                    className="absolute inset-0 bg-[#CFFFDC] rounded-xl border border-[#68BA7F]/20 shadow-sm"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                  <tabItem.icon className="w-4 h-4 shrink-0" />
                  {tabItem.label}
                </span>
              </button>
            ))}
          </div>

          {/* TAB CONTENT MODULE */}
          <div className="bg-white border border-[#68BA7F]/20 rounded-[2rem] p-6 sm:p-8 shadow-md min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + '-' + activeProfileId}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
              >
                
                {/* 1. FEED & POSTS TAB */}
                {activeTab === 'feed' && (
                  <div className="space-y-6">
                    <div className="border-b border-[#68BA7F]/10 pb-3 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-[#253D2C]">Scientific Updates</h2>
                      <span className="text-xs font-mono font-bold text-[#2E6F40]">
                        {posts.filter(p => p.authorId === activeProfileId || activeProfileId === 'self').length} publications mapped
                      </span>
                    </div>

                    {/* Write new post box if active profile is self */}
                    {activeProfileId === 'self' && (
                      <div className="p-4 bg-[#FAFDF6] border border-[#68BA7F]/30 rounded-2xl space-y-3 shadow-inner">
                        <textarea
                          className="w-full p-3 h-22 bg-white rounded-xl text-sm border border-[#68BA7F]/20 focus:ring-1 focus:ring-[#2E6F40] focus:outline-none focus:border-[#2E6F40] text-[#253D2C] placeholder-[#2E6F40]/50 resize-none"
                          placeholder="Publish an update on your agricultural sensor research..."
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input 
                            type="text"
                            placeholder="Hashtags (e.g. #Automation #AgriBio)"
                            className="bg-white px-3 py-2 border border-[#68BA7F]/20 rounded-lg text-xs font-mono text-[#253D2C] focus:outline-none"
                            value={newPostHashtags}
                            onChange={(e) => setNewPostHashtags(e.target.value)}
                          />
                          <input 
                            type="text"
                            placeholder="Attach link or workspace paper name"
                            className="bg-white px-3 py-2 border border-[#68BA7F]/20 rounded-lg text-xs text-[#253D2C] focus:outline-none"
                            value={newPostAttachmentTitle}
                            onChange={(e) => setNewPostAttachmentTitle(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim()}
                            className="px-5 py-2.5 bg-[#2E6F40] hover:bg-[#253D2C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow disabled:opacity-50"
                          >
                            <PlusCircle className="w-4 h-4" /> Publish Post
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Rendering Posts List */}
                    <div className="space-y-6">
                      {posts
                        .filter(p => activeProfileId === 'self' || p.authorId === activeProfileId)
                        .map((post) => {
                          const isLiked = post.likedBy.includes('self');
                          return (
                            <div key={post.id} className="p-5 bg-white border border-[#68BA7F]/20 rounded-[1.5rem] shadow-sm space-y-4 hover:border-[#68BA7F]/40 transition group">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${post.authorColor} text-white flex items-center justify-center font-bold text-xs shrink-0 select-none`}>
                                  {post.authorInitials}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-[#253D2C] group-hover:text-[#2E6F40] transition-colors">{post.authorName}</h4>
                                  <p className="text-[10px] text-[#2E6F40]/70">{post.authorTitle} • {post.timestamp}</p>
                                </div>
                              </div>

                              <p className="text-sm font-medium text-[#2E6F40]/90 leading-relaxed">
                                {post.content}
                              </p>

                              {/* Attachment badge */}
                              {post.attachment && (
                                <div className="p-3.5 bg-[#FAFDF6] rounded-xl border border-[#68BA7F]/20 flex items-center gap-3 text-xs justify-between max-w-full">
                                  <div className="flex items-center gap-2 bg-white/70 p-1 px-2.5 rounded-lg border border-[#68BA7F]/10 truncate">
                                    <FileText className="w-4 h-4 text-[#2E6F40] shrink-0" />
                                    <span className="font-mono font-bold text-[#1E4D2B] truncate">{post.attachment.title}</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded-full select-none shrink-0 uppercase tracking-widest leading-none">
                                    READY
                                  </span>
                                </div>
                              )}

                              {/* Tags indicators */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {post.hashtags.map((tag) => (
                                  <span key={tag} className="text-[10px] font-mono font-bold bg-[#FAFDF6] text-[#2E6F40] border border-[#68BA7F]/20 px-2.5 py-0.5 rounded-full">
                                    #{tag}
                                  </span>
                                ))}
                              </div>

                              {/* Interactive actions */}
                              <div className="flex items-center gap-4 border-t border-[#68BA7F]/10 pt-3 select-none text-xs text-[#2E6F40]/80">
                                <button
                                  onClick={() => handleLike(post.id)}
                                  className={`flex items-center gap-2 hover:text-[#1E4D2B] transition-colors ${isLiked ? 'text-red-600 font-bold' : ''}`}
                                >
                                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600 stroke-red-600' : ''}`} />
                                  <span>{post.likes} Likes</span>
                                </button>
                                <span className="text-[#68BA7F]/40">|</span>
                                <span className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>{post.comments.length} Comments</span>
                                </span>
                              </div>

                              {/* Comments system */}
                              <div className="space-y-3 bg-[#FAFDF6]/40 p-4 rounded-xl border border-[#FAFDF6]">
                                {/* Render existed comments */}
                                {post.comments.map((comm) => (
                                  <div key={comm.id} className="text-xs">
                                    <p className="text-[#253D2C] leading-snug">
                                      <span className="font-bold mr-1.5">{comm.authorName}</span>
                                      <span className="text-[#2E6F40]/80">{comm.content}</span>
                                    </p>
                                    <span className="text-[9px] text-[#2E6F40]/60">{comm.timestamp}</span>
                                  </div>
                                ))}

                                {/* Comment draft input */}
                                <div className="flex gap-2 pt-1 border-t border-[#68BA7F]/5">
                                  <input 
                                    type="text"
                                    placeholder="Write a reply..."
                                    className="bg-white flex-1 p-2 border border-[#68BA7F]/20 rounded-lg text-xs placeholder-[#2E6F40]/50 text-[#253D2C] focus:outline-none focus:ring-1 focus:ring-[#2E6F40]"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const el = e.currentTarget;
                                        handleAddComment(post.id, el.value);
                                        el.value = '';
                                      }
                                    }}
                                  />
                                </div>
                              </div>

                            </div>
                          );
                        })}

                      {posts.filter(p => activeProfileId === 'self' || p.authorId === activeProfileId).length === 0 && (
                        <div className="text-center py-12 bg-[#F4F9F5]/40 rounded-3xl border border-dashed border-[#68BA7F]/20">
                          <Trophy className="w-12 h-12 text-[#2E6F40]/30 mx-auto mb-2" />
                          <p className="text-[#253D2C]/60 text-sm">No recent posts written by this profile.</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* 2. ABOUT & CREDENTIALS TAB */}
                {activeTab === 'credentials' && (
                  <div className="space-y-8">
                    
                    {/* Education Items section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#253D2C] flex items-center gap-2 border-b border-[#68BA7F]/10 pb-2">
                        <GraduationCap className="text-[#2E6F40]" size={20} />
                        <span>Academic Education</span>
                      </h3>

                      {activeProfile.education.length === 0 ? (
                        <p className="text-xs text-[#2E6F40]/50 italic pl-1">No education data cataloged on profile.</p>
                      ) : (
                        <div className="border border-[#68BA7F]/10 rounded-2xl overflow-hidden divide-y divide-[#68BA7F]/10 bg-[#FAFDF6]/25">
                          {activeProfile.education.map((edu) => (
                            <div key={edu.id} className="p-4 flex gap-4 text-sm justify-between hover:bg-[#CFFFDC]/10 transition-colors">
                              <div className="space-y-1">
                                <h4 className="font-bold text-[#1E4D2B]">{edu.degree}</h4>
                                <p className="text-xs font-semibold text-[#253D2C]">
                                  {edu.institution} <span className="text-[#68BA7F]">|</span> {edu.field}
                                </p>
                              </div>
                              <span className="font-mono text-xs font-bold text-[#2E6F40] bg-white border border-[#68BA7F]/20 rounded-full h-fit px-3.5 py-1 shrink-0">
                                {edu.startYear} - {edu.endYear}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Career History section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#253D2C] flex items-center gap-2 border-b border-[#68BA7F]/10 pb-2">
                        <Briefcase className="text-[#2E6F40]" size={20} />
                        <span>Professional History</span>
                      </h3>

                      {activeProfile.career.length === 0 ? (
                        <p className="text-xs text-[#2E6F40]/50 italic pl-1">No career positions logged on profile.</p>
                      ) : (
                        <div className="border border-[#68BA7F]/10 rounded-2xl overflow-hidden divide-y divide-[#68BA7F]/10 bg-[#FAFDF6]/25">
                          {activeProfile.career.map((car) => (
                            <div key={car.id} className="p-4 flex gap-4 text-sm justify-between hover:bg-[#CFFFDC]/10 transition-colors">
                              <div className="space-y-1">
                                <h4 className="font-bold text-[#1E4D2B]">{car.position}</h4>
                                <p className="text-xs font-semibold text-[#253D2C]">
                                  {car.organization} — {car.location}
                                </p>
                              </div>
                              <span className="font-mono text-xs font-bold text-[#2E6F40] bg-white border border-[#68BA7F]/20 rounded-full h-fit px-3.5 py-1 shrink-0">
                                {car.startYear} - {car.endYear}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Publications and Awards */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#253D2C] flex items-center gap-2 border-b border-[#68BA7F]/10 pb-2">
                        <Award className="text-[#2E6F40]" size={20} />
                        <span>Featured Scholarly Portfolio</span>
                      </h3>

                      {activeProfile.publications.length === 0 && activeProfile.awards.length === 0 ? (
                        <p className="text-xs text-[#2E6F40]/50 italic pl-1">No scholarly awards or papers declared.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                          
                          {/* Papers */}
                          <div className="space-y-3.5">
                            <h4 className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Publications</h4>
                            <div className="space-y-2">
                              {activeProfile.publications.map((p, idx) => (
                                <div key={idx} className="p-3 bg-[#FAFDF6]/40 border border-[#68BA7F]/10 rounded-xl text-xs flex gap-2 leading-relaxed text-[#253D2C] hover:border-[#68BA7F]/30 transition">
                                  <span className="text-[#2E6F40] font-bold">[{idx+1}]</span>
                                  <span>{p}</span>
                                </div>
                              ))}
                              {activeProfile.publications.length === 0 && (
                                <p className="text-xs text-[#2E6F40]/40 italic">None logged.</p>
                              )}
                            </div>
                          </div>

                          {/* Awards */}
                          <div className="space-y-3.5">
                            <h4 className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Awards & Fellowship</h4>
                            <div className="space-y-2">
                              {activeProfile.awards.map((awr, idx) => (
                                <div key={idx} className="p-3 bg-[#FAFDF6]/40 border border-[#68BA7F]/10 rounded-xl text-xs flex gap-2 items-center leading-normal text-[#253D2C] hover:border-[#68BA7F]/30 transition">
                                  <Trophy size={13} className="text-yellow-600 shrink-0" />
                                  <span>{awr}</span>
                                </div>
                              ))}
                              {activeProfile.awards.length === 0 && (
                                <p className="text-xs text-[#2E6F40]/40 italic">None logged.</p>
                              )}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2.5 ANALYTICS DYNAMICS TAB */}
                {activeTab === 'analytics' && (
                  <div className="space-y-8 animate-fadeIn">
                    
                    {/* Header */}
                    <div className="border-b border-[#68BA7F]/10 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-[#253D2C]">Research Activity Dynamics</h2>
                        <p className="text-xs text-[#2E6F40]/80">Frequency of dynamic sessions created over the last 30 days & study breakdown</p>
                      </div>
                      <div className="text-sm font-semibold bg-[#CFFFDC] text-[#253D2C] px-3.5 py-1.5 rounded-[1rem] self-start sm:self-center border border-[#68BA7F]/30 shadow-xs">
                        Total Focus: {chartData.reduce((acc, curr) => acc + curr.sessions, 0)} Sessions
                      </div>
                    </div>

                    {/* Chart 1: Line Chart for 30-day history */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-[#2E6F40]" />
                        <h3 className="text-sm font-bold text-[#253D2C] uppercase tracking-wider">30-Day Project Momentum</h3>
                      </div>
                      
                      <div className="w-full">
                        {chartLoading ? (
                          <div className="h-[300px] flex items-center justify-center text-[#2E6F40]/50 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Analyzing research history...
                          </div>
                        ) : chartMounted ? (
                          <>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                                <defs>
                                  <linearGradient id="profile-intensity-gradient" x1="0" y1="0" x2="1" y2="0">
                                    {chartData.map((d, i) => {
                                      const offset = `${(i / (chartData.length - 1)) * 100}%`;
                                      let stopColor = '#E4E9E5'; // Quiet state
                                      if (d.sessions === 1) stopColor = '#68BA7F'; // Moderate Study
                                      else if (d.sessions === 2) stopColor = '#2E6F40'; // Solid active
                                      else if (d.sessions >= 3) stopColor = '#EAB308'; // Peak breakthrough
                                      return (
                                        <stop key={i} offset={offset} stopColor={stopColor} />
                                      );
                                    })}
                                  </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#68BA7F" strokeDasharray="3 3" opacity={0.15} vertical={false} />
                                <XAxis 
                                  dataKey="date" 
                                  stroke="#2E6F40" 
                                  fontSize={11} 
                                  tickLine={false} 
                                  axisLine={false}
                                  dy={10} 
                                  opacity={0.8}
                                />
                                <YAxis 
                                  stroke="#2E6F40" 
                                  fontSize={11} 
                                  tickLine={false} 
                                  axisLine={false}
                                  allowDecimals={false}
                                  dx={-5}
                                  opacity={0.8}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                  type="monotone" 
                                  dataKey="sessions" 
                                  stroke="url(#profile-intensity-gradient)" 
                                  strokeWidth={4.5} 
                                  dot={(props: any) => {
                                    const { cx, cy, payload } = props;
                                    let fillVal = '#E4E9E5';
                                    let strokeVal = '#B8C6BC';
                                    if (payload.sessions === 1) {
                                      fillVal = '#68BA7F';
                                      strokeVal = '#2E6F40';
                                    } else if (payload.sessions === 2) {
                                      fillVal = '#2E6F40';
                                      strokeVal = '#1B4326';
                                    } else if (payload.sessions >= 3) {
                                      fillVal = '#EAB308';
                                      strokeVal = '#A16207';
                                    }
                                    return (
                                      <circle
                                        cx={cx}
                                        cy={cy}
                                        r={4.5}
                                        stroke={strokeVal}
                                        strokeWidth={1.5}
                                        fill={fillVal}
                                        key={`dot-${payload.date}`}
                                      />
                                    );
                                  }}
                                  activeDot={(props: any) => {
                                    const { cx, cy, payload } = props;
                                    let fillVal = '#E4E9E5';
                                    let strokeVal = '#B8C6BC';
                                    if (payload.sessions === 1) {
                                      fillVal = '#68BA7F';
                                      strokeVal = '#2E6F40';
                                    } else if (payload.sessions === 2) {
                                      fillVal = '#2E6F40';
                                      strokeVal = '#1B4326';
                                    } else if (payload.sessions >= 3) {
                                      fillVal = '#EAB308';
                                      strokeVal = '#A16207';
                                    }
                                    return (
                                      <circle
                                        cx={cx}
                                        cy={cy}
                                        r={6.5}
                                        stroke={strokeVal}
                                        strokeWidth={2.5}
                                        fill={fillVal}
                                        key={`active-dot-${payload.date}`}
                                      />
                                    );
                                  }}
                                  isAnimationActive={true}
                                  animationDuration={1200}
                                />
                              </LineChart>
                            </ResponsiveContainer>

                            {/* Dynamic Heatmap Legend */}
                            <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#68BA7F]/10 text-xs text-[#2E6F40]/70">
                              <span className="font-semibold text-[#253D2C]/80">Research Intensity Spectrum:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#E4E9E5] border border-gray-300 inline-block" />
                                <span>Quiet Focus</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#68BA7F] inline-block" />
                                <span>Moderate Work (1)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#2E6F40] inline-block" />
                                <span>Active Study (2)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#EAB308] inline-block" />
                                <span>Peak Discovery (3+)</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="h-[300px]" />
                        )}
                      </div>
                    </div>

                    {/* Chart 2: Pie distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#68BA7F]/10 items-center">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-[#2E6F40]" />
                          <h3 className="text-sm font-bold text-[#253D2C] uppercase tracking-wider">Methodology Distribution</h3>
                        </div>
                        <p className="text-xs text-[#2E6F40]/70 leading-relaxed">
                          Breakdown of research sessions categorized into dynamic action sectors (Idea Catalyst, Analytical Foundry, and Strategic Discovery). This index quantifies disciplinary diversity and workflow equilibrium.
                        </p>
                      </div>

                      <div className="w-full h-[250px] flex items-center justify-center">
                        {chartLoading ? (
                          <div className="h-full flex items-center justify-center text-[#2E6F40]/50 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Analyzing distribution...
                          </div>
                        ) : chartMounted && categoryData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#68BA7F', '#EAB308', '#2E6F40', '#B8C6BC'][index % 4]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ borderRadius: '1rem', border: '1px solid rgba(104, 186, 127, 0.3)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#253D2C', fontWeight: 'bold' }}
                              />
                              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#2E6F40' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-[200px] flex items-center justify-center text-[#2E6F40]/50 text-sm border-2 border-dashed border-[#68BA7F]/10 rounded-2xl p-4 text-center">
                            No methodology sessions recorded in the database yet. Run some concept collisions to see live allocations!
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. CHAT MESSENGER TAB */}
                {activeTab === 'chat' && (
                  <div className="space-y-6">
                    <div className="border-b border-[#68BA7F]/10 pb-3">
                      <h2 className="text-xl font-bold text-[#253D2C]">Collaboration Chats</h2>
                      <p className="text-xs text-[#2E6F40]/80">Encrypted instant messaging and joint research sequence pitch room.</p>
                    </div>

                    {/* Chat dashboard columns */}
                    <div className="grid grid-cols-1 md:grid-cols-12 border border-[#68BA7F]/20 rounded-[1.5rem] bg-[#FAFDF6]/20 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#68BA7F]/20">
                      
                      {/* Left: Active conversations list */}
                      <div className="md:col-span-4 p-2 space-y-2.5">
                        <span className="text-[10px] font-bold text-[#2E6F40]/80 uppercase tracking-widest pl-2">Active Chats</span>
                        
                        {Object.values(researchers).map((sch) => {
                          const isThreadActive = activeChatId === sch.id;
                          const threadMsg = chats[sch.id] || [];
                          const lastMsg = threadMsg[threadMsg.length - 1];
                          
                          return (
                            <div
                              key={sch.id}
                              onClick={() => {
                                setActiveChatId(sch.id);
                                if (activeProfileId !== sch.id) {
                                  setActiveProfileId('self'); // Return to chats
                                }
                              }}
                              className={`p-3 rounded-2xl cursor-pointer flex items-center gap-2.5 transition-all outline-none border ${
                                isThreadActive 
                                  ? 'bg-[#CFFFDC]/40 border-[#68BA7F] shadow-sm' 
                                  : 'bg-white border-[#68BA7F]/10 hover:border-[#68BA7F]/30'
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${sch.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 select-none`}>
                                {sch.initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-[#253D2C] truncate">{sch.full_name}</h4>
                                <p className="text-[10px] text-[#2E6F40]/70 truncate">
                                  {lastMsg ? lastMsg.text : 'Click to send proposal...'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right: Message dialogue window */}
                      <div className="md:col-span-8 flex flex-col h-[400px]">
                        
                        {/* Selected companion banner */}
                        <div className="p-3 bg-white border-b border-[#68BA7F]/10 flex items-center justify-between select-none shrink-0">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${researchers[activeChatId]?.avatarColor || 'from-[#2E6F40] to-green-800'} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                              {researchers[activeChatId]?.initials || 'R'}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#253D2C]">{researchers[activeChatId]?.full_name || 'Colleague'}</h4>
                              <p className="text-[9px] text-[#2E6F40]/70">Wageningen / Kyoto / Cambridge Grid • Online</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] bg-[#CFFFDC] text-[#1E4D2B] px-2.5 py-1 rounded-full font-bold border border-[#68BA7F]/20 shadow-sm uppercase shrink-0">
                            <Sparkles className="w-3 h-3 text-emerald-700 animate-pulse" />
                            <span>Inference Peer</span>
                          </div>
                        </div>

                        {/* Dialogue Stream */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/40">
                          {(chats[activeChatId] || []).map((msg) => {
                            const isSelf = msg.senderId === 'self';
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isSelf ? 'justify-end' : 'justify-start'} w-full items-end gap-2.5`}
                              >
                                {!isSelf && (
                                  <div className={`w-6 h-6 rounded-md bg-gradient-to-tr ${researchers[activeChatId]?.avatarColor} text-white flex items-center justify-center font-bold text-[9px] shrink-0 select-none`}>
                                    {researchers[activeChatId]?.initials}
                                  </div>
                                )}
                                <div
                                  className={`p-3 max-w-[75%] rounded-[1.25rem] text-xs leading-relaxed ${
                                    isSelf 
                                      ? 'bg-[#2E6F40] text-white rounded-br-none shadow-sm' 
                                      : 'bg-white border border-[#68BA7F]/20 text-[#253D2C] rounded-bl-none shadow-sm'
                                  }`}
                                >
                                  {msg.text}
                                  <div className={`text-[8px] text-right mt-1 font-mono uppercase ${isSelf ? 'text-white/60' : 'text-[#2E6F40]/60'}`}>
                                    {msg.timestamp}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Input actions dock */}
                        <div className="p-3 bg-white border-t border-[#68BA7F]/10 flex gap-2 items-center shrink-0">
                          <input
                            type="text"
                            placeholder={`Type structural research parameters...`}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 p-2.5 bg-[#FAFDF6]/50 border border-[#68BA7F]/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-xs text-[#253D2C] placeholder-[#2E6F40]/50"
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!chatInput.trim()}
                            className="p-2.5 bg-[#2E6F40] hover:bg-[#253D2C] text-white rounded-xl transition-all shadow-sm shrink-0 disabled:opacity-50"
                          >
                            <SendHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* JOINT COLLABORATION DIALOG MODAL */}
      <AnimatePresence>
        {collabModal.isOpen && (
          <div className="fixed inset-0 bg-[#1E4D2B]/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#68BA7F]/30 rounded-[2rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <h3 className="text-xl font-bold text-[#253D2C] flex items-center gap-2 border-b border-[#68BA7F]/10 pb-3">
                <Sparkles className="text-[#2E6F40]" size={20} />
                <span>Initialize Research Collaboration</span>
              </h3>

              <div className="space-y-4 pt-4 text-sm">
                <p className="text-[#2E6F40]/80">
                  Target: <span className="font-bold text-[#1E4D2B]">{researchers[collabModal.targetResearcherId || '']?.full_name}</span>
                </p>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider font-mono">Select Catalyst Lab Instrument</label>
                  <select 
                    className="w-full p-3 bg-[#FAFDF6] border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40]"
                    value={collabInstrument}
                    onChange={(e) => setCollabInstrument(e.target.value)}
                  >
                    <option value="Thought Collider">Thought Collider</option>
                    <option value="Concept Alchemy">Concept Alchemy</option>
                    <option value="Research Multiverse">Research Multiverse</option>
                    <option value="Assumption Excavator">Assumption Excavator</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Initial Hypothesis Pitch</label>
                  <textarea 
                    className="w-full p-3 h-28 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] resize-none text-xs text-[#253D2C]"
                    placeholder={`Describe your collaborative hypothesis, joint variables, or experiment with Dr. / Prof. ${researchers[collabModal.targetResearcherId || '']?.full_name || 'your colleague'}...`}
                    value={collabPitch}
                    onChange={(e) => setCollabPitch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-6 border-t border-[#68BA7F]/10 mt-6">
                <button
                  onClick={() => setCollabModal({ isOpen: false, targetResearcherId: null })}
                  className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl hover:text-gray-900 border border-gray-200 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishCollaboration}
                  disabled={!collabPitch.trim()}
                  className="px-5 py-2.5 bg-[#2E6F40] text-white rounded-xl hover:bg-[#253D2C] hover:shadow transition-all text-xs font-bold disabled:opacity-50"
                >
                  Launch Collaboration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE DIALOG MODAL (COMPATIBLE WITH OLD VALUES) */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 bg-[#1E4D2B]/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#68BA7F]/30 rounded-[2.5rem] max-w-4xl w-full shadow-2xl relative my-auto max-h-[90vh] flex flex-col"
            >
              {/* Profile sub header */}
              <div className="p-6 sm:p-8 pb-3 border-b border-[#68BA7F]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-[#253D2C] flex items-center gap-2">
                    <Settings2 className="text-[#2E6F40]" size={22} />
                    <span>User Profile Settings</span>
                  </h3>
                  <p className="text-xs text-[#2E6F40]/80 mt-1">Configure academic demographics & professional career logs.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      triggerSave(profile);
                      setIsEditingProfile(false);
                    }}
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#2E6F40] hover:bg-[#253D2C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow hover:shadow-md disabled:opacity-50 shrink-0"
                  >
                    {saving ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save size={14} />}
                    <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold rounded-xl transition-all shrink-0"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Grid with tab selectors on the left, editing form on the right */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-4 min-h-[400px]">
                
                {/* Left Side: forms tab controller */}
                <div className="bg-[#FAFDF6]/40 p-4 border-r border-[#68BA7F]/10 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible shrink-0 select-none pb-3 gap-1 md:gap-0">
                  {[
                    { id: 'demographics', label: 'Demographics', icon: User },
                    { id: 'education', label: 'Education', icon: GraduationCap },
                    { id: 'career', label: 'Career History', icon: Briefcase },
                    { id: 'scholar', label: 'Portfolio', icon: Award },
                  ].map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => setEditTab(subTab.id as any)}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all relative ${
                        editTab === subTab.id
                          ? 'bg-[#CFFFDC] text-[#1E4D2B] border border-[#68BA7F]/20 shadow-sm'
                          : 'text-[#2E6F40]/70 hover:bg-[#FAFDF6] hover:text-[#1E4D2B]'
                      }`}
                    >
                      <subTab.icon className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">{subTab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Right Side: scrollable form box */}
                <div className="md:col-span-3 p-6 sm:p-8 overflow-y-auto">
                  
                  {/* DEMOGRAPHICS SUB MODULE */}
                  {editTab === 'demographics' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                        
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">Full Name</label>
                          <input 
                            type="text"
                            className="w-full p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-xs" 
                            value={profile.full_name || ''} 
                            onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">ORCID iD</label>
                          <input 
                            type="text"
                            className="w-full p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-xs" 
                            placeholder="0000-0002-1807-0016"
                            value={profile.orcid || ''} 
                            onChange={(e) => setProfile({...profile, orcid: e.target.value})} 
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">Professional Bio Statement</label>
                          <textarea 
                            className="w-full p-3 h-22 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-xs resize-none" 
                            value={profile.bio || ''} 
                            onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">Academic Title</label>
                          <input 
                            type="text"
                            className="w-full p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-xs" 
                            placeholder="e.g. Research Fellow"
                            value={profile.demographics.academicTitle || ''} 
                            onChange={(e) => setProfile({
                              ...profile,
                              demographics: { ...profile.demographics, academicTitle: e.target.value }
                            })} 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">Research University / Affiliation</label>
                          <input 
                            type="text"
                            className="w-full p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-xs" 
                            placeholder="e.g. Bangladesh Agricultural University"
                            value={profile.demographics.affiliation || ''} 
                            onChange={(e) => setProfile({
                              ...profile,
                              demographics: { ...profile.demographics, affiliation: e.target.value }
                            })} 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">Primary Research Field</label>
                          <input 
                            type="text"
                            className="w-full p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-xs" 
                            placeholder="e.g. Smart Agriculture"
                            value={profile.demographics.primaryDiscipline || ''} 
                            onChange={(e) => setProfile({
                              ...profile,
                              demographics: { ...profile.demographics, primaryDiscipline: e.target.value }
                            })} 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">Sub-Field Specialty</label>
                          <input 
                            type="text"
                            className="w-full p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-xs" 
                            placeholder="e.g. Biosensors Calibration"
                            value={profile.demographics.secondaryDiscipline || ''} 
                            onChange={(e) => setProfile({
                              ...profile,
                              demographics: { ...profile.demographics, secondaryDiscipline: e.target.value }
                            })} 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">Country Location</label>
                            <input 
                              type="text"
                              className="w-full p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-xs" 
                              value={profile.demographics.location || ''} 
                              onChange={(e) => setProfile({
                                ...profile,
                                demographics: { ...profile.demographics, location: e.target.value }
                              })} 
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">Geographic Nationality</label>
                            <input 
                              type="text"
                              className="w-full p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40] text-xs" 
                              value={profile.demographics.nationality || ''} 
                              onChange={(e) => setProfile({
                                ...profile,
                                demographics: { ...profile.demographics, nationality: e.target.value }
                              })} 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">Age Group</label>
                            <input 
                              type="text"
                              className="w-full p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl focus:outline-none" 
                              placeholder="e.g. 27"
                              value={profile.demographics.age || ''} 
                              onChange={(e) => setProfile({
                                ...profile,
                                demographics: { ...profile.demographics, age: e.target.value }
                              })} 
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">Gender</label>
                            <input 
                              type="text"
                              className="w-full p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl focus:outline-none" 
                              placeholder="e.g. Male"
                              value={profile.demographics.gender || ''} 
                              onChange={(e) => setProfile({
                                ...profile,
                                demographics: { ...profile.demographics, gender: e.target.value }
                              })} 
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#2E6F40]/80 uppercase tracking-wider">Languages</label>
                            <input 
                              type="text"
                              className="w-full p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl focus:outline-none" 
                              value={profile.demographics.preferredLanguage || ''} 
                              onChange={(e) => setProfile({
                                ...profile,
                                demographics: { ...profile.demographics, preferredLanguage: e.target.value }
                              })} 
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* EDUCATION SUB-FORM MODULE */}
                  {editTab === 'education' && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center border-b border-[#68BA7F]/10 pb-2">
                        <span className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Completed Academic Degrees</span>
                        <button
                          onClick={() => {
                            const newEdu: EducationItem = {
                              id: Math.random().toString(36).substring(2, 9),
                              degree: '',
                              institution: '',
                              field: '',
                              startYear: '',
                              endYear: ''
                            };
                            setProfile({ ...profile, education: [...profile.education, newEdu] });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFDF6] hover:bg-[#CFFFDC] border border-[#68BA7F]/30 text-[#1E4D2B] rounded-lg text-xs font-bold transition"
                        >
                          <Plus size={12} /> Add Row
                        </button>
                      </div>

                      <div className="space-y-4">
                        {profile.education.map((edu, idx) => (
                          <div key={edu.id} className="p-4 bg-[#FAFDF6]/30 border border-[#68BA7F]/20 rounded-xl relative space-y-4 shadow-sm">
                            <button
                              onClick={() => {
                                setProfile({ ...profile, education: profile.education.filter(e => e.id !== edu.id) });
                              }}
                              className="absolute right-3 top-3 p-1 rounded-full text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div className="space-y-1">
                                <label className="font-bold text-[#2E6F40]/80 tracking-wide uppercase text-[9px]">Degree Name</label>
                                <input
                                  type="text"
                                  className="w-full p-2 bg-white border border-[#68BA7F]/25 rounded-md"
                                  placeholder="M.S., B.Sc."
                                  value={edu.degree}
                                  onChange={(e) => {
                                    setProfile({
                                      ...profile,
                                      education: profile.education.map(ed => ed.id === edu.id ? { ...ed, degree: e.target.value } : ed)
                                    });
                                  }}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-[#2E6F40]/80 tracking-wide uppercase text-[9px]">Institution/School</label>
                                <input
                                  type="text"
                                  className="w-full p-2 bg-white border border-[#68BA7F]/25 rounded-md"
                                  placeholder="Stanford University"
                                  value={edu.institution}
                                  onChange={(e) => {
                                    setProfile({
                                      ...profile,
                                      education: profile.education.map(ed => ed.id === edu.id ? { ...ed, institution: e.target.value } : ed)
                                    });
                                  }}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-[#2E6F40]/80 tracking-wide uppercase text-[9px]">Specialty Field</label>
                                <input
                                  type="text"
                                  className="w-full p-2 bg-white border border-[#68BA7F]/25 rounded-md"
                                  placeholder="Precision Automation"
                                  value={edu.field}
                                  onChange={(e) => {
                                    setProfile({
                                      ...profile,
                                      education: profile.education.map(ed => ed.id === edu.id ? { ...ed, field: e.target.value } : ed)
                                    });
                                  }}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-[#2E6F40]/80 tracking-wide uppercase text-[9px]">Start Year</label>
                                <input
                                  type="text"
                                  className="w-full p-2 bg-white border border-[#68BA7F]/25 rounded-md text-xs font-mono"
                                  placeholder="2016"
                                  value={edu.startYear}
                                  onChange={(e) => {
                                    setProfile({
                                      ...profile,
                                      education: profile.education.map(ed => ed.id === edu.id ? { ...ed, startYear: e.target.value } : ed)
                                    });
                                  }}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-[#2E6F40]/80 tracking-wide uppercase text-[9px]">End Year</label>
                                <input
                                  type="text"
                                  className="w-full p-2 bg-white border border-[#68BA7F]/25 rounded-md text-xs font-mono"
                                  placeholder="2020"
                                  value={edu.endYear}
                                  onChange={(e) => {
                                    setProfile({
                                      ...profile,
                                      education: profile.education.map(ed => ed.id === edu.id ? { ...ed, endYear: e.target.value } : ed)
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CAREER SUB-FORM MODULE */}
                  {editTab === 'career' && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center border-b border-[#68BA7F]/10 pb-2">
                        <span className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider">Professional Work History</span>
                        <button
                          onClick={() => {
                            const newCar: CareerItem = {
                              id: Math.random().toString(36).substring(2, 9),
                              position: '',
                              organization: '',
                              location: '',
                              startYear: '',
                              endYear: ''
                            };
                            setProfile({ ...profile, career: [...profile.career, newCar] });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFDF6] hover:bg-[#CFFFDC] border border-[#68BA7F]/30 text-[#1E4D2B] rounded-lg text-xs font-bold transition"
                        >
                          <Plus size={12} /> Add Row
                        </button>
                      </div>

                      <div className="space-y-4">
                        {profile.career.map((car) => (
                          <div key={car.id} className="p-4 bg-[#FAFDF6]/30 border border-[#68BA7F]/20 rounded-xl relative space-y-4 shadow-sm">
                            <button
                              onClick={() => {
                                setProfile({ ...profile, career: profile.career.filter(c => c.id !== car.id) });
                              }}
                              className="absolute right-3 top-3 p-1 rounded-full text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div className="space-y-1">
                                <label className="font-bold text-[#2E6F40]/80 tracking-wide uppercase text-[9px]">Position Title</label>
                                <input
                                  type="text"
                                  className="w-full p-2 bg-white border border-[#68BA7F]/25 rounded-md"
                                  placeholder="e.g. Lead Engineer"
                                  value={car.position}
                                  onChange={(e) => {
                                    setProfile({
                                      ...profile,
                                      career: profile.career.map(c => c.id === car.id ? { ...c, position: e.target.value } : c)
                                    });
                                  }}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-[#2E6F40]/80 tracking-wide uppercase text-[9px]">Employer Organization</label>
                                <input
                                  type="text"
                                  className="w-full p-2 bg-white border border-[#68BA7F]/25 rounded-md"
                                  placeholder="Silicon Tech, BAU Labs"
                                  value={car.organization}
                                  onChange={(e) => {
                                    setProfile({
                                      ...profile,
                                      career: profile.career.map(c => c.id === car.id ? { ...c, organization: e.target.value } : c)
                                    });
                                  }}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-[#2E6F40]/80 tracking-wide uppercase text-[9px]">Location</label>
                                <input
                                  type="text"
                                  className="w-full p-2 bg-white border border-[#68BA7F]/25 rounded-md"
                                  placeholder="e.g. Bangladesh"
                                  value={car.location}
                                  onChange={(e) => {
                                    setProfile({
                                      ...profile,
                                      career: profile.career.map(c => c.id === car.id ? { ...c, location: e.target.value } : c)
                                    });
                                  }}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-[#2E6F40]/80 tracking-wide uppercase text-[9px]">Start Year</label>
                                <input
                                  type="text"
                                  className="w-full p-2 bg-white border border-[#68BA7F]/25 rounded-md font-mono text-xs"
                                  placeholder="2021"
                                  value={car.startYear}
                                  onChange={(e) => {
                                    setProfile({
                                      ...profile,
                                      career: profile.career.map(c => c.id === car.id ? { ...c, startYear: e.target.value } : c)
                                    });
                                  }}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-[#2E6F40]/80 tracking-wide uppercase text-[9px]">End Year</label>
                                <input
                                  type="text"
                                  className="w-full p-2 bg-white border border-[#68BA7F]/25 rounded-md font-mono text-xs"
                                  placeholder="Present, or 2024"
                                  value={car.endYear}
                                  onChange={(e) => {
                                    setProfile({
                                      ...profile,
                                      career: profile.career.map(c => c.id === car.id ? { ...c, endYear: e.target.value } : c)
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PORTFOLIO BIBLIOGRAPHY MODULE */}
                  {editTab === 'scholar' && (
                    <div className="space-y-6">
                      
                      {/* Publications List */}
                      <div className="space-y-3.5">
                        <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider block border-b border-[#68BA7F]/10 pb-2.5">
                          My Publications
                        </label>

                        <div className="flex gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Standard format input (e.g. IoT scheduling telemetry (2025))"
                            className="flex-1 p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl"
                            value={tempPub}
                            onChange={(e) => setTempPub(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && tempPub.trim()) {
                                setProfile({ ...profile, publications: [...profile.publications, tempPub.trim()] });
                                setTempPub('');
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (tempPub.trim()) {
                                setProfile({ ...profile, publications: [...profile.publications, tempPub.trim()] });
                                setTempPub('');
                              }
                            }}
                            className="bg-[#2E6F40] hover:bg-[#253D2C] px-4 rounded-xl text-white font-bold"
                          >
                            Add
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pt-1">
                          {profile.publications.map((p, pIdx) => (
                            <div key={pIdx} className="bg-[#FAFDF6]/20 border border-[#FAFDF6] rounded-lg p-2.5 flex items-center justify-between text-xs gap-3">
                              <span className="font-mono text-[11px] text-[#253D2C] truncate">
                                <span className="font-bold text-[#2E6F40] mr-1">[{pIdx+1}]</span> {p}
                              </span>
                              <button
                                onClick={() => {
                                  setProfile({ ...profile, publications: profile.publications.filter((_, idx) => idx !== pIdx) });
                                }}
                                className="text-red-500 hover:bg-red-50 p-1 rounded-full"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Awards List */}
                      <div className="space-y-3.5 pt-2">
                        <label className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider block border-b border-[#68BA7F]/10 pb-2.5">
                          Awards & Recognition
                        </label>

                        <div className="flex gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Award title, fellowship grant..."
                            className="flex-1 p-2.5 bg-[#FAFDF6]/45 border border-[#68BA7F]/30 rounded-xl"
                            value={tempAward}
                            onChange={(e) => setTempAward(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && tempAward.trim()) {
                                setProfile({ ...profile, awards: [...profile.awards, tempAward.trim()] });
                                setTempAward('');
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (tempAward.trim()) {
                                setProfile({ ...profile, awards: [...profile.awards, tempAward.trim()] });
                                setTempAward('');
                              }
                            }}
                            className="bg-[#2E6F40] hover:bg-[#253D2C] px-4 rounded-xl text-white font-bold"
                          >
                            Add
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pt-1">
                          {profile.awards.map((awr, aIdx) => (
                            <div key={aIdx} className="bg-[#FAFDF6]/20 border border-[#FAFDF6] rounded-lg p-2.5 flex items-center justify-between text-xs gap-3">
                              <span className="flex items-center gap-1.5 text-[11px] text-[#253D2C] truncate">
                                <Trophy size={11} className="text-yellow-600 shrink-0" />
                                <span className="truncate">{awr}</span>
                              </span>
                              <button
                                onClick={() => {
                                  setProfile({ ...profile, awards: profile.awards.filter((_, idx) => idx !== aIdx) });
                                }}
                                className="text-red-500 hover:bg-red-50 p-1 rounded-full"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
