import aboutImg from "../assets/unsplash.jpg";
import { ABOUT_TEXT } from "../constants";
import { motion } from "framer-motion";

const About = () => {
    return <div className="border-b border-neutral-900 py-10 sm:py-14">
        <h2 className="mb-10 text-center text-3xl sm:mb-12 sm:text-4xl">About <span className="text-neutral-500">Me</span>
        </h2>
        <div className="flex flex-wrap">
            <motion.div
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="w-full lg:w-1/2 lg:pr-8">
                <div className="flex items-center justify-center">
                    <img className="rounded-2xl" src={aboutImg} alt="Writing workspace" width="1920" height="1442" loading="lazy" decoding="async" />
                </div>
            </motion.div>
            <motion.div
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5 }}
                className="w-full pt-5 lg:w-1/2 lg:pt-0">
                <div className="flex justify-center lg:justify-start">
                    <p className="max-w-xl text-[17px] leading-7 text-neutral-300 sm:text-lg sm:leading-8">{ABOUT_TEXT}</p>
                </div>
            </motion.div>
        </div>
    </div>

};

export default About;
