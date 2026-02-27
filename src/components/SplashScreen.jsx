import { motion } from 'framer-motion';

export default function SplashScreen({ onFinish }) {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0f172a] flex flex-col items-center justify-center text-center p-6"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                <h2 className="text-blue-100 font-extralight text-4xl tracking-[0.4em] mb-4">
                    SANCTUARY
                </h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="text-blue-400 italic font-light tracking-widest text-sm"
                >
                    A quiet space for my favorite Cancerian
                </motion.p>
            </motion.div>

            {/* Loading bar */}
            <div className="mt-12 w-48 h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Button to Enter (Optional: or let it finish automatically) */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                onClick={onFinish}
                className="mt-12 px-8 py-2 border border-blue-400/30 rounded-full text-blue-200/50 text-xs tracking-[0.2em] hover:bg-white/5 transition-colors"
            >
                ENTER THE CALM
            </motion.button>
        </motion.div>
    );
}