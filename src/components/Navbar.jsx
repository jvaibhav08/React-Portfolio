import { useState, useRef, useEffect } from "react";
import logo from "../assets/VishJha-Logo.png";
import { FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // close when clicking outside the mobile panel
  useEffect(() => {
    function onDocClick(e) {
      const el = panelRef.current;
      if (!el || el.contains(e.target)) return;
      setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // lock body scroll when mobile menu is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : original || "";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <nav className="mb-20 flex items-center justify-between py-6">
      {/* ✅ Logo */}
      <div className="flex flex-shrink-0 items-center">
        <img className="mx-2 w-10" src={logo} alt="logo" />
      </div>

      {/* ✅ Menu Links (desktop/tablet large and up) */}
      <div className="hidden lg:flex items-center gap-8 text-lg font-medium">
        <Link to="/" className="hover:text-cyan-400 transition">
          Home
        </Link>
        <Link to="/blog" className="hover:text-cyan-400 transition">
          Blog
        </Link>
        <a href="/#contact" className="hover:text-cyan-400 transition">
          Contact
        </a>
      </div>

      {/* ✅ Social Icons (desktop/tablet large and up) */}
      <div className="hidden lg:flex m-8 items-center justify-center gap-4 text-2xl">
        <a
          href="https://www.linkedin.com/in/vishwas-jha-a13472149/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook />
        </a>
        <a
          href="https://x.com/vishwas88183228"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaSquareXTwitter />
        </a>
        <a
          href="https://www.instagram.com/the_vishwasjha/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram />
        </a>
      </div>

      {/* ☰ Hamburger / X Toggle (mobile & iPad) */}
      <button
        className="lg:hidden relative z-50 inline-flex items-center justify-center p-2 rounded border border-gray-500/40 bg-neutral-900"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* ▼ Mobile / iPad slide-down panel */}
      <div
        id="mobile-nav"
        className={`absolute left-0 right-0 top-[88px] z-40 lg:hidden overflow-hidden border-t border-gray-700/50 bg-neutral-900/95 backdrop-blur transition-[max-height,opacity] duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div ref={panelRef} className="px-6 py-4">
          {/* Re-using your exact links & classes */}
          <div className="flex flex-col gap-4 text-lg font-medium">
            <Link
              to="/"
              className="hover:text-cyan-400 transition"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/blog"
              className="hover:text-cyan-400 transition"
              onClick={() => setOpen(false)}
            >
              Blog
            </Link>
            <a
              href="/#contact"
              className="hover:text-cyan-400 transition"
              onClick={() => setOpen(false)}
            >
              Contact
            </a>
          </div>

          <div className="mt-6 flex items-center justify-start gap-4 text-2xl">
            <a
              href="https://www.linkedin.com/in/vishwas-jha-a13472149/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <FaLinkedin />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <FaFacebook />
            </a>
            <a
              href="https://x.com/vishwas88183228"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <FaSquareXTwitter />
            </a>
            <a
              href="https://www.instagram.com/the_vishwasjha/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
