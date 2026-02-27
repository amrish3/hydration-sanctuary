import { motion } from 'framer-motion';

const Plant = ({ x, delay, height }) => (
    <motion.div
        initial={{ scaleY: 0, originY: 1 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 2, delay }}
        style={{ left: x, height }}
        className="absolute bottom-0 w-2 bg-gradient-to-t from-teal-900 to-emerald-500/40 rounded-t-full blur-[1px]"
    />
);

const Fish = ({ delay, y, speed, direction }) => (
    <motion.div
        initial={{ x: direction === 'ltr' ? '-10vw' : '110vw', opacity: 0 }}
        animate={{
            x: direction === 'ltr' ? '110vw' : '-10vw',
            opacity: [0, 1, 1, 0]
        }}
        transition={{
            duration: speed,
            repeat: Infinity,
            delay: delay,
            ease: "linear"
        }}
        style={{ top: y }}
        className={`absolute text-3xl opacity-40`}
    >
        {/* direction logic: ltr = 🐟, rtl = 🐠 */}
        <span className={direction === 'rtl' ? '' : 'scale-x-[-1] inline-block'}>
      {direction === 'rtl' ? '🐠' : '🐟'}
    </span>
    </motion.div>
);

export default function ReefLife({ waterLevel }) {
    console.log("Current Water Level in Reef:", waterLevel); // Debugging

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#0f172a]">
            {/* Slow, graceful fish */}
            {waterLevel > 10 && <Fish y="25%" speed={45} delay={0} direction="ltr" />}
            {waterLevel > 40 && <Fish y="70%" speed={35} delay={10} direction="rtl" />}

            {/* STAGE 1 GROWTH: Simple Seaweed (Appears > 10%) */}
            {waterLevel > 10 && (
                <motion.div initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-0 left-[10%] w-4 h-32 bg-gradient-to-t from-green-900 to-green-400 rounded-t-full blur-[1px]"
                />
                // <>
                //     <Plant x="10%" delay={0.2} height="15vh" />
                //     <Plant x="85%" delay={0.5} height="10vh" />
                // </>
            )}

            {/* STAGE 2 GROWTH: More Plants (Appears > 40%) */}
            {waterLevel > 40 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-0 left-[80%] w-6 h-48 bg-gradient-to-t from-teal-900 to-emerald-400 rounded-t-full blur-[1px]"
                />
                // <>
                //     <Plant x="20%" delay={0.8} height="25vh" />
                //     <Plant x="75%" delay={1.1} height="20vh" />
                //     <span className="absolute bottom-4 left-[15%] text-2xl opacity-40">🐚</span>
                // </>
            )}

            {/* STAGE 3 GROWTH: The Full Sanctuary (Appears > 70%) */}
            {waterLevel > 70 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-4 left-[45%] text-4xl opacity-60"
                >
                    🪸
                </motion.div>
            )}

            {/* Bubbles */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white/20 rounded-full"
                    style={{ width: 4, height: 4, left: `${i * 15}%`, bottom: -20 }}
                    animate={{ y: '-110vh' }}
                    transition={{ duration: 10, repeat: Infinity, delay: i * 2 }}
                />
            ))}
        </div>
    );
}