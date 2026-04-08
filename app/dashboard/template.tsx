export default function Template({ children }: { children: React.ReactNode }) {
  // Убрали framer-motion, теперь это обычный div, который не ломает Next.js
  return <div>{children}</div>;
}