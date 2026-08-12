import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PortableText } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";
import { FaInstagram, FaLinkedin, FaLink, FaWhatsapp } from "react-icons/fa";
import { FaArrowLeft, FaArrowRight, FaChevronDown, FaChevronUp, FaXTwitter } from "react-icons/fa6";
import { client } from "../sanity";
import Navbar from "../components/Navbar";
import Contact from "../components/Contact";
import WhatsappButton from "../components/WhatsappButton";

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "Not published";
const headingId = (block) => `section-${block._key || block.children?.map((child) => child.text).join("-")}`;

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [adjacentPosts, setAdjacentPosts] = useState({ previous: null, next: null });
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await client.fetch(
        `*[_type == "post" && slug.current == $slug][0]{
          _id, title, slug, publishedAt, mainImage, body, comments,
          author->{name, bio, image, instagram, whatsapp, twitter, linkedin},
          categories[]->{_id, title}
        }`,
        { slug }
      );

      setPost(data);
      setComments((data?.comments || []).filter((comment) => comment.approved));
      if (!data) return;

      const categoryIds = data.categories?.map((category) => category._id) || [];
      const [related, previous, next] = await Promise.all([
        client.fetch(
          `*[_type == "post" && _id != $id] | order(count(categories[@._ref in $categoryIds]) desc, publishedAt desc)[0...3]{
            _id, title, slug, publishedAt, mainImage, author->{name}, categories[]->{title}
          }`,
          { id: data._id, categoryIds }
        ),
        data.publishedAt
          ? client.fetch(
              `*[_type == "post" && publishedAt < $publishedAt] | order(publishedAt desc)[0]{title, slug}`,
              { publishedAt: data.publishedAt }
            )
          : null,
        data.publishedAt
          ? client.fetch(
              `*[_type == "post" && publishedAt > $publishedAt] | order(publishedAt asc)[0]{title, slug}`,
              { publishedAt: data.publishedAt }
            )
          : null,
      ]);
      setRelatedPosts(related || []);
      setAdjacentPosts({ previous, next });
    };

    fetchPost();
  }, [slug]);

  useEffect(() => {
    const updateScrollState = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0);
      setShowBackToTop(window.scrollY > 500);
    };
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  const headings = useMemo(
    () =>
      (post?.body || [])
        .filter((block) => block._type === "block" && ["h2", "h3"].includes(block.style))
        .map((block) => ({ id: headingId(block), title: block.children?.map((child) => child.text).join("") || "Section", level: block.style })),
    [post]
  );

  const readingTime = useMemo(() => {
    const text = (post?.body || [])
      .flatMap((block) => block.children || [])
      .map((child) => child.text || "")
      .join(" ");
    return Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 200));
  }, [post]);

  const shareUrl = typeof window === "undefined" ? "" : window.location.href;
  const shareText = post?.title || "";

  const copyLink = async () => {
    await navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!commentName || !commentMessage || !post?._id) return;
    try {
      const response = await fetch("https://dapper-entremet-89f17a.netlify.app/.netlify/functions/addComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: commentName, message: commentMessage, postId: post._id }),
      });
      if (response.ok) {
        setSubmitted(true);
        setCommentName("");
        setCommentMessage("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const portableTextComponents = {
    block: {
      h2: ({ children, value }) => <h2 id={headingId(value)} className="mt-10 scroll-mt-24 text-2xl font-semibold leading-tight text-white sm:text-3xl">{children}</h2>,
      h3: ({ children, value }) => <h3 id={headingId(value)} className="mt-8 scroll-mt-24 text-xl font-semibold text-white sm:text-2xl">{children}</h3>,
      normal: ({ children }) => <p className="my-5 text-base leading-8 text-gray-300 sm:text-lg">{children}</p>,
      blockquote: ({ children }) => <blockquote className="my-7 border-l-2 border-cyan-600 pl-5 text-lg italic leading-8 text-gray-300">{children}</blockquote>,
    },
    list: {
      bullet: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-6 text-gray-300">{children}</ul>,
      number: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-6 text-gray-300">{children}</ol>,
    },
    marks: {
      link: ({ children, value }) => <a href={value?.href} className="text-cyan-300 underline underline-offset-4 hover:text-cyan-200">{children}</a>,
    },
    types: {
      image: ({ value }) => {
        if (!value?.asset?._ref) return null;
        return <figure className="my-8"><img src={urlFor(value).width(1200).fit("max").auto("format").url()} alt={value.alt || "Article image"} className="w-full rounded-lg object-cover" loading="lazy" />{(value.heading || value.caption) && <figcaption className="mt-2 text-sm text-gray-400">{value.heading || value.caption}</figcaption>}</figure>;
      },
    },
  };

  if (!post) return <div className="p-10 text-center text-white">Loading...</div>;

  const categories = post.categories || [];
  const shareLinks = [
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: <FaWhatsapp /> },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, icon: <FaLinkedin /> },
    { label: "Share on X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, icon: <FaXTwitter /> },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-neutral-200">
      <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-neutral-800" aria-hidden="true"><div className="h-full bg-cyan-500 transition-[width] duration-100" style={{ width: `${progress}%` }} /></div>
      <div className="container mx-auto w-full px-8"><Navbar /></div>
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 pb-16 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-4xl">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-400"><Link to="/blog" className="hover:text-cyan-300">Blog</Link><span>/</span>{categories.map((category) => <span key={category._id} className="rounded-full bg-cyan-950/60 px-2 py-0.5 text-cyan-200">{category.title}</span>)}</div>
          <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400"><span>Written by: <span className="text-gray-200">{post.author?.name || "Unknown author"}</span></span><span>Published: {formatDate(post.publishedAt)}</span><span>{readingTime} min read</span></div>
          {post.mainImage?.asset?._ref && <img src={urlFor(post.mainImage).width(1440).height(720).fit("crop").auto("format").url()} alt={post.title} className="mt-8 h-56 w-full rounded-xl object-cover sm:h-80 lg:h-[28rem]" />}
        </header>

        <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,760px)_220px]">
          <article className="min-w-0"><div className="prose-invert max-w-none"><PortableText value={post.body} components={portableTextComponents} /></div></article>
          <aside className="hidden lg:block"><div className="sticky top-8 space-y-8 rounded-lg border border-gray-700/70 bg-neutral-800/70 p-5"><div>{headings.length > 0 && <><h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">In this article</h2><nav className="mt-3 space-y-2">{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} className={`block text-sm text-gray-400 hover:text-cyan-300 ${heading.level === "h3" ? "pl-3" : ""}`}>{heading.title}</a>)}</nav></>}</div><ShareLinks links={shareLinks} copied={copied} onCopy={copyLink} /></div></aside>
        </div>

        {headings.length > 0 && <section className="mx-auto mt-8 max-w-4xl rounded-lg border border-gray-700/70 bg-neutral-800/70 p-4 lg:hidden"><button type="button" onClick={() => setTocOpen((open) => !open)} className="flex w-full items-center justify-between text-left text-sm font-semibold text-white">In this article {tocOpen ? <FaChevronUp /> : <FaChevronDown />}</button>{tocOpen && <nav className="mt-4 space-y-2">{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} onClick={() => setTocOpen(false)} className={`block text-sm text-gray-400 hover:text-cyan-300 ${heading.level === "h3" ? "pl-3" : ""}`}>{heading.title}</a>)}</nav>}</section>}

        <section className="mx-auto mt-10 max-w-4xl lg:hidden"><ShareLinks links={shareLinks} copied={copied} onCopy={copyLink} /></section>
        {post.author && <section className="mx-auto mt-12 max-w-4xl border-y border-gray-700/70 py-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-start">{post.author.image?.asset?._ref && <img src={urlFor(post.author.image).width(160).height(160).fit("crop").url()} alt={post.author.name} className="h-16 w-16 rounded-full object-cover" />}<div><p className="text-sm text-gray-400">Written by</p><h2 className="text-xl font-semibold text-white">{post.author.name}</h2>{post.author.bio && <div className="mt-2 text-sm leading-6 text-gray-400"><PortableText value={post.author.bio} /></div>}<AuthorSocialLinks author={post.author} /></div></div></section>}

        {(adjacentPosts.previous || adjacentPosts.next) && <nav className="mx-auto mt-10 grid max-w-4xl gap-4 border-b border-gray-700/70 pb-10 sm:grid-cols-2">{adjacentPosts.previous ? <ArticleNav post={adjacentPosts.previous} direction="previous" /> : <div />}{adjacentPosts.next && <ArticleNav post={adjacentPosts.next} direction="next" />}</nav>}

        {relatedPosts.length > 0 && <section className="mx-auto mt-12 max-w-7xl"><h2 className="text-2xl font-semibold text-white">You May Also Like</h2><div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{relatedPosts.map((related) => <RelatedCard key={related._id} post={related} />)}</div></section>}

        <section className="mx-auto mt-14 max-w-4xl border-t border-gray-700/70 pt-8"><h2 className="text-2xl font-semibold text-white">Comments</h2>{comments.length === 0 ? <p className="mt-3 text-gray-400">No comments yet. Be the first to share your thoughts.</p> : <div className="mt-5 space-y-3">{comments.map((comment) => <div key={comment._key} className="rounded-lg border border-gray-700 bg-neutral-800 p-4"><p className="font-medium text-white">{comment.name}</p>{comment.createdAt && <p className="mt-1 text-xs text-gray-500">{formatDate(comment.createdAt)}</p>}<p className="mt-2 text-gray-300">{comment.message}</p></div>)}</div>}<div className="mt-7">{submitted ? <p className="text-green-400">Thanks! Your comment is awaiting approval.</p> : <form onSubmit={handleSubmit} className="flex flex-col gap-3"><input type="text" placeholder="Your name" value={commentName} onChange={(event) => setCommentName(event.target.value)} className="rounded border border-gray-700 bg-neutral-800 p-3 text-white" required /><textarea placeholder="Your comment" value={commentMessage} onChange={(event) => setCommentMessage(event.target.value)} className="min-h-28 rounded border border-gray-700 bg-neutral-800 p-3 text-white" required /><button type="submit" className="w-fit rounded bg-cyan-700 px-5 py-2.5 font-medium text-white transition hover:bg-cyan-600">Submit Comment</button></form>}</div></section>
      </main>
      {showBackToTop && <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-24 right-5 z-30 rounded-full border border-cyan-700 bg-neutral-800 p-3 text-cyan-200 shadow-lg transition hover:bg-neutral-700" aria-label="Back to top"><FaChevronUp /></button>}
      <div className="container mx-auto w-full px-8"><Contact /></div>
      <WhatsappButton />
    </div>
  );
}

function ShareLinks({ links, copied, onCopy }) {
  return <div><h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Share article</h2><div className="mt-3 flex gap-3">{links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="text-lg text-gray-400 transition hover:text-cyan-300">{link.icon}</a>)}<button type="button" onClick={onCopy} aria-label="Copy article link" className="text-lg text-gray-400 transition hover:text-cyan-300"><FaLink /></button></div>{copied && <p className="mt-2 text-xs text-cyan-300">Link copied</p>}</div>;
}

function AuthorSocialLinks({ author }) {
  const socialLinks = [{ url: author.instagram, icon: <FaInstagram />, label: "Instagram" }, { url: author.linkedin, icon: <FaLinkedin />, label: "LinkedIn" }, { url: author.twitter, icon: <FaXTwitter />, label: "X" }, { url: author.whatsapp && `https://wa.me/${author.whatsapp}`, icon: <FaWhatsapp />, label: "WhatsApp" }].filter((link) => link.url);
  return socialLinks.length > 0 && <div className="mt-3 flex gap-3">{socialLinks.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="text-lg text-gray-400 transition hover:text-cyan-300">{link.icon}</a>)}</div>;
}

function ArticleNav({ post, direction }) {
  const isNext = direction === "next";
  return <Link to={`/blog/${post.slug.current}`} className={`rounded-lg border border-gray-700/70 bg-neutral-800/70 p-4 transition hover:border-cyan-700 ${isNext ? "text-right sm:col-start-2" : ""}`}><span className="flex items-center gap-2 text-sm text-cyan-300">{isNext ? "Next Article" : "Previous Article"}{isNext ? <FaArrowRight /> : <FaArrowLeft />}</span><span className="mt-2 block font-medium text-white">{post.title}</span></Link>;
}

function RelatedCard({ post }) {
  return <Link to={`/blog/${post.slug.current}`} className="group overflow-hidden rounded-lg border border-gray-700/80 bg-neutral-800 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-700"><div className="h-44 overflow-hidden bg-neutral-900">{post.mainImage?.asset?._ref && <img src={urlFor(post.mainImage).width(700).height(400).fit("crop").auto("format").url()} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />}</div><div className="p-4">{post.categories?.[0]?.title && <p className="text-xs text-cyan-300">{post.categories[0].title}</p>}<h3 className="mt-2 line-clamp-2 font-semibold text-white">{post.title}</h3><p className="mt-3 text-sm text-gray-400">Written by: {post.author?.name || "Unknown author"}</p><p className="text-sm text-gray-400">Published: {formatDate(post.publishedAt)}</p></div></Link>;
}
