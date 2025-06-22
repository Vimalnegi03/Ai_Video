"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import FileUpload from "./FileUpload";
import { ImageKitProvider } from "imagekitio-next";

interface ImageKitUploadResponse {
  url: string;
  fileId: string;
  name: string;
  thumbnailUrl?: string;
}

function VideoUploadForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setError("You must be logged in to upload a video.");
      return;
    }
    if (!title || !description) {
      setError("Please fill in all fields.");
      return;
    }
  };

  const handleUploadSuccess = async (res: ImageKitUploadResponse) => {
    setUploading(true);
    try {
      console.log("ImageKit response:", res); // Log full response
      const thumbnailUrl = res.thumbnailUrl || `${res.url}/ik-thumbnail.jpg`;
      console.log("Generated thumbnailUrl:", thumbnailUrl); // Log thumbnailUrl

      // Validate thumbnail URL
      const thumbnailResponse = await fetch(thumbnailUrl, { method: "HEAD" });
      if (!thumbnailResponse.ok) {
        throw new Error(`Thumbnail URL is invalid: ${thumbnailUrl} (Status: ${thumbnailResponse.status})`);
      }

      const response = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          videoUrl: res.url,
          thumbnailUrl,
          userId: session!.user!.id,
          controls: true,
        }),
      });

      const data = await response.json();
      console.log("API response:", data); // Log API response
      if (!response.ok) {
        throw new Error(data.error || "Failed to save video metadata");
      }

      router.push("/");
    } catch (err) {
      setError(`Error saving video: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };
  return (
    <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Upload Video</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Video Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Video Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>
            <div>
              <FileUpload
                fileType="video"
                onSuccess={handleUploadSuccess}
                onProgress={(percent) => setProgress(percent)}
              />
              {uploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{progress}% Uploaded</p>
                </div>
              )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Video"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Back to{" "}
              <a href="/videos" className="text-blue-500 hover:underline">
                Videos
              </a>
            </p>
          </div>
        </div>
      </div>
    </ImageKitProvider>
  );
}

export default VideoUploadForm;