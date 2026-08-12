import { Link } from "react-router-dom";
import Contact from "../components/Contact";
import Navbar from "../components/Navbar";
import Seo from "../components/Seo";
import WhatsappButton from "../components/WhatsappButton";

export default function NotFound({ title = "Page not found", message = "The page you requested does not exist or may have moved." }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-neutral-200">
      <Seo title={`${title} | Vishwas Jha`} description={message} path="/404" robots="noindex" />
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8"><Navbar /></div>
      <main className="mx-auto flex w-full max-w-4xl flex-grow flex-col items-center px-5 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-xl text-[17px] leading-7 text-gray-400 sm:text-lg">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/" className="rounded bg-cyan-700 px-5 py-2.5 font-medium text-white transition hover:bg-cyan-600">Go home</Link>
          <Link to="/blog" className="rounded border border-gray-700 bg-neutral-800 px-5 py-2.5 font-medium text-gray-200 transition hover:border-cyan-700 hover:text-cyan-200">Browse the blog</Link>
        </div>
      </main>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8"><Contact /></div>
      <WhatsappButton />
    </div>
  );
}
