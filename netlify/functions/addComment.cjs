const { createClient } = require('@sanity/client');
const { v4: uuidv4 } = require('uuid'); // Unique key generator

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-03-01',
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const { name, message, postId } = JSON.parse(event.body);

    if (!name || !message || !postId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const newComment = {
      _key: uuidv4(), // 🔑 Required by Sanity
      name,
      message,
      createdAt: new Date().toISOString(),
    };

    const result = await client
      .patch(postId)
      .setIfMissing({ comments: [] })
      .insert("after", "comments[-1]", [newComment])
      .commit();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Comment added successfully!", result }),
    };
  } catch (error) {
    console.error("🔥 Server Error in addComment.cjs:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error submitting comment",
        error: error.message || "Unknown error",
      }),
    };
  }
};
