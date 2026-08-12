import { HERO_CONTENT } from "../constants";
import profilePic from "../assets/vishwas-portfolio-hero-1.jpg";
import { motion } from "framer-motion";

const container = (delay) => ({
    hidden: { x: -100, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.5, delay: delay }
    }
})

const Hero = () => {
    return <div className="border-b border-neutral-900 pb-10 lg:pb-14">
        <div className="flex flex-wrap">
            <div className="w-full lg:w-1/2">
                <div className="flex flex-col items-center lg:items-start">
                    <motion.h1
                        variants={container(0)}
                        initial="hidden"
                        animate="visible"
                        className="pb-7 text-5xl font-thin tracking-tight sm:text-6xl lg:mt-10 lg:pb-10 lg:text-7xl xl:text-8xl">
                        Vishwas Jha
                    </motion.h1>
                    <motion.span
                        variants={container(0.5)}
                        initial="hidden"
                        animate="visible"
                        className="bg-gradient-to-r from-pink-300 via-slate-500 to-purple-500 bg-clip-text text-2xl tracking-tight text-transparent sm:text-3xl">
                        Content Writer
                    </motion.span>
                    <motion.p
                        variants={container(1)}
                        initial="hidden"
                        animate="visible"
                        className="my-3 max-w-xl py-3 text-[17px] font-light leading-7 tracking-normal text-neutral-300 sm:text-lg sm:leading-8">
                        {HERO_CONTENT}
                    </motion.p>
                </div>
            </div>
            <div className="w-full pt-6 lg:w-1/2 lg:p-8">
                <div className="flex justify-center">
                    <motion.img initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 1.2 }}
                        src={profilePic} alt="Vishwas Jha" />
                </div>
            </div>
        </div>
    </div>
};

export default Hero;
