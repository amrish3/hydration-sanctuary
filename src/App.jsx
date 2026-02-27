import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Moon, Send, Sparkles, x } from 'lucide-react';
import ReefLife from './components/ReefLife';
import Bottle from './components/Bottle';
import SplashScreen from './components/SplashScreen';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const SPLASH_SOUND = "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3";

export default function App() {
    const [waterLevel, setWaterLevel] = useState(0);
    const [showBottlePopup, setShowBottlePopup] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("");
    const [isAdmin, setIsAdmin] = useState(false); // Hidden Partner Mode
    const [customNote, setCustomNote] = useState("");
    const [moonClickCount, setMoonClickCount] = useState(0);
    const audioRef = useRef(new Audio(SPLASH_SOUND));
    const [isIntro, setIsIntro] = useState(true);

    if (isIntro) {
        return <SplashScreen onFinish={() => setIsIntro ( false )}/>;
    }

    const roomID = "our-special-place";
    const dailyGoal = 3000;

    const playSplash = () => {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
    };

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
        const unsub = onSnapshot(doc(db, "sanctuaries", roomID), async (snapshot) => {
            const today = new Date().toLocaleDateString(); // e.g., "10/24/2023"

            if (snapshot.exists()) {
                const data = snapshot.data();

                // CHECK FOR RESET: If the date in DB isn't today, reset the level to 0
                if (data.lastResetDate !== today) {
                    await updateDoc(doc(db, "sanctuaries", roomID), {
                        waterLevel: 0,
                        lastResetDate: today
                    });
                } else {
                    setWaterLevel(data.waterLevel || 0);
                    setHasNewMessage(data.hasUnreadMessage || false);
                    setCurrentMessage(data.lastMessage || "");
                }
            } else {
                // Initialize with today's date
                await setDoc(doc(db, "sanctuaries", roomID), {
                    waterLevel: 0,
                    hasUnreadMessage: false,
                    lastMessage: "Welcome to your sanctuary. ✨",
                    lastResetDate: today
                });
            }
        });
        return () => unsub();
    }, []);

    // 2. INSTANT ADD WATER (Optimistic Update)
    const addWater = async () => {
        playSplash();

        // Calculate a new level locally first so it's instant
        const newLevel = Math.min(waterLevel + 12.5, 100);
        setWaterLevel(newLevel);

        // Update database in the background
        try {
            await updateDoc(doc(db, "sanctuaries", roomID), {
                waterLevel: newLevel
            });
        } catch (e) {
            console.error("Sync failed:", e);
        }
    };

    // // 3. REAL MESSAGE DROP (Updates the Database)
    // const sendCareDrop = async () => {
    //     const messages = [
    //         "Just a reminder that you are loved. Drink some water! ❤️",
    //         "I'm so proud of you today, my star. ✨",
    //         "Take a deep breath. You're doing amazing. 🌊",
    //         "Sending you a refreshing hug through this water. 🐚"
    //     ];
    //     const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    //
    //     await updateDoc(doc(db, "sanctuaries", roomID), {
    //         lastMessage: randomMsg,
    //         hasUnreadMessage: true
    //     });
    // };

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
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden">
            <ReefLife waterLevel={waterLevel} />

            {/*<motion.div*/}
            {/*    animate={{ y: [0, -15, 0] }}*/}
            {/*    transition={{ duration: 8, repeat: Infinity }}*/}
            {/*    className="absolute top-12 text-blue-100/20"*/}
            {/*>*/}
            {/*    <Moon size={80} fill="currentColor" className="blur-[2px]" />*/}
            {/*</motion.div>*/}

            {/* Secret Moon Toggle: Click 3 times to open Admin Panel */}
            <motion.div
                onClick={() => {
                    setMoonClickCount(prev => prev + 1);
                    if (moonClickCount >= 2) { setIsAdmin(true); setMoonClickCount(0); }
                }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-12 text-6xl cursor-pointer select-none"
            >
                <span className="blur-[1px] opacity-60">{getMoonIcon()}</span>
            </motion.div>

            {/*<motion.div className="glass w-full max-w-sm rounded-[50px] p-10 relative z-10 shadow-[0_0_50px_rgba(30,58,138,0.3)]">*/}
            {/*    <div className="relative w-40 h-72 mx-auto border-[6px] border-white/10 rounded-b-[80px] rounded-t-2xl overflow-hidden shadow-2xl bg-white/5">*/}

            {/*        <motion.div*/}
            {/*            animate={{ height: `${waterLevel}%` }}*/}
            {/*            transition={{ type: 'spring', damping: 20, stiffness: 40 }}*/}
            {/*            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600/60 to-cyan-400/50 backdrop-blur-sm"*/}
            {/*        >*/}
            {/*            <AnimatePresence>*/}
            {/*                {hasNewMessage && (*/}
            {/*                    <motion.button*/}
            {/*                        initial={{ y: 20, opacity: 0 }}*/}
            {/*                        animate={{ y: [0, -10, 0], opacity: 1, rotate: [0, 5, -5, 0] }}*/}
            {/*                        transition={{*/}
            {/*                            y: { repeat: Infinity, duration: 3, ease: "easeInOut" },*/}
            {/*                            rotate: { repeat: Infinity, duration: 2 }*/}
            {/*                        }}*/}
            {/*                        onClick={handleOpenBottle}*/}
            {/*                        className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl cursor-pointer hover:scale-110 transition-transform"*/}
            {/*                    >*/}
            {/*                        🍾*/}
            {/*                    </motion.button>*/}
            {/*                )}*/}
            {/*            </AnimatePresence>*/}

            {/*            <div className="absolute top-0 left-0 w-full h-2 bg-white/30 blur-[2px]" />*/}
            {/*        </motion.div>*/}
            {/*    </div>*/}

            {/*    <div className="mt-8 text-center">*/}
            {/*        <p className="text-4xl font-extralight tracking-tighter">*/}
            {/*            {Math.round((waterLevel / 100) * dailyGoal)}*/}
            {/*            <span className="text-sm text-blue-300/60 ml-2 uppercase tracking-[0.2em]">ml</span>*/}
            {/*        </p>*/}
            {/*    </div>*/}

            {/*    <div className="flex flex-col gap-3 mt-10">*/}
            {/*        <button*/}
            {/*            onClick={addWater}*/}
            {/*            className="w-full py-5 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-3 transition-all active: scale-95 text-white"*/}
            {/*        >*/}
            {/*            <Droplets className="text-cyan-300" />*/}
            {/*            <span className="font-light tracking-widest uppercase text-sm">Add Sip</span>*/}
            {/*        </button>*/}

            {/*        <button*/}
            {/*            onClick={sendCareDrop}*/}
            {/*            className="text-[10px] text-blue-400/30 uppercase mt-4 tracking-[0.3em] hover:text-blue-400/80 transition-colors"*/}
            {/*        >*/}
            {/*            [ Send Care Drop ]*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*</motion.div>*/}

            {/* MAIN CARD */}
            <motion.div className="glass w-full max-w-sm rounded-[50px] p-10 relative z-10 shadow-[0_0_50px_rgba(30,58,138,0.3)]">
                <div className="relative w-40 h-72 mx-auto border-[6px] border-white/10 rounded-b-[80px] rounded-t-2xl overflow-hidden bg-white/5">
                    <motion.div
                        animate={{ height: `${waterLevel}%` }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600/60 to-cyan-400/50 backdrop-blur-sm"
                    >
                        <AnimatePresence>
                            {hasNewMessage && (
                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: [0, -10, 0], opacity: 1 }}
                                    transition={{ y: { repeat: Infinity, duration: 3 } }}
                                    onClick={() => { setShowBottlePopup(true); updateDoc(doc(db, "sanctuaries", roomID), { hasUnreadMessage: false }); }}
                                    className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl"
                                >
                                    🍾
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-4xl font-extralight tracking-tighter text-white">
                        {Math.round((waterLevel / 100) * dailyGoal)}
                        <span className="text-sm text-blue-300/60 ml-2 uppercase tracking-[0.2em]">ml</span>
                    </p>
                </div>

                <button
                    onClick={addWater}
                    className="mt-10 w-full py-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 active:scale-95 text-white"
                >
                    <Droplets className="text-cyan-300" />
                    <span className="font-light tracking-widest uppercase text-sm">Add Sip</span>
                </button>
            </motion.div>

            {/* ADMIN PANEL (Step A) */}
            <AnimatePresence>
                {isAdmin && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-0 w-full max-w-md p-6 z-50"
                    >
                        <div className="glass p-6 rounded-t-[40px] border-t border-white/20 shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-blue-200 text-sm font-bold uppercase tracking-widest">Partner Mode</h3>
                                <button onClick={() => setIsAdmin(false)}><X size={20}/></button>
                            </div>
                            <textarea
                                value={customNote}
                                onChange={(e) => setCustomNote(e.target.value)}
                                placeholder="Write a secret note for her..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-400"
                                rows="3"
                            />
                            <button
                                onClick={sendCustomCareDrop}
                                className="w-full mt-4 py-4 bg-blue-500 rounded-2xl flex items-center justify-center gap-2 text-white font-bold"
                            >
                                <Send size={18}/> Send to Sanctuary
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Bottle
                message={currentMessage}
                isVisible={showBottlePopup}
                onClose={() => setShowBottlePopup(false)}
            />
        </div>
    );
}