import About from "./components/About";
import Additonal from "./components/Additonal";
import Contact from "./components/Contact";
import Experience from "./components/Experience";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Projects from "./components/Projects";
import Technologies from "./components/Technologies";
import WhatsappButton from "./components/WhatsappButton"; // ✅ New import

import Seo from "./components/Seo";
import profilePic from "./assets/vishwas-portfolio-hero-1.jpg";

const homepageStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vishwas Jha",
    url: "https://vishwasjha.com/",
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Vishwas Jha",
    url: "https://vishwasjha.com/",
    jobTitle: "Content Writer",
    sameAs: [
      "https://www.linkedin.com/in/vishwas-jha-a13472149/",
      "https://x.com/vishwas88183228",
      "https://www.instagram.com/the_vishwasjha/",
    ],
  },
];

const App = () => {
  return (
    <div className="overflow-x-hidden text-neutral-300 antialiased selection:bg-cyan-300 selection:text-cyan-900">
      <Seo
        title="Vishwas Jha | Content Writer & SEO Content Specialist"
        description="Portfolio of Vishwas Jha, a content writer creating SEO-focused web content, blogs, technical writing, and brand storytelling."
        path="/"
        image={profilePic}
        structuredData={homepageStructuredData}
      />
      <div className="fixed top-0 -z-10 h-full w-full">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <Navbar />
        <Hero />
        <About />
        <Technologies />
        <Experience />
        <Projects />
        <Additonal />
        <div id="contact">
        <Contact />
        </div>
      </div>

      {/* ✅ Floating WhatsApp Icon */}
      <WhatsappButton />
    </div>
  );
};

export default App;
