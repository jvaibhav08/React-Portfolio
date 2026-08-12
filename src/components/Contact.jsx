import { CONTACT } from "../constants";
import { motion } from "framer-motion";

const Contact = () => {
    return (
        <div className="border-b border-neutral-900 py-10 pb-14 sm:py-14 sm:pb-16">
            <motion.h2
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: -100 }}
                transition={{ duration: 0.5 }}
                className="mb-8 text-center text-3xl sm:mb-10 sm:text-4xl">Get in Touch</motion.h2>
            <div className="text-center text-[17px] leading-7 tracking-normal text-neutral-300">
                <motion.p
                    whileInView={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: -100 }}
                    transition={{ duration: 1 }}
                    className="my-3">{CONTACT.address}</motion.p>
                <motion.p
                    whileInView={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: 100 }}
                    transition={{ duration: 1 }}
                    className="my-3">{CONTACT.phoneNo}</motion.p>
                <a href="" className="border-b">{CONTACT.email}</a>
            </div>
        </div>
    );
};

export default Contact;
