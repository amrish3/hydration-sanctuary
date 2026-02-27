import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Moon, Send, Sparkles, X } from 'lucide-react';
import ReefLife from './components/ReefLife';
import Bottle from './components/Bottle';
import SplashScreen from './components/SplashScreen';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// Direct high-quality splash sound
const SPLASH_URL = "https://actions.google.com/sounds/v1/water/slosh.ogg";

export default function App() {
    const [isIntro, setIsIntro] = useState(true);
    const [waterLevel, setWaterLevel] = useState(0);
    const [showBottlePopup, setShowBottlePopup] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("");
    const [moonClickCount, setMoonClickCount] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false); // Hidden Partner Mode
    const [customNote, setCustomNote] = useState("");
    const audioRef = useRef(null);

    const roomID = "our-special-place";
    const dailyGoal = 3000;

    useEffect(() => {
        audioRef.current = new Audio(SPLASH_URL);
        audioRef.current.load();
    }, []);

    // --- STEP B: MOON PHASE LOGIC ---
    const getMoonIcon = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // Simple lunar cycle math (approx 29.5 days)
        const lp = 2551443;
        const now = new Date(year, month-1, day, 20, 35, 0);
        const new_moon = new Date(1970, 0, 7, 20, 35, 0);
        const phase = ((now.getTime() - new_moon.getTime())/1000) % lp;
        const age = Math.floor(phase /(24*3600));

        if (age < 2) return "🌑"; // New
        if (age < 7) return "🌒"; // Waxing Crescent
        if (age < 10) return "🌓"; // First Quarter
        if (age < 15) return "🌕"; // Full (Cancer's Favorite)
        if (age < 20) return "🌖"; // Waning Gibbous
        if (age < 25) return "🌗"; // Last Quarter
        return "🌘"; // Waning Crescent
    };

    // 1. DATABASE SYNC
    useEffect(() => {
        const docRef = doc(db, "sanctuaries", roomID);

        const unsub = onSnapshot(docRef, (snapshot) => {
            const today = new Date().toISOString().split("T")[0];

            if (!snapshot.exists()) {
                setDoc(docRef, {
                    waterLevel: 0,
                    hasUnreadMessage: false,
                    lastMessage: "Welcome to your sanctuary. ✨",
                    lastResetDate: today
                });
                return;
            }

            const data = snapshot.data();

            if (data.lastResetDate !== today) {
                updateDoc(docRef, {
                    waterLevel: 0,
                    lastResetDate: today
                });
            } else {
                setWaterLevel(data.waterLevel || 0);
                setHasNewMessage(data.hasUnreadMessage || false);
                setCurrentMessage(data.lastMessage || "");
            }
        });
        return () => unsub();
    }, []);

    if (isIntro) {
        return <SplashScreen onFinish={() => {
            setIsIntro(false);
            // Browser policy: Audio must be "resumed" or played after the user gesture
            if (audioRef.current) {
                audioRef.current.play().then(() => {
                    audioRef.current.pause(); // Just "unlocking" it
                }).catch(e => console.log("Audio unlock wait"));
            }
        }} />;
    }

    // 2. INSTANT ADD WATER (Optimistic Update)
    const addWater = async () => {
        // Play splash
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio on pause"));
        }

        const newLevel = Math.min(waterLevel + 10, 100);
        setWaterLevel(newLevel); // Instant growth
        await updateDoc(doc(db, "sanctuaries", roomID), { waterLevel: newLevel });
    };

    // --- STEP A: SEND CUSTOM MESSAGE ---
    const sendCustomCareDrop = async () => {
        if (!customNote.trim()) return;
        await updateDoc(doc(db, "sanctuaries", roomID), {
            lastMessage: customNote,
            hasUnreadMessage: true
        });
        setCustomNote("");
        setIsAdmin(false); // Close panel after sending
    };

    // 4. OPEN BOTTLE (Clears bottle from DB)
    const handleOpenBottle = async () => {
        setShowBottlePopup(true);
        // Tell the database the message is read so the bottle disappears for everyone
        await updateDoc(doc(db, "sanctuaries", roomID), {
            hasUnreadMessage: false
        });
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden bg-[#0a0f1e]">
            {/* PASSING WATER LEVEL TO REEF */}
            <ReefLife waterLevel={waterLevel} />

            <motion.div
                onClick={() => {
                setMoonClickCount(prev => prev + 1);
                if (moonClickCount >= 3) { setIsAdmin(true); setMoonClickCount(0); }
                }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-12 text-6xl cursor-pointer select-none z-20"
            >
                <span className="blur-[1px] opacity-60">{getMoonIcon()}</span>
            </motion.div>

            {/* 3. Main Sanctuary Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass w-full max-w-sm rounded-[50px] p-10 relative z-10 shadow-2xl border border-white/10"
            >
                <div className="relative w-40 h-72 mx-auto border-[6px] border-white/10 rounded-b-[80px] rounded-t-2xl overflow-hidden bg-white/5 shadow-inner">
                    <motion.div
                        animate={{ height: `${waterLevel}%` }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600/70 to-cyan-400/50 backdrop-blur-sm"
                    >
                        <AnimatePresence>
                            {hasNewMessage && (
                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: [0, -10, 0], opacity: 1 }}
                                    transition={{ y: { repeat: Infinity, duration: 3 } }}
                                    onClick={handleOpenBottle}
                                    className="absolute top-5 left-1/2 -translate-x-1/2 text-4xl"
                                >
                                    🍾
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                <div className="mt-8 text-center text-white">
                    <p className="text-4xl font-extralight tracking-tighter">
                        {Math.round((waterLevel / 100) * dailyGoal)}
                        <span className="text-sm text-blue-300/60 ml-2 uppercase tracking-[0.2em]">ml</span>
                    </p>
                </div>

                <button
                    onClick={addWater}
                    className="mt-10 w-full py-5 rounded-3xl bg-blue-500/10 border border-white/10 flex items-center justify-center gap-3 active:scale-95 text-white transition-all hover:bg-blue-500/15"
                >
                    <Droplets className="text-cyan-300" />
                    <span className="font-light tracking-widest uppercase text-sm">Add Sip</span>
                </button>
            </motion.div>


            {/* 4. Popups */}
            <Bottle
                message={currentMessage}
                isVisible={showBottlePopup}
                onClose={() => setShowBottlePopup(false)}
            />

            {/* ADMIN PANEL (Step A) */}
            <AnimatePresence>
                {isAdmin && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 10, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-0 w-full max-w-md p-6 z-50"
                    >
                        <div className="glass p-6 rounded-t-[40px] border-t border-white/20 shadow-2xl">
                            <div className="flex justify-between items-center mb-4 text-white">
                                <h3 className="text-blue-200 text-xs font-bold uppercase tracking-[0.2em]">Partner Mode</h3>
                                <button onClick={() => setIsAdmin(false)}><X size={20}/></button>
                            </div>
                            <textarea
                                value={customNote}
                                onChange={(e) => setCustomNote(e.target.value)}
                                placeholder="Write a secret note for her..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none"
                                rows="3"
                            />
                            <button onClick={sendCustomCareDrop} className="w-full mt-4 py-4 bg-blue-500 rounded-2xl flex items-center justify-center gap-2 text-white font-bold"
                            >
                                <Send size={18}/> Send to Sanctuary
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}