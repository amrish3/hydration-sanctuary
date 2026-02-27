import { useMemo } from 'react';
import { motion } from 'framer-motion';

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
    // Generate random bubble properties once
    const bubbles = useMemo(() => [...Array(15)].map((_, i) => ({
        id: i,
        size: Math.random() * (12 - 4) + 4, // Size between 4px and 12px
        left: Math.random() * 100,
        delay: Math.random() * 20, // Very staggered start
        duration: 10 + Math.random() * 10,
    })), []); // ← empty array means "compute only once"

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Slow, graceful fish */}
            {waterLevel > 10 && <Fish y="25%" speed={45} delay={0} direction="ltr" />}
            {waterLevel > 40 && <Fish y="70%" speed={35} delay={10} direction="rtl" />}

            {/* Randomized Bubbles */}
            {bubbles.map((b) => (
                <motion.div
                    key={b.id}
                    className="absolute bg-white/20 rounded-full blur-[1px]"
                    style={{
                        width: b.size,
                        height: b.size,
                        left: `${b.left}%`,
                        bottom: '-20px'
                    }}
                    animate={{ y: '-110vh', x: [0, 20, -20, 0] }}
                    transition={{
                        duration: b.duration,
                        repeat: Infinity,
                        delay: b.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
}