import { motion } from 'framer-motion';

export default function SplashScreen({ onFinish }) {
    return (
        <motion.div
            key="splash-screen-container"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#0a0f1e] flex flex-col items-center justify-center text-center p-8"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <h2 className="text-blue-100 font-extralight text-3xl sm:text-4xl md:text-5xl tracking-[0.2em] sm:tracking-[0.4em] mb-4">
                    SANCTUARY
                </h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="text-blue-400 italic font-light tracking-widest text-xs sm:text-sm max-w-[250px] sm:max-w-none leading-relaxed"
                >
                    A quiet space for my favorite Cancerian
                </motion.p>
            </motion.div>

            <div className="mt-16 w-32 sm:w-48 h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                onClick={onFinish}
                className="mt-16 px-10 py-3 border border-blue-400/20 rounded-full text-blue-200/40 text-[10px] sm:text-xs tracking-[0.3em] hover:bg-white/5 active:scale-95 transition-all"
            >
                ENTER THE CALM
            </motion.button>
        </motion.div>
    );
}