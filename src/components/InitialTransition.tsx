import { motion } from "framer-motion";

const blackBox = {
    initial: {
      height: "100vh",
      bottom: 0,
    },
    animate: {
      height: 0,
      transition: {
        when: "afterChildren",
        duration: 1.5,
        ease: [0.87, 0, 0.13, 1],
      },
    },
};

const textContainer = {
    initial: {
      opacity: 1,
    },
    animate: {
      opacity: 0,
      transition: {
        duration: 0.25,
        when: "afterChildren",
      },
    },
};

const text = {
    initial: {
      y: 40,
    },
    animate: {
      y: 80,
      transition: {
        duration: 1.5,
        ease: [0.87, 0, 0.13, 1],
      },
    },
};
  
export const InitialTransition = () => {
    return (
        <div id="transition" className="fixed inset-0 flex items-center justify-center bottom-0 z-10">
            <motion.div
            className="absolute z-50 flex items-center justify-center w-full bg-black"
            initial="initial"
            animate="animate"
            variants={blackBox}
            onAnimationStart={() => document.body.classList.add("overflow-hidden")}
            onAnimationComplete={() => {
                document.body.classList.remove("overflow-hidden");
                document?.querySelector("#transition")?.remove();
            }}
            > 
                <motion.svg variants={textContainer} className="absolute z-50 flex custom-svg">
                    <pattern
                        id="pattern"
                        patternUnits="userSpaceOnUse"
                        width={1900}
                        height={1900}
                        className="text-white" >
                        <rect className="w-full h-full fill-current" />
                        <motion.rect
                            variants={text}
                            className="w-full h-full text-gray-600 fill-current"
                        />
                    </pattern>

                    <text
                        className="transition-title-main"
                        text-anchor="middle"
                        x="50%"
                        y="50%"
                        style={{ fill: "url(#pattern)" }}>
                        Algorithms Visualizer
                    </text>
                </motion.svg>    
            </motion.div>
        </div>
    );
};