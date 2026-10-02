import { motion, MotionProps } from "framer-motion";

type AgentCursorProps = MotionProps & {
  color: string;
  name: string;
  className?: string;
};

export function AgentCursor({ color, name, className = "", ...motionProps }: AgentCursorProps) {
  return (
    <motion.div
      className={`pointer-events-none absolute z-50 flex flex-col items-start ${className}`}
      {...motionProps}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <path
          d="M5.65376 21.0051L4.72304 3.32757C4.66444 2.21422 5.86431 1.48705 6.83789 2.04618L21.3283 10.3687C22.285 10.9181 22.1866 12.3391 21.1548 12.7238L14.7335 15.1186C14.4751 15.2149 14.2625 15.4055 14.1378 15.6521L11.2339 21.3965C10.7454 22.3629 9.32454 22.4287 8.74971 21.5126L5.65376 21.0051Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <div
        className="ml-4 mt-1 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </motion.div>
  );
}