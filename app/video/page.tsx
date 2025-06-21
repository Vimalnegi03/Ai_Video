"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ImageKitProvider, IKVideo } from "imagekitio-next";

interface IVideo {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  userId: string;
  controls?: boolean;
  transformation?: {
    height?: number;
    width?: number;
    quality?: number;
  };
}

function Video() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/video", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch videos");
        }

        console.log("Fetched videos:", data); // Log video data
        setVideos(data);
        setLoading(false);
      } catch (err) {
        setError(`Error fetching videos: ${err instanceof Error ? err.message : "Unknown error"}`);
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">All Videos</h1>
          {loading && <p className="text-center text-gray-500">Loading videos...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {videos.length === 0 && !loading && !error && (
            <p className="text-center text-gray-500">No videos found.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <IKVideo
                  path={video.videoUrl.replace(process.env.NEXT_PUBLIC_URL_ENDPOINT!, "")}
                  controls={video.controls ?? true}
                  poster={video.thumbnailUrl || "/fallback-thumbnail.jpg"}
                  className="w-full h-48 object-cover"
                  onError={(e) => console.error("IKVideo error:", e, "Thumbnail URL:", video.thumbnailUrl)}
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">{video.title}</h2>
                  <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                  {session?.user?.id === video.userId && (
                    <p className="text-xs text-blue-500 mt-2">Uploaded by you</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href="/upload"
              className="inline-block bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Upload New Video
            </a>
          </div>
        </div>
      </div>
    </ImageKitProvider>
  );
}

export default Video;