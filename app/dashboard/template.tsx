"use client";
import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} // Начинаем с прозрачности и чуть ниже
      animate={{ opacity: 1, y: 0 }}    // Проявляемся и встаем на место
      transition={{ duration: 0.4, ease: "easeOut" }} // Длительность 0.4 сек
    >
      {children}
    </motion.div>
  );
}