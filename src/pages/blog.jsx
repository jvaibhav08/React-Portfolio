import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client } from "../sanity";
import imageUrlBuilder from "@sanity/image-url";
import Navbar from "../components/Navbar";
import Contact from "../components/Contact";
import WhatsappButton from "../components/WhatsappButton";

const imageBuilder = imageUrlBuilder(client);
const cardImageUrl = (image) =>
  imageBuilder.image(image).width(800).height(450).fit("crop").auto("format").url();

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    client
      .fetch(
        `*[_type == "post"] | order(publishedAt desc){
          _id,
          title,
          slug,
          publishedAt,
          mainImage,
          author->{name},
          categories[]->{_id, title}
        }`
      )
      .then(setPosts);
  }, []);

  const categories = Array.from(
    new Map(
      posts
        .flatMap((post) => post.categories || [])
        .filter((category) => category?._id && category?.title)
        .map((category) => [category._id, category])
    ).values()
  );

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((post) =>
          post.categories?.some((category) => category._id === selectedCategory)
        );

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-neutral-200">
      <div className="container mx-auto w-full px-8"><Navbar /></div>
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-white sm:mb-8 sm:text-4xl">
          Latest Blog Posts
        </h1>
        <div
          className="mb-6 flex gap-2 overflow-x-auto pb-2 sm:mb-8"
          aria-label="Filter blog posts by category"
        >
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              selectedCategory === "all"
                ? "border-cyan-500 bg-cyan-800 text-cyan-100"
                : "border-gray-700 bg-neutral-800 text-gray-300 hover:border-cyan-700 hover:text-cyan-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => setSelectedCategory(category._id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category._id
                  ? "border-cyan-500 bg-cyan-800 text-cyan-100"
                  : "border-gray-700 bg-neutral-800 text-gray-300 hover:border-cyan-700 hover:text-cyan-200"
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {filteredPosts.map((post) => (
            <Link
              to={`/blog/${post.slug.current}`}
              key={post._id}
              className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-gray-700/80 bg-neutral-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-cyan-700/70 hover:shadow-lg hover:shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <div className="relative h-44 overflow-hidden bg-neutral-900 sm:h-48 lg:h-52">
                {post.mainImage?.asset?._ref && (
                  <img
                    src={cardImageUrl(post.mainImage)}
                    alt={post.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/45 via-transparent to-cyan-950/10" />
              </div>
              <div className="flex flex-grow flex-col p-4 sm:p-5">
                <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-white transition-colors group-hover:text-cyan-200">
                  {post.title}
                </h2>
                <div className="mt-4 border-t border-gray-700/70 pt-3 text-sm leading-6 text-gray-400">
                  <p>
                    <span className="text-gray-500">Written by: </span>
                    {post.author?.name || "Unknown author"}
                  </p>
                  <p>
                    <span className="text-gray-500">Published: </span>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Not published"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <div className="container mx-auto w-full px-8"><Contact /></div>
      <WhatsappButton />
    </div>
  );
}
