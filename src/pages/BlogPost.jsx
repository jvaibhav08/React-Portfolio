import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { client } from "../sanity";
import { PortableText } from "@portabletext/react";
import Navbar from "../components/Navbar";
import Contact from "../components/Contact";
import { FaInstagram, FaWhatsapp, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import WhatsappButton from "../components/WhatsappButton";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await client.fetch(
        `*[_type == "post" && slug.current == $slug][0]{
          _id,
          title,
          slug,
          publishedAt,
          mainImage { asset->{url} },
          body,
          author->{
            name,
            bio,
            image {asset->{url}},
            instagram,
            whatsapp,
            twitter,
            linkedin
          },
          categories[]->{_id, title},
          comments
        }`,
        { slug }
      );

      setPost(data);

      // ✅ Filter approved comments only
      if (data?.comments?.length) {
        const approved = data.comments.filter(c => c.approved);
        setComments(approved);
      }

      if (data?.categories?.length) {
        const categoryIds = data.categories.map((cat) => cat._id);
        const related = await client.fetch(
          `*[_type == "post" && slug.current != $slug && count(categories[@._ref in $categoryIds]) > 0][0...3]{
            title,
            slug,
            publishedAt,
            mainImage { asset->{url} }
          }`,
          { slug, categoryIds }
        );
        setRelatedPosts(related);
      }
    };

    fetchPost();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentName || !commentMessage || !post?._id) return;

    const payload = {
      name: commentName,
      message: commentMessage,
      postId: post._id,
    };

    console.log("🚀 Sending comment payload:", payload);

    try {
      const res = await fetch("/.netlify/functions/addComment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setCommentName("");
        setCommentMessage("");
      } else {
        console.error("Server error:", data);
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  if (!post) return <div className="p-10 text-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 flex flex-col">
      <div className="container mx-auto px-8 w-full">
        <Navbar />
      </div>

      <main className="flex-grow p-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-white">{post.title}</h1>
        <p className="text-sm text-gray-400 mb-4">
          📅 {new Date(post.publishedAt).toLocaleDateString()}
        </p>

        {post.author && (
          <div className="mb-4 flex items-start gap-3">
            {post.author.image?.asset?.url && (
              <img
                src={post.author.image.asset.url}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-sm font-semibold">{post.author.name}</p>
              {post.author.bio && (
                <div className="text-xs text-gray-400">
                  <PortableText value={post.author.bio} />
                </div>
              )}

              <div className="flex gap-3 mt-2">
                {post.author.instagram && (
                  <a
                    href={post.author.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:text-pink-300"
                  >
                    <FaInstagram size={20} />
                  </a>
                )}
                {post.author.whatsapp && (
                  <a
                    href={`https://wa.me/${post.author.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300"
                  >
                    <FaWhatsapp size={20} />
                  </a>
                )}
                {post.author.twitter && (
                  <a
                    href={post.author.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-200 hover:text-gray-400"
                  >
                    <FaXTwitter size={20} />
                  </a>
                )}
                {post.author.linkedin && (
                  <a
                    href={post.author.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-400"
                  >
                    <FaLinkedin size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {post.categories?.length > 0 && (
          <div className="mb-6">
            {post.categories.map((cat, i) => (
              <span
                key={i}
                className="inline-block bg-cyan-800 text-cyan-100 text-xs px-2 py-1 rounded-full mr-2"
              >
                {cat.title}
              </span>
            ))}
          </div>
        )}

        {post.mainImage?.asset?.url && (
          <img
            src={post.mainImage.asset.url}
            alt={post.title}
            className="w-full h-64 object-cover rounded mb-6"
          />
        )}

        <div className="prose prose-invert max-w-none">
          <PortableText value={post.body} />
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-12 border-t border-gray-600 pt-6">
            <h3 className="text-2xl font-bold mb-4 text-white">Related Posts</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedPosts.map((related, i) => (
                <Link
                  to={`/blog/${related.slug.current}`}
                  key={i}
                  className="block border border-gray-700 bg-neutral-800 p-3 rounded hover:bg-neutral-700 transition"
                >
                  {related.mainImage?.asset?.url && (
                    <img
                      src={related.mainImage.asset.url}
                      alt={related.title}
                      className="h-40 w-full object-cover rounded mb-2"
                    />
                  )}
                  <h4 className="text-lg font-semibold">{related.title}</h4>
                  <p className="text-xs text-gray-400">
                    📅 {new Date(related.publishedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 border-t border-gray-600 pt-6">
          <h3 className="text-2xl font-bold mb-4">Comments</h3>
          {comments.length === 0 && (
            <p className="text-gray-400">No comments yet. Be the first!</p>
          )}
          {comments.map((c, i) => (
            <div key={i} className="mb-4 p-3 border border-gray-700 rounded bg-neutral-800">
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-gray-300">{c.message}</p>
            </div>
          ))}

          <div className="mt-6">
            <h4 className="text-xl font-semibold mb-2">Add a Comment</h4>
            {submitted ? (
              <p className="text-green-400">
                Thanks! Your comment is awaiting approval.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="p-2 rounded bg-neutral-800 border border-gray-700 text-white"
                />
                <textarea
                  placeholder="Your comment"
                  value={commentMessage}
                  onChange={(e) => setCommentMessage(e.target.value)}
                  className="p-2 rounded bg-neutral-800 border border-gray-700 text-white"
                />
                <button
                  type="submit"
                  className="bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded"
                >
                  Submit Comment
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <div className="container mx-auto px-8 w-full">
        <Contact />
      </div>
      <WhatsappButton />
    </div>
  );
}
