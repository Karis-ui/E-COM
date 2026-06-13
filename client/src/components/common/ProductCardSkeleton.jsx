import React from "react";
import { motion } from "framer-motion";

const ProductCardSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="group relative bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[24px] border border-white/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
        >
            <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full animate-glow" />
            </div>
            <div className="p-4">
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-2 animate-glow" />
                <div className="h-4 bg-gray-800 rounded w-1/2 mb-4 animate-glow" />
                <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-800 rounded w-20 animate-glow" />
                    <div className="h-8 bg-gray-800 rounded w-24 animate-glow" />
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCardSkeleton;