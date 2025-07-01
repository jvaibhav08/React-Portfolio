import logo from "../assets/VishJha-Logo.png";
import { FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

const Navbar = () => {
    return <nav className="mb-20 flex items-center justify-between py-6">
        <div className="flex flex-shrink-0 items-center">
            <img className="mx-2 w-10" src={logo} alt="logo" />
        </div>
        <div className="m-8 flex items-center justify-center gap-4 text-2xl">
            <a href="https://www.linkedin.com/in/vishwas-jha-a13472149/" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
            </a>
            <a href="https://x.com/vishwas88183228" target="_blank" rel="noopener noreferrer">
                <FaSquareXTwitter />
            </a>
            <a href="https://www.instagram.com/the_vishwasjha/" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
            </a>
        </div>

    </nav>
};

export default Navbar;
