import { motion } from 'framer-motion';

export default function SplashScreen({ onFinish }) {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 3, duration: 1 }}
            onAnimationComplete={onFinish}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-center p-6"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5 }}
            >
                <h2 className="text-blue-100 font-extralight text-3xl tracking-[0.3em] mb-4">
                    SANCTUARY
                </h2>
                <p className="text-blue-400/50 italic font-light tracking-widest">
                    Created for my favorite Cancerian
                </p>
            </motion.div>

            <motion.div
                className="mt-12 w-48 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                initial={{ width: 0 }}
                animate={{ width: 200 }}
                transition={{ duration: 2, delay: 0.5 }}
            />
        </motion.div>
    );
}