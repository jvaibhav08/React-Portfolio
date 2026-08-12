import { EXPERIENCES } from "../constants";
import { motion } from "framer-motion";

const Experience = () => {
    return <div className="border-b border-neutral-900 py-10 sm:py-14">
        <motion.h2
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center text-3xl sm:mb-12 sm:text-4xl">Experience</motion.h2>
        <div>
            {EXPERIENCES.map((experience, index) => (
                <div key={index} className="mb-10 flex flex-wrap lg:justify-center">
                    <motion.div
                        whileInView={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: -100 }}
                        transition={{ duration: 1 }}
                        className="w-full lg:w-1/4">
                        <p className="mb-2 text-base text-neutral-400">{experience.year}</p>
                    </motion.div>
                    <motion.div
                        whileInView={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: 100 }}
                        transition={{ duration: 1 }}
                        className="w-full max-w-xl lg:w-3/4">
                        <h3 className="mb-2 text-lg font-semibold">
                            {experience.role} - <span className="text-base text-purple-100">{experience.company}</span>
                        </h3>
                        <p className="mb-4 text-[17px] leading-7 text-neutral-400">{experience.description}</p>
                        {experience.technologies.map((tech, index) => (
                            <span key={index} className="mr-2 mt-2 inline-block rounded bg-neutral-900 px-2 py-1 text-sm font-medium text-purple-200">{tech}</span>
                        ))}
                    </motion.div>
                </div>
            ))}
        </div>
    </div>

};

export default Experience;
