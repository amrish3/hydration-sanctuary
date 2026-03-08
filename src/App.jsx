import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Send, X } from 'lucide-react';
import ReefLife from './components/ReefLife';
import Bottle from './components/Bottle';
import SplashScreen from './components/SplashScreen';
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import bottleIcon from "./assets/icon-bottle.svg";

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
    const [splash, setSplash] = useState(false);

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
        setSplash(true);
        setTimeout(() => setSplash(false), 600);
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

    // --- REAL PHYSICS BUOYANCY ---
    const isBottom = waterLevel <= 15;
    const isFull = waterLevel >= 100;

    // 1. Where is the "Surface"?
    // If empty, the surface is the floor (-1%). Otherwise, the surface is the waterLevel.
    const surfaceLevel = isBottom ? "-1%" : `${waterLevel}%`;

    // 2. How much is submerged?
    // If empty: 0 (sits on the floor).
    // If floating: 50% (half in water).
    // If full: 80% (mostly submerged at the top).
    const submersionOffset = isBottom ? 0 : isFull ? 60 : 33;

    // 3. Bobbing (Only happens if there is water)
    const bobAmount = isBottom ? [0, 0] : [submersionOffset - 3, submersionOffset + 3, submersionOffset - 3];
    const rotateAmount = isBottom ? 0 : [-4, 3, -4];

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
                    transition={{ duration: 1 }}
                    className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#0a0f1e]"
                >
                    <ReefLife waterLevel={waterLevel} />

                    {/* Moon */}
                    <motion.div
                        onClick={() => {
                            setMoonClickCount(prev => prev + 1);
                            if (moonClickCount >= 3) { setIsAdmin(true); setMoonClickCount(0); }
                        }}
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 0.8, y: 0 }}
                        transition={{ delay: 0.5, duration: 1.5 }}
                        className="absolute top-14 sm:top-8 text-7xl sm:text-6xl cursor-pointer select-none z-20"
                    >
                        <span className="blur-[0.7px] opacity-70 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">{getMoonIcon()}</span>
                    </motion.div>

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                        className="glass w-full max-w-[350px] sm:max-w-sm rounded-[45px] sm:rounded-[55px] p-8 sm:p-10 relative z-10 shadow-2xl border border-white/10 flex flex-col items-center"
                    >
                        <div className="text-center mb-6 sm:mb-8">
                            <p className="text-blue-300/80 text-[14px] sm:text-[16px] tracking-[0.6em] uppercase font-light italic leading-none mb-1">
                                Hydration
                            </p>
                            <h1 className="text-cyan-300 text-[28px] sm:text-[30px] tracking-[0.4em] uppercase font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                Sanctuary
                            </h1>
                        </div>

                        {/* Vessel */}
                        <div className="relative w-28 h-60 sm:w-40 sm:h-72 border-[6px] border-white/10 rounded-b-[80px] rounded-t-3xl overflow-hidden bg-white/5 shadow-inner">

                            {/* THE WATER (Background Layer) */}
                            <motion.div
                                animate={{ height: `${waterLevel}%` }}
                                transition={{ type: 'spring', damping: 25, stiffness: 40 }}
                                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600/70 to-cyan-400/60 backdrop-blur-[2px] z-10"
                            />

                            {/* THE BOTTLE (Middle Layer) */}
                            <AnimatePresence>
                                {hasNewMessage && (
                                    <motion.button
                                        key="buoyant-bottle"
                                        onClick={handleOpenBottle}
                                        // Initial state matches the "Floor" state to prevent the "falling from top" glitch
                                        initial={{ bottom: "20%", y: 0, opacity: 0 }}
                                        animate={{
                                            bottom: surfaceLevel,
                                            y: bobAmount,
                                            rotate: rotateAmount,
                                            opacity: 1,
                                            x: "-10%"
                                        }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{
                                            bottom: { type: "spring", stiffness: 50, damping: 40 }, // Smooth rise/fall
                                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, // Smooth bob
                                            rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                                        }}
                                        className="absolute left-1/2 z-20 cursor-pointer"
                                    >
                                        <img
                                            src={bottleIcon}
                                            alt="Bottle"
                                            className="w-12 sm:w-16 drop-shadow-2xl"
                                            style={{
                                                // Slight blur only when the glass is 100% full
                                                filter: isFull ? "blur(0.3px) brightness(0.9)" : "none"
                                            }}
                                        />

                                        {/* Bubbles: Only show if there is actually water */}
                                        {waterLevel > 90 && (
                                            <motion.div
                                                animate={{ y: [-10, -30], opacity: [0, 0.7, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute top-0 left-1/2 w-1 h-1 bg-white/40 rounded-full"
                                            />
                                        )}
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            {/* GLASS SHINE (Front Layer) */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 to-transparent z-30" />
                        </div>

                        {/* Stats & Button */}
                        <div className="mt-8 sm:mt-10 text-center text-white font-sans">
                            <p className="text-3xl sm:text-4xl font-extralight tracking-tighter flex items-baseline justify-center">
                                {Math.round((waterLevel / 100) * dailyGoal)}
                                <span className="text-xs sm:text-sm text-blue-300/40 ml-2 uppercase tracking-[0.2em] font-normal">ml</span>
                            </p>
                        </div>

                        <button
                            onClick={addWater}
                            className="mt-8 sm:mt-10 w-full py-4 sm:py-5 rounded-[25px] bg-white/[0.03] border border-white/10 flex items-center justify-center gap-3 active:scale-95 text-white transition-all hover:bg-white/[0.08] shadow-lg"
                        >
                            <Droplets className="text-cyan-400/80" size={20} />
                            <span className="font-medium tracking-[0.2em] uppercase text-[12px] sm:text-[16px]">Add Sip</span>
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