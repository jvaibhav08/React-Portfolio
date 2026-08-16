import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PortableText } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";
import { FaInstagram, FaLinkedin, FaLink, FaWhatsapp } from "react-icons/fa";
import { FaArrowLeft, FaArrowRight, FaChevronDown, FaChevronUp, FaXTwitter } from "react-icons/fa6";
import { client } from "../sanity";
import Navbar from "../components/Navbar";
import Contact from "../components/Contact";
import WhatsappButton from "../components/WhatsappButton";
import Seo from "../components/Seo";
import NotFound from "./NotFound";

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "Not published";
const headingId = (block) => `section-${block._key || block.children?.map((child) => child.text).join("-")}`;
const tableCellText = (value) =>
  (value || [])
    .flatMap((block) => block.children || [])
    .map((child) => child.text || "")
    .join("");
const descriptionFor = (body, title) => {
  const text = (body || [])
    .filter((block) => block._type === "block")
    .flatMap((block) => block.children || [])
    .map((child) => child.text || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? `${text.slice(0, 157).trimEnd()}${text.length > 157 ? "..." : ""}` : `Read ${title} by Vishwas Jha.`;
};
const portableTextToSpeech = (body) =>
  (body || [])
    .flatMap((block) => {
      if (block._type === "block") return [(block.children || []).map((child) => child.text || "").join("")];
      if (block._type === "table") return (block.rows || []).flatMap((row) => (row.cells || []).map((cell) => tableCellText(cell.value)));
      return [];
    })
    .join(". ")
    .replace(/\s+/g, " ")
    .trim();

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loadState, setLoadState] = useState("loading");
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
      setLoadState("loading");
      setPost(null);
      try {
      const data = await client.fetch(
        `*[_type == "post" && slug.current == $slug && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**"))][0]{
          _id, _updatedAt, title, seoTitle, seoDescription, slug, publishedAt, modifiedAt, mainImage, body, comments,
          author->{name, bio, image, instagram, whatsapp, twitter, linkedin},
          categories[]->{_id, title}
        }`,
        { slug }
      );

      setPost(data);
      setComments((data?.comments || []).filter((comment) => comment.approved));
      if (!data) {
        setLoadState("notFound");
        return;
      }

      const categoryIds = data.categories?.map((category) => category._id) || [];
      const [related, previous, next] = await Promise.all([
        client.fetch(
          `*[_type == "post" && _id != $id && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**"))] | order(count(categories[@._ref in $categoryIds]) desc, publishedAt desc)[0...3]{
            _id, title, slug, publishedAt, mainImage, author->{name}, categories[]->{title}
          }`,
          { id: data._id, categoryIds }
        ),
        data.publishedAt
          ? client.fetch(
              `*[_type == "post" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**")) && publishedAt < $publishedAt] | order(publishedAt desc)[0]{title, slug}`,
              { publishedAt: data.publishedAt }
            )
          : null,
        data.publishedAt
          ? client.fetch(
              `*[_type == "post" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**")) && publishedAt > $publishedAt] | order(publishedAt asc)[0]{title, slug}`,
              { publishedAt: data.publishedAt }
            )
          : null,
      ]);
      setRelatedPosts(related || []);
      setAdjacentPosts({ previous, next });
      setLoadState("ready");
      } catch (error) {
        console.error("Error loading blog post:", error);
        setLoadState("error");
      }
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
      h1: ({ children, value }) => <h2 id={headingId(value)} className="mt-10 scroll-mt-24 text-2xl font-semibold leading-tight text-white sm:text-3xl">{children}</h2>,
      h2: ({ children, value }) => <h2 id={headingId(value)} className="mt-10 scroll-mt-24 text-2xl font-semibold leading-tight text-white sm:text-3xl">{children}</h2>,
      h3: ({ children, value }) => <h3 id={headingId(value)} className="mt-8 scroll-mt-24 text-xl font-semibold text-white sm:text-2xl">{children}</h3>,
      h4: ({ children, value }) => <h3 id={headingId(value)} className="mt-8 scroll-mt-24 text-xl font-semibold text-white sm:text-2xl">{children}</h3>,
      normal: ({ children }) => <p className="my-5 text-[17px] leading-8 text-gray-300 sm:text-lg">{children}</p>,
      blockquote: ({ children }) => <blockquote className="my-7 border-l-2 border-cyan-600 pl-5 text-[17px] italic leading-8 text-gray-300 sm:text-lg">{children}</blockquote>,
    },
    list: {
      bullet: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-6 text-[17px] leading-8 text-gray-300 sm:text-lg">{children}</ul>,
      number: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-6 text-[17px] leading-8 text-gray-300 sm:text-lg">{children}</ol>,
    },
    marks: {
      link: ({ children, value }) => <a href={value?.href} className="text-cyan-300 underline underline-offset-4 hover:text-cyan-200">{children}</a>,
      underline: ({ children }) => <u>{children}</u>,
      "strike-through": ({ children }) => <s>{children}</s>,
    },
    types: {
      table: ({ value }) => {
        const rows = value?.rows || [];
        const headerRows = Math.min(Math.max(value?.headerRows || 0, 0), rows.length);
        const renderRow = (row, rowIndex, isHeader) => (
          <tr key={row._key || rowIndex} className="border-b border-gray-700/80 last:border-0">
            {(row.cells || []).map((cell, cellIndex) => {
              const Cell = isHeader ? "th" : "td";
              return <Cell key={cell._key || cellIndex} scope={isHeader ? "col" : undefined} className={isHeader ? "bg-neutral-800 px-4 py-3 text-left font-semibold text-white" : "px-4 py-3 align-top text-gray-300"}>{tableCellText(cell.value)}</Cell>;
            })}
          </tr>
        );

        if (rows.length === 0) return null;

        return <div className="my-8 w-full overflow-x-auto rounded-lg border border-gray-700/80"><table className="w-full min-w-max border-collapse text-left text-[15px] leading-6 sm:text-base">{headerRows > 0 && <thead>{rows.slice(0, headerRows).map((row, index) => renderRow(row, index, true))}</thead>}<tbody>{rows.slice(headerRows).map((row, index) => renderRow(row, headerRows + index, false))}</tbody></table></div>;
      },
      code: ({ value }) => {
        if (!value?.code) return null;
        return <figure className="my-8 overflow-x-auto rounded-lg border border-gray-700/80 bg-neutral-950"><figcaption className="border-b border-gray-700/80 px-4 py-2 text-xs text-gray-400">{value.filename || value.language || "Code"}</figcaption><pre className="p-4 text-sm leading-6 text-gray-200"><code className={value.language ? `language-${value.language}` : undefined}>{value.code}</code></pre></figure>;
      },
      divider: ({ value }) => <hr className={value?.style === "emphasized" ? "my-10 border-0 border-t-2 border-cyan-700/80" : "my-10 border-0 border-t border-gray-700/80"} />,
      image: ({ value }) => {
        if (!value?.asset?._ref) return null;
        return <figure className="my-8"><img src={urlFor(value).width(1200).fit("max").auto("format").url()} alt={value.alt || post?.title || "Article image"} className="w-full rounded-lg object-cover" loading="lazy" />{(value.heading || value.caption) && <figcaption className="mt-2 text-sm text-gray-400">{value.heading || value.caption}</figcaption>}</figure>;
      },
    },
  };

  if (loadState === "loading") return <div className="p-10 text-center text-white">Loading...</div>;
  if (loadState === "notFound") return <NotFound title="Blog post not found" message="This blog post does not exist or may have been removed." />;
  if (loadState === "error") return <NotFound title="Unable to load this blog post" message="Please try again shortly or return to the blog." />;

  const categories = post.categories || [];
  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || descriptionFor(post.body, post.title);
  const modifiedTime = post.modifiedAt || post._updatedAt;
  const postPath = `/blog/${encodeURIComponent(post.slug.current)}`;
  const postImage = post.mainImage?.asset?._ref
    ? urlFor(post.mainImage).width(1200).height(630).fit("crop").auto("format").url()
    : undefined;
  const authorImage = post.author?.image?.asset?._ref
    ? urlFor(post.author.image).width(400).height(400).fit("crop").url()
    : undefined;
  const articleUrl = new URL(postPath, "https://vishwasjha.com").toString();
  const articleStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: seoDescription,
      image: postImage ? [postImage] : undefined,
      datePublished: post.publishedAt,
      dateModified: modifiedTime || post.publishedAt,
      mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
      url: articleUrl,
      author: {
        "@type": "Person",
        name: post.author?.name || "Vishwas Jha",
        image: authorImage,
      },
      publisher: { "@type": "Person", name: "Vishwas Jha", url: "https://vishwasjha.com/" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://vishwasjha.com/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://vishwasjha.com/blog" },
        { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
      ],
    },
  ];
  const shareLinks = [
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: <FaWhatsapp /> },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, icon: <FaLinkedin /> },
    { label: "Share on X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, icon: <FaXTwitter /> },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-neutral-200">
      <Seo
        title={`${seoTitle} | Vishwas Jha`}
        description={seoDescription}
        path={postPath}
        image={postImage}
        type="article"
        publishedTime={post.publishedAt}
        modifiedTime={modifiedTime}
        author={post.author?.name}
        structuredData={articleStructuredData}
      />
      <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-neutral-800" aria-hidden="true"><div className="h-full bg-cyan-500 transition-[width] duration-100" style={{ width: `${progress}%` }} /></div>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8"><Navbar /></div>
      <main className="mx-auto w-full max-w-[84rem] flex-grow px-5 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <header className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-[15px] text-gray-400 sm:text-base"><Link to="/blog" className="hover:text-cyan-300">Blog</Link><span>/</span>{categories.map((category) => <span key={category._id} className="rounded-full bg-cyan-950/60 px-2 py-0.5 text-cyan-200">{category.title}</span>)}</div>
          <h1 className="max-w-5xl text-3xl font-bold leading-tight text-white sm:text-5xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-gray-400 sm:text-base"><span>Written by: <span className="text-gray-200">{post.author?.name || "Unknown author"}</span></span><span>Published: {formatDate(post.publishedAt)}</span><span>{readingTime} min read</span></div>
          {post.mainImage?.asset?._ref && <img src={urlFor(post.mainImage).width(1440).height(720).fit("crop").auto("format").url()} alt={post.mainImage.alt || post.seoTitle || post.title || "Article image"} width="1440" height="720" className="mt-8 h-56 w-full rounded-xl object-cover sm:h-80 lg:h-[28rem]" fetchPriority="high" decoding="async" />}
        </header>

        <div className="mx-auto mt-9 grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,780px)_240px] lg:gap-12">
          <article className="min-w-0"><ListenToArticle title={post.title} body={post.body} /><div className="prose-invert max-w-none"><PortableText value={post.body} components={portableTextComponents} /></div></article>
          <aside className="hidden lg:block"><div className="sticky top-8 space-y-8 rounded-lg border border-gray-700/70 bg-neutral-800/70 p-5"><div>{headings.length > 0 && <><h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">In this article</h2><nav className="mt-3 space-y-2">{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} className={`block text-sm text-gray-400 hover:text-cyan-300 ${heading.level === "h3" ? "pl-3" : ""}`}>{heading.title}</a>)}</nav></>}</div><ShareLinks links={shareLinks} copied={copied} onCopy={copyLink} /></div></aside>
        </div>

        {headings.length > 0 && <section className="mx-auto mt-8 max-w-4xl rounded-lg border border-gray-700/70 bg-neutral-800/70 p-4 lg:hidden"><button type="button" onClick={() => setTocOpen((open) => !open)} className="flex w-full items-center justify-between text-left text-sm font-semibold text-white">In this article {tocOpen ? <FaChevronUp /> : <FaChevronDown />}</button>{tocOpen && <nav className="mt-4 space-y-2">{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} onClick={() => setTocOpen(false)} className={`block text-sm text-gray-400 hover:text-cyan-300 ${heading.level === "h3" ? "pl-3" : ""}`}>{heading.title}</a>)}</nav>}</section>}

        <section className="mx-auto mt-10 max-w-4xl lg:hidden"><ShareLinks links={shareLinks} copied={copied} onCopy={copyLink} /></section>
        {post.author && <section className="mx-auto mt-12 max-w-4xl border-y border-gray-700/70 py-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-start">{post.author.image?.asset?._ref && <img src={urlFor(post.author.image).width(160).height(160).fit("crop").url()} alt={`Portrait of ${post.author.name || "the author"}`} width="160" height="160" className="h-16 w-16 rounded-full object-cover" loading="lazy" decoding="async" />}<div><p className="text-sm text-gray-400">Written by</p><h2 className="text-xl font-semibold text-white">{post.author.name}</h2>{post.author.bio && <div className="mt-2 text-sm leading-6 text-gray-400"><PortableText value={post.author.bio} /></div>}<AuthorSocialLinks author={post.author} /></div></div></section>}

        {(adjacentPosts.previous || adjacentPosts.next) && <nav className="mx-auto mt-10 grid max-w-4xl gap-4 border-b border-gray-700/70 pb-10 sm:grid-cols-2">{adjacentPosts.previous ? <ArticleNav post={adjacentPosts.previous} direction="previous" /> : <div />}{adjacentPosts.next && <ArticleNav post={adjacentPosts.next} direction="next" />}</nav>}

        {relatedPosts.length > 0 && <section className="mx-auto mt-12 max-w-7xl"><h2 className="text-2xl font-semibold text-white">You May Also Like</h2><div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{relatedPosts.map((related) => <RelatedCard key={related._id} post={related} />)}</div></section>}

        <section className="mx-auto mt-14 max-w-4xl border-t border-gray-700/70 pt-8"><h2 className="text-2xl font-semibold text-white">Comments</h2>{comments.length === 0 ? <p className="mt-3 text-gray-400">No comments yet. Be the first to share your thoughts.</p> : <div className="mt-5 space-y-3">{comments.map((comment) => <div key={comment._key} className="rounded-lg border border-gray-700 bg-neutral-800 p-4"><p className="font-medium text-white">{comment.name}</p>{comment.createdAt && <p className="mt-1 text-xs text-gray-500">{formatDate(comment.createdAt)}</p>}<p className="mt-2 text-gray-300">{comment.message}</p></div>)}</div>}<div className="mt-7">{submitted ? <p className="text-green-400">Thanks! Your comment is awaiting approval.</p> : <form onSubmit={handleSubmit} className="flex flex-col gap-3"><input type="text" placeholder="Your name" value={commentName} onChange={(event) => setCommentName(event.target.value)} className="rounded border border-gray-700 bg-neutral-800 p-3 text-white" required /><textarea placeholder="Your comment" value={commentMessage} onChange={(event) => setCommentMessage(event.target.value)} className="min-h-28 rounded border border-gray-700 bg-neutral-800 p-3 text-white" required /><button type="submit" className="w-fit rounded bg-cyan-700 px-5 py-2.5 font-medium text-white transition hover:bg-cyan-600">Submit Comment</button></form>}</div></section>
      </main>
      {showBackToTop && <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-24 right-5 z-30 rounded-full border border-cyan-700 bg-neutral-800 p-3 text-cyan-200 shadow-lg transition hover:bg-neutral-700" aria-label="Back to top"><FaChevronUp /></button>}
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8"><Contact /></div>
      <WhatsappButton />
    </div>
  );
}

function ListenToArticle({ title, body }) {
  const [isSupported, setIsSupported] = useState(null);
  const [status, setStatus] = useState("idle");
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef(null);
  const utteranceStartRef = useRef(0);
  const speechPositionRef = useRef(0);
  const speechText = useMemo(() => [title, portableTextToSpeech(body)].filter(Boolean).join(". "), [title, body]);

  const stop = () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    utteranceStartRef.current = 0;
    speechPositionRef.current = 0;
    setStatus("idle");
  };

  useEffect(() => {
    const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setIsSupported(supported);
  }, []);

  useEffect(() => {
    setStatus("idle");
    utteranceStartRef.current = 0;
    speechPositionRef.current = 0;
    return () => {
      window.speechSynthesis?.cancel();
      utteranceRef.current = null;
    };
  }, [speechText]);

  const speakFrom = (startAt, nextRate, startPaused = false) => {
    if (!isSupported || !speechText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText.slice(startAt));
    utterance.rate = nextRate;
    utteranceStartRef.current = startAt;
    speechPositionRef.current = startAt;
    utterance.onboundary = (event) => {
      if (utteranceRef.current === utterance) speechPositionRef.current = utteranceStartRef.current + event.charIndex;
    };
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        utteranceStartRef.current = 0;
        speechPositionRef.current = 0;
        setStatus("idle");
      }
    };
    utterance.onerror = (event) => {
      if (utteranceRef.current === utterance && event.error !== "canceled" && event.error !== "interrupted") {
        utteranceRef.current = null;
        setStatus("error");
      }
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    if (startPaused) window.speechSynthesis.pause();
    setStatus(startPaused ? "paused" : "playing");
  };

  const play = () => {
    speakFrom(0, rate);
  };

  const changeRate = (nextRate) => {
    setRate(nextRate);
    if (status === "playing" || status === "paused") {
      speakFrom(speechPositionRef.current, nextRate, status === "paused");
    }
  };

  const pauseOrResume = () => {
    if (!isSupported) return;
    if (status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
    } else if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
    }
  };

  if (isSupported === false) return <p className="mb-6 rounded-lg border border-gray-700/70 bg-neutral-800/70 px-4 py-3 text-sm text-gray-400">Text-to-speech is unavailable in this browser.</p>;

  const isActive = status === "playing" || status === "paused";
  const statusText = status === "playing" ? "Listening" : status === "paused" ? "Paused" : status === "error" ? "Speech could not start. Please try again." : "Ready to listen";
  return <section className="mb-7 rounded-lg border border-gray-700/70 bg-neutral-800/70 p-4" aria-label="Listen to this article"><div className="flex flex-wrap items-center gap-3"><span className="font-medium text-white">Listen to this article</span><span className="text-sm text-cyan-300" role="status" aria-live="polite">{statusText}</span></div><div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" onClick={play} disabled={!isSupported || !speechText} className="rounded bg-cyan-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50">Play</button><button type="button" onClick={pauseOrResume} disabled={!isSupported || !isActive} className="rounded border border-gray-600 px-3 py-2 text-sm font-medium text-gray-200 transition hover:border-cyan-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">{status === "paused" ? "Resume" : "Pause"}</button><button type="button" onClick={stop} disabled={!isSupported || !isActive} className="rounded border border-gray-600 px-3 py-2 text-sm font-medium text-gray-200 transition hover:border-cyan-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">Stop</button><span className="ml-1 text-sm text-gray-400">Speed</span>{[1, 1.25, 1.5, 2].map((option) => <button key={option} type="button" onClick={() => changeRate(option)} aria-pressed={rate === option} className={`rounded px-2.5 py-2 text-sm transition ${rate === option ? "bg-cyan-800 text-white" : "border border-gray-600 text-gray-300 hover:border-cyan-600"}`}>{option}x</button>)}</div>{isActive && <p className="mt-3 text-xs text-gray-400">Speed changes apply immediately.</p>}</section>;
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
  return <Link to={`/blog/${post.slug.current}`} className="group overflow-hidden rounded-lg border border-gray-700/80 bg-neutral-800 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-700"><div className="h-44 overflow-hidden bg-neutral-900">{post.mainImage?.asset?._ref && <img src={urlFor(post.mainImage).width(700).height(400).fit("crop").auto("format").url()} alt={post.mainImage.alt || post.title || "Related blog post image"} width="700" height="400" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" decoding="async" />}</div><div className="p-4">{post.categories?.[0]?.title && <p className="text-xs text-cyan-300">{post.categories[0].title}</p>}<h3 className="mt-2 line-clamp-2 font-semibold text-white">{post.title}</h3><p className="mt-3 text-sm text-gray-400">Written by: {post.author?.name || "Unknown author"}</p><p className="text-sm text-gray-400">Published: {formatDate(post.publishedAt)}</p></div></Link>;
}
