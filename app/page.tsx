"use client";
import React, { useState, useEffect } from "react"; // Removed useRef
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ImageKitProvider, IKVideo } from "imagekitio-next";
import Image from "next/image";

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

export default function Home() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

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

        console.log("Fetched videos:", data);
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 font-[family-name:var(--font-geist-sans)]">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="App Logo" width={40} height={40} />
              <h1 className="text-2xl font-bold text-gray-800">VideoHub</h1>
            </div>
            <nav className="flex gap-4">
              {status === "authenticated" ? (
                <>
                  <a
                    href="/upload"
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 text-sm sm:text-base"
                  >
                    Upload Video
                  </a>
                  <button
                    onClick={() => router.push("/api/auth/signout")}
                    className="text-gray-600 hover:text-red-600 transition duration-300 text-sm sm:text-base"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <a
                  href="/api/auth/signin"
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 text-sm sm:text-base"
                >
                  Sign In
                </a>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Welcome to VideoHub
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              Discover and share amazing videos with the world!
            </p>
            {status !== "authenticated" && (
              <a
                href="/api/auth/signin"
                className="mt-4 inline-block bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition duration-300"
              >
                Get Started
              </a>
            )}
          </div>

          {loading && (
            <p className="text-center text-gray-500 text-lg">Loading videos...</p>
          )}
          {error && <p className="text-center text-red-500 text-lg">{error}</p>}
          {videos.length === 0 && !loading && !error && (
            <p className="text-center text-gray-500 text-lg">
              No videos yet. Be the first to upload!
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                <IKVideo
                  path={video.videoUrl.replace(process.env.NEXT_PUBLIC_URL_ENDPOINT!, "")}
                  controls={video.controls ?? true}
                  poster={video.thumbnailUrl || "/fallback-thumbnail.jpg"}
                  className="w-full h-48 object-cover"
                  onError={(e) => console.error("IKVideo error:", e, "Thumbnail URL:", video.thumbnailUrl)}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {video.description}
                  </p>
                  {session?.user?.id === video.userId && (
                    <p className="text-xs text-blue-500 mt-2">Uploaded by you</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </ImageKitProvider>
  );
}