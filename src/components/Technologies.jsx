// import { RiReactjsLine } from "react-icons/ri";
// import { TbBrandNextjs } from "react-icons/tb";
// import { SiMongodb } from "react-icons/si";
// import { DiRedis } from "react-icons/di";
// import { FaNodeJs } from "react-icons/fa";
// import { BiLogoPostgresql } from "react-icons/bi";
// import { motion } from "framer-motion";

// const iconVarients = (duration) => ({
//     initial: { y: -10 },
//     animate: {
//         y: [10, -10],
//         transition: {
//             duration: duration,
//             ease: "linear",
//             repeat: Infinity,
//             repeatType: "reverse",
//         }
//     }
// })

// const Technologies = () => {
//     return <div className="border-b border-neutral-800 pb-24">
//         <motion.h2
//             whileInView={{ opacity: 1, y: 0 }}
//             initial={{ opacity: 0, y: -100 }}
//             transition={{ duration: 1.5 }}
//             className="my-20 text-center text-4xl">Technologies</motion.h2>
//         <motion.div
//             whileInView={{ opacity: 1, x: 0 }}
//             initial={{ opacity: 0, x: -100 }}
//             transition={{ duration: 1.5 }}
//             className="flex flex-wrap items-center justify-center gap-4">
//             <motion.div
//                 variants={iconVarients(2.5)}
//                 initial="initial"
//                 animate="animate"
//                 className="rounded-2xl border-4 border-neutral-800 p-4">
//                 <RiReactjsLine className="text-7xl text-cyan-400 " />
//             </motion.div>
//             <motion.div
//                 variants={iconVarients(3)}
//                 initial="initial"
//                 animate="animate"
//                 className="rounded-2xl border-4 border-neutral-800 p-4">
//                 <TbBrandNextjs className="text-7xl " />
//             </motion.div>
//             <motion.div
//                 variants={iconVarients(5)}
//                 initial="initial"
//                 animate="animate"
//                 className="rounded-2xl border-4 border-neutral-800 p-4">
//                 <SiMongodb className="text-7xl text-green-500 " />
//             </motion.div>
//             <motion.div
//                 variants={iconVarients(2)}
//                 initial="initial"
//                 animate="animate"
//                 className="rounded-2xl border-4 border-neutral-800 p-4">
//                 <DiRedis className="text-7xl text-red-700 " />
//             </motion.div>
//             <motion.div
//                 variants={iconVarients(6)}
//                 initial="initial"
//                 animate="animate"
//                 className="rounded-2xl border-4 border-neutral-800 p-4">
//                 <FaNodeJs className="text-7xl text-green-500 " />
//             </motion.div>
//             <motion.div
//                 variants={iconVarients(4)}
//                 initial="initial"
//                 animate="animate"
//                 className="rounded-2xl border-4 border-neutral-800 p-4">
//                 <BiLogoPostgresql className="text-7xl text-sky-700 " />
//             </motion.div>
//         </motion.div>
//     </div>

// };

// export default Technologies;

import { motion } from "framer-motion";
import { MdMenuBook } from "react-icons/md";
// import { IoIosJournal } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { FaKeyboard } from "react-icons/fa";
// import { SiLivejournal } from "react-icons/si";
// import { SiMongodb } from "react-icons/si";
// import { DiRedis } from "react-icons/di";
import { TfiWrite } from "react-icons/tfi";
// import { FaNodeJs } from "react-icons/fa";
import { FaPenNib } from "react-icons/fa";
// import { BiLogoPostgresql } from "react-icons/bi";
import { GiPaperPlane } from "react-icons/gi";
import { useState } from "react";

const iconVariants = (duration) => ({
    initial: { y: -10 },
    animate: {
        y: [10, -10],
        transition: {
            duration: duration,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse",
        },
    },
});

const Technologies = () => {
    const [hoveredIcon, setHoveredIcon] = useState(null);

    const icons = [
        {
            id: 1,
            icon: <MdMenuBook className="text-7xl text-cyan-400" />,
            explanation: "Expository writing focuses on explaining or informing the reader about a topic clearly and objectively. It relies on facts, evidence, and logical arguments rather than opinions or emotions. This style is widely used in textbooks, instructional content, white papers, and blog posts designed to educate readers about processes, concepts, or ideas.",
            duration: 2.5,
        },
        {
            id: 2,
            icon: <MdEdit className="text-7xl" />,
            explanation: "Narrative writing tells a story, often with a beginning, middle, and end, to engage and captivate the audience. It’s used in storytelling formats like novels, short stories, and personal blogs. This style is also effective in brand storytelling, where businesses share compelling narratives about their journey or products to connect emotionally with their audience.",
            duration: 3,
        },
        {
            id: 3,
            icon: <FaKeyboard className="text-7xl text-green-500" />,
            explanation: "Persuasive writing aims to convince the reader to adopt a particular viewpoint or take a specific action. It blends logical arguments, emotional appeals, and credible evidence. Found in advertisements, sales copy, opinion pieces, and political campaigns, this genre focuses on influencing decisions while building trust and urgency.",
            duration: 5,
        },
        {
            id: 4,
            icon: <TfiWrite className="text-7xl text-red-700" />,
            explanation: "Descriptive writing paints vivid pictures in the reader's mind using sensory details and rich imagery. It immerses readers into a scene, person, or experience, making it ideal for poetry, travel writing, or product descriptions. Businesses often use this style to evoke emotions and create memorable customer experiences through storytelling.",
            duration: 2,
        },
        {
            id: 5,
            icon: <FaPenNib className="text-7xl text-green-500" />,
            explanation: "Technical writing simplifies complex information, making it understandable for a specific audience. It’s often used in manuals, user guides, FAQs, and software documentation. Precision, clarity, and structure are vital, ensuring the content is practical and actionable. This style is crucial for industries like IT, engineering, and healthcare.",
            duration: 6,
        },
        {
            id: 6,
            icon: <GiPaperPlane className="text-7xl text-sky-700" />,
            explanation: "Creative writing prioritizes imagination and originality to engage readers. Whether it’s in the form of poetry, screenplays, or fiction, this genre breaks away from conventional structures to create artistic expression. In marketing, creative writing is key for crafting taglines, ad scripts, or social media posts that stand out and spark curiosity.",
            duration: 4,
        },
    ];

    return (
        <div className="border-b border-neutral-800 pb-24">
            <motion.h2
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: -100 }}
                transition={{ duration: 1.5 }}
                className="my-20 text-center text-4xl"
            >
                Genres
            </motion.h2>
            <motion.div
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -100 }}
                transition={{ duration: 1.5 }}
                className="flex flex-wrap items-center justify-center gap-6"
            >
                {icons.map((tech) => (
                    <motion.div
                        key={tech.id}
                        variants={iconVariants(tech.duration)}
                        initial="initial"
                        animate="animate"
                        onMouseEnter={() => setHoveredIcon(tech.id)}
                        onMouseLeave={() => setHoveredIcon(null)}
                        className="relative rounded-2xl  p-4"
                    >
                        {tech.icon}
                        {hoveredIcon === tech.id && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                className="absolute top-16 left-1/2 w-52 -translate-x-1/2 rounded-lg bg-neutral-900 p-4 text-center text-sm text-white shadow-lg lg:w-64 z-20"
                            >
                                
                                {tech.explanation}
                                
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </motion.div>
        </div>



    );
};

export default Technologies;
