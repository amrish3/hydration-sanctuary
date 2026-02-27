import { motion, AnimatePresence } from 'framer-motion';
import { MailOpen } from 'lucide-react';

export default function Bottle({ message, isVisible, onClose }) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.5 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-blue-900/60 backdrop-blur-md"
                >
                    <div className="glass p-8 rounded-[30px] max-w-sm w-full text-center relative shadow-2xl">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MailOpen className="text-blue-200" size={40} />
                        </div>
                        <h3 className="text-xl font-medium mb-4 text-blue-100 italic">"A note from your favorite person"</h3>
                        <p className="text-blue-50/80 leading-relaxed mb-8">
                            {message}
                        </p>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/20"
                        >
                            Keep it safe 🐚
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}