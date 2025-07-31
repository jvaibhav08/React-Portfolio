import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client } from "../sanity";
import Navbar from "../components/Navbar";
import Contact from "../components/Contact";
import WhatsappButton from "../components/WhatsappButton";

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "post"] | order(publishedAt desc)[0...6]{
          title,
          slug,
          publishedAt,
          mainImage { asset->{url} }
        }`
      )
      .then(setPosts);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 flex flex-col">
      {/* ✅ Navbar */}
      <div className="container mx-auto px-8 w-full"><Navbar /></div>
      

      {/* ✅ Blog Content */}
      <main className="flex-grow p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Latest Blog Posts</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post, i) => (
            <Link
              to={`/blog/${post.slug.current}`}
              key={i}
              className="block border border-gray-700 bg-neutral-800 p-3 rounded hover:bg-neutral-700 transition"
            >
              {post.mainImage?.asset?.url && (
                <img
                  src={post.mainImage.asset.url}
                  alt={post.title}
                  className="h-40 w-full object-cover rounded mb-2"
                />
              )}
              <h4 className="text-lg font-semibold text-white">{post.title}</h4>
              <p className="text-xs text-gray-400">
                📅 {new Date(post.publishedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </main>

      {/* ✅ Contact Section as Footer */}
      <div className="container mx-auto px-8 w-full"><Contact /></div>
      <WhatsappButton />
    </div>
  );
}
