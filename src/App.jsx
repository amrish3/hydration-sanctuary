import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Send, X } from 'lucide-react';
import ReefLife from './components/ReefLife';
import Bottle from './components/Bottle';
import SplashScreen from './components/SplashScreen';
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const SPLASH_URL = "https://actions.google.com/sounds/v1/water/slosh.ogg";

export default function App() {
    const [isIntro, setIsIntro] = useState(true);
    const [waterLevel, setWaterLevel] = useState(0);
    const [showBottlePopup, setShowBottlePopup] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("");
    const [moonClickCount, setMoonClickCount] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [customNote, setCustomNote] = useState("");
    const audioRef = useRef(null);

    const roomID = "our-special-place";
    const dailyGoal = 3000;

    useEffect(() => {
        audioRef.current = new Audio(SPLASH_URL);
        audioRef.current.load();
    }, []);

    const getMoonIcon = () => {
        const lp = 2551443;
        const now = new Date();
        const new_moon = new Date(1970, 0, 7, 20, 35, 0);
        const phase = ((now.getTime() - new_moon.getTime())/1000) % lp;
        const age = Math.floor(phase /(24*3600));
        if (age < 2) return "🌑";
        if (age < 7) return "🌒";
        if (age < 10) return "🌓";
        if (age < 15) return "🌕";
        if (age < 20) return "🌖";
        if (age < 25) return "🌗";
        return "🌘";
    };

    useEffect(() => {
        const docRef = doc(db, "sanctuaries", roomID);
        const unsub = onSnapshot(docRef, (snapshot) => {
            const today = new Date().toISOString().split("T")[0];
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.lastResetDate !== today) {
                    updateDoc(docRef, { waterLevel: 0, lastResetDate: today });
                } else {
                    setWaterLevel(data.waterLevel || 0);
                    setHasNewMessage(data.hasUnreadMessage || false);
                    setCurrentMessage(data.lastMessage || "");
                }
            } else {
                setDoc(docRef, { waterLevel: 0, hasUnreadMessage: false, lastMessage: "Welcome ✨", lastResetDate: today });
            }
        });
        return () => unsub();
    }, []);

    const addWater = async () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }
        const newLevel = Math.min(waterLevel + 10, 100);
        setWaterLevel(newLevel);
        await updateDoc(doc(db, "sanctuaries", roomID), { waterLevel: newLevel });
    };

    const sendCustomCareDrop = async () => {
        if (!customNote.trim()) return;
        await updateDoc(doc(db, "sanctuaries", roomID), { lastMessage: customNote, hasUnreadMessage: true });
        setCustomNote("");
        setIsAdmin(false);
    };

    const handleOpenBottle = async () => {
        setShowBottlePopup(true);
        await updateDoc(doc(db, "sanctuaries", roomID), { hasUnreadMessage: false });
    };

    return (
        <AnimatePresence mode="wait">
            {isIntro ? (
                <SplashScreen
                    key="splash-screen"
                    onFinish={() => {
                        setIsIntro(false);
                        if (audioRef.current) {
                            audioRef.current.play().then(() => audioRef.current.pause()).catch(() => {});
                        }
                    }}
                />
            ) : (
                <motion.div
                    key="main-sanctuary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#0a0f1e]"
                >
                    <ReefLife waterLevel={waterLevel} />

                    {/* Moon: Fades in slightly after the background */}
                    <motion.div
                        onClick={() => {
                            setMoonClickCount(prev => prev + 1);
                            if (moonClickCount >= 3) { setIsAdmin(true); setMoonClickCount(0); }
                        }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 0.7, y: 0 }}
                        transition={{ delay: 0.5, duration: 1.5 }}
                        className="absolute top-6 sm:top-10 text-5xl sm:text-6xl cursor-pointer select-none z-20"
                    >
                        <span className="blur-[1px] opacity-70 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{getMoonIcon()}</span>
                    </motion.div>

                    {/* Main Card: Slow-mo Slide Up */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.8, duration: 1.8, ease: "easeOut" }}
                        className="glass w-full max-w-[320px] sm:max-w-sm rounded-[45px] sm:rounded-[55px] p-8 sm:p-10 relative z-10 shadow-2xl border border-white/10 flex flex-col items-center"
                    >
                        <div className="text-center mb-8 sm:mb-10">
                            <h2 className="text-blue-200/60 text-[13px] sm:text-[15px] tracking-[0.6em] uppercase font-light italic mb-1">
                                Hydration
                            </h2>
                            <h1 className="text-white text-[24px] sm:text-[28px] tracking-[0.3em] uppercase font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                Sanctuary
                            </h1>
                        </div>

                        <div className="relative w-32 h-60 sm:w-40 sm:h-72 border-[6px] border-white/10 rounded-b-[70px] rounded-t-3xl overflow-hidden bg-white/5 shadow-inner">
                            <motion.div
                                animate={{ height: `${waterLevel}%` }}
                                transition={{ type: 'spring', damping: 20, stiffness: 50 }}
                                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600/70 to-cyan-400/50 backdrop-blur-sm"
                            >
                                <AnimatePresence>
                                    {hasNewMessage && (
                                        <motion.button
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: [0, -10, 0], opacity: 1 }}
                                            transition={{ y: { repeat: Infinity, duration: 3 } }}
                                            onClick={handleOpenBottle}
                                            className="absolute top-1/4 left-1/2 -translate-x-1/2 text-3xl sm:text-4xl filter drop-shadow-lg"
                                        >
                                            🍾
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent" />
                        </div>

                        <div className="mt-8 sm:mt-10 text-center text-white">
                            <p className="text-4xl sm:text-5xl font-extralight tracking-tighter flex items-baseline justify-center">
                                {Math.round((waterLevel / 100) * dailyGoal)}
                                <span className="text-xs sm:text-sm text-blue-300/40 ml-2 uppercase tracking-[0.2em] font-normal">ml</span>
                            </p>
                        </div>

                        <button
                            onClick={addWater}
                            className="mt-8 sm:mt-10 w-full py-4 sm:py-5 rounded-[25px] bg-white/[0.03] border border-white/10 flex items-center justify-center gap-3 active:scale-95 text-white transition-all hover:bg-white/[0.08] shadow-lg"
                        >
                            <Droplets className="text-cyan-400/80" size={18} />
                            <span className="font-light tracking-[0.2em] uppercase text-[11px] sm:text-[12px]">Add Sip</span>
                        </button>
                    </motion.div>

                    <Bottle message={currentMessage} isVisible={showBottlePopup} onClose={() => setShowBottlePopup(false)} />

                    {/* Admin Panel */}
                    <AnimatePresence>
                        {isAdmin && (
                            <motion.div
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 100 }}
                                className="fixed bottom-0 w-full flex justify-center p-4 sm:p-6 z-50"
                            >
                                <div className="glass w-full max-w-md p-7 rounded-[35px] border border-white/20 shadow-2xl">
                                    <div className="flex justify-between items-center mb-5 text-white">
                                        <h3 className="text-blue-200 text-[10px] font-bold uppercase tracking-[0.2em]">Partner Mode</h3>
                                        <button onClick={() => setIsAdmin(false)}><X size={20}/></button>
                                    </div>
                                    <textarea
                                        value={customNote}
                                        onChange={(e) => setCustomNote(e.target.value)}
                                        placeholder="Write a secret note..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-white/20"
                                        rows="3"
                                    />
                                    <button onClick={sendCustomCareDrop} className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-sm transition-colors">
                                        <Send size={16}/> Send to Sanctuary
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}