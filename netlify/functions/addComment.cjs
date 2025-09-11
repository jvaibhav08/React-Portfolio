const { createClient } = require('@sanity/client');
const { v4: uuidv4 } = require('uuid');

console.log("🌍 ENV:", {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,  // Ensure the name matches Netlify
});

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-03-01',
});

// Define allowed origins
const allowedOrigins = [
  "https://vishwasjha.com",
  "https://dapper-entremet-89f17a.netlify.app"
];

exports.handler = async (event) => {
  const origin = event.headers.origin;
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "https://vishwasjha.com",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight (OPTIONS) request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const { name, message, postId } = JSON.parse(event.body);

    if (!name || !message || !postId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const newComment = {
      _key: uuidv4(),
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
      headers: corsHeaders,
      body: JSON.stringify({ message: "Comment added successfully!", result }),
    };
  } catch (error) {
    console.error("🔥 Server Error in addComment.cjs:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Error submitting comment",
        error: error.message || "Unknown error",
      }),
    };
  }
};
