// import { useMemo } from 'react';
// import { motion } from 'framer-motion';
//
// const Fish = ({ delay, y, speed, direction }) => (
//     <motion.div
//         initial={{ x: direction === 'ltr' ? '-10vw' : '110vw', opacity: 0 }}
//         animate={{
//             x: direction === 'ltr' ? '110vw' : '-10vw',
//             opacity: [0, 1, 1, 0]
//         }}
//         transition={{
//             duration: speed,
//             repeat: Infinity,
//             delay: delay,
//             ease: "linear"
//         }}
//         style={{ top: y }}
//         className={`absolute text-3xl opacity-40`}
//     >
//         {/* direction logic: ltr = 🐟, rtl = 🐠 */}
//         <span className={direction === 'rtl' ? '' : 'scale-x-[-1] inline-block'}>
//       {direction === 'rtl' ? '🐠' : '🐟'}
//     </span>
//     </motion.div>
// );
//
// export default function ReefLife({ waterLevel }) {
//     // Generate random bubble properties once
//     const bubbles = useMemo(() => [...Array(15)].map((_, i) => ({
//         id: i,
//         size: Math.random() * (12 - 4) + 4, // Size between 4px and 12px
//         left: Math.random() * 100,
//         delay: Math.random() * 20, // Very staggered start
//         duration: 10 + Math.random() * 10,
//     })), []); // ← empty array means "compute only once"
//
//     return (
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//             {/* Slow, graceful fish */}
//             {waterLevel > 10 && <Fish y="25%" speed={45} delay={0} direction="ltr" />}
//             {waterLevel > 40 && <Fish y="70%" speed={35} delay={10} direction="rtl" />}
//
//             {/* Randomized Bubbles */}
//             {bubbles.map((b) => (
//                 <motion.div
//                     key={b.id}
//                     className="absolute bg-white/20 rounded-full blur-[1px]"
//                     style={{
//                         width: b.size,
//                         height: b.size,
//                         left: `${b.left}%`,
//                         bottom: '-20px'
//                     }}
//                     animate={{ y: '-110vh', x: [0, 20, -20, 0] }}
//                     transition={{
//                         duration: b.duration,
//                         repeat: Infinity,
//                         delay: b.delay,
//                         ease: "easeInOut"
//                     }}
//                 />
//             ))}
//         </div>
//     );
// }

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

export default function ReefLife({ waterLevel }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#0f172a]">
            {/* Dynamic Bubbles (Always there) */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white/10 rounded-full"
                    style={{ width: Math.random() * 8, height: Math.random() * 8, left: `${Math.random() * 100}%`, bottom: -20 }}
                    animate={{ y: '-110vh' }}
                    transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 10 }}
                />
            ))}

            {/* STAGE 1 GROWTH: Simple Seaweed (Appears > 20%) */}
            {waterLevel > 20 && (
                <>
                    <Plant x="10%" delay={0.2} height="15vh" />
                    <Plant x="85%" delay={0.5} height="10vh" />
                </>
            )}

            {/* STAGE 2 GROWTH: More Plants (Appears > 50%) */}
            {waterLevel > 50 && (
                <>
                    <Plant x="20%" delay={0.8} height="25vh" />
                    <Plant x="75%" delay={1.1} height="20vh" />
                    <span className="absolute bottom-4 left-[15%] text-2xl opacity-40">🐚</span>
                </>
            )}

            {/* STAGE 3 GROWTH: The Full Sanctuary (Appears > 80%) */}
            {waterLevel > 80 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-0 w-full h-32 bg-blue-500/5 blur-3xl"
                />
            )}

            {/* Graceful Fish */}
            <motion.div
                animate={{ x: ['-10vw', '110vw'], y: [100, 120, 100] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/3 text-3xl opacity-20"
            >
                🐠
            </motion.div>
        </div>
    );
}