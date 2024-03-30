"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { FileWithUrls } from "@/convex/types";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Heart, Play, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import AudioPlayer from "@/components/audio-player";

const Home = () => {
  const store = useMutation(api.users.store);
  const deleteFile = useMutation(api.files.deleteFile); // New mutation for deleting files

  const songList = useQuery(api.files.list);
  const [deleteFileId, setDeleteFileId] = useState<Id<"files"> | null>(null);
  const [fileId, setFileId] = useState<Id<"files"> | null>(null);
  const [currentSong, setCurrentSong] = useState("");
  const [title, setTitle] = useState("title");
  const [artist, setArtist] = useState("");
  const [coverArt, setCoverArt] = useState<string | null>("");
  const [showFavorites, setShowFavorites] = useState(false);

  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const handleNext = () => {
    if (filteredSongList.length === 0) {
      setCurrentIndex(-1); // Reset currentIndex
      setFileId(null); // Clear fileId
      setCurrentSong(""); // Clear currentSong
      setArtist(""); // Clear artist
      setCoverArt(null); // Clear coverArt
      setTitle("title"); // Reset title
      return;
    }

    if (currentIndex < filteredSongList.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSong = filteredSongList[nextIndex];
      playSong(nextSong);
      setCurrentIndex(nextIndex);
    } else {
      playSong(filteredSongList[0]);
      setCurrentIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      const previousSong = filteredSongList[previousIndex];
      playSong(previousSong);
      setCurrentIndex(previousIndex);
    } else {
      const lastIndex = filteredSongList.length - 1;
      playSong(filteredSongList[lastIndex]);
      setCurrentIndex(lastIndex);
    }
  };

  useEffect(() => {
    store({});
  }, [store]);

  const playSong = (file: FileWithUrls) => {
    setFileId(file._id);
    setCurrentSong(file.songUrl);
    setArtist(file.owner.fullName);
    setCoverArt(file.imageUrl);
    setTitle(file.title);
  };
  const toggleShowFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  const handleDelete = async () => {
    if (deleteFileId) {
      if (window.confirm("Are you sure you want to delete this song?")) {
        await deleteFile({ id: deleteFileId });
        setDeleteFileId(null);
        // songList.refetch();
      }
    }
  };

  if (songList === undefined) {
    return <div>Loading...</div>;
  }

  const filteredSongList = showFavorites
    ? songList.filter((file) => file.favorite)
    : songList;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex w-full justify-between">
          <h1 className="text-4xl font-bold mb-8">Your Music Library</h1>
          <button
            onClick={toggleShowFavorites}
            className="transform transition hover:scale-125 active:scale-150 ml-10"
          >
            <Heart
              className={cn("text-white", showFavorites && "fill-red-600")}
            />
          </button>
        </div>
        {filteredSongList.length === 0 ? (
          <div className="flex justify-center items-center h-96">
            <svg
              id="logo-70"
              width="50%"
              height="50%"
              viewBox="0 0 78 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {" "}
              <path
                d="M18.5147 0C15.4686 0 12.5473 1.21005 10.3934 3.36396L3.36396 10.3934C1.21005 12.5473 0 15.4686 0 18.5147C0 24.8579 5.14214 30 11.4853 30C14.5314 30 17.4527 28.7899 19.6066 26.636L24.4689 21.7737C24.469 21.7738 24.4689 21.7736 24.4689 21.7737L38.636 7.6066C39.6647 6.57791 41.0599 6 42.5147 6C44.9503 6 47.0152 7.58741 47.7311 9.78407L52.2022 5.31296C50.1625 2.11834 46.586 0 42.5147 0C39.4686 0 36.5473 1.21005 34.3934 3.36396L15.364 22.3934C14.3353 23.4221 12.9401 24 11.4853 24C8.45584 24 6 21.5442 6 18.5147C6 17.0599 6.57791 15.6647 7.6066 14.636L14.636 7.6066C15.6647 6.57791 17.0599 6 18.5147 6C20.9504 6 23.0152 7.58748 23.7311 9.78421L28.2023 5.31307C26.1626 2.1184 22.5861 0 18.5147 0Z"
                fill="#394149"
              ></path>{" "}
              <path
                d="M39.364 22.3934C38.3353 23.4221 36.9401 24 35.4853 24C33.05 24 30.9853 22.413 30.2692 20.2167L25.7982 24.6877C27.838 27.8819 31.4143 30 35.4853 30C38.5314 30 41.4527 28.7899 43.6066 26.636L62.636 7.6066C63.6647 6.57791 65.0599 6 66.5147 6C69.5442 6 72 8.45584 72 11.4853C72 12.9401 71.4221 14.3353 70.3934 15.364L63.364 22.3934C62.3353 23.4221 60.9401 24 59.4853 24C57.0498 24 54.985 22.4127 54.269 20.2162L49.798 24.6873C51.8377 27.8818 55.4141 30 59.4853 30C62.5314 30 65.4527 28.7899 67.6066 26.636L74.636 19.6066C76.7899 17.4527 78 14.5314 78 11.4853C78 5.14214 72.8579 0 66.5147 0C63.4686 0 60.5473 1.21005 58.3934 3.36396L39.364 22.3934Z"
                fill="#394149"
              ></path>{" "}
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredSongList.map((file) => (
              <div
                key={file.song}
                className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:bg-gray-700 
                        duration-300 hover:scale-105 transform transition-transform cursor-pointer relative"
                onClick={() => playSong(file)}
              >
                <div className="p-4 relative">
                  {file.imageUrl && (
                    <div className="group mb-4 rounded-md overflow-hidden">
                      <Image
                        src={file.imageUrl}
                        alt={file.title}
                        className="w-full h-48 object-cover"
                        width={200}
                        height={200}
                      />
                      <div className="absolute left-52 top-28 inset-0 flex items-center justify-center">
                        <div
                          className="bg-green-500 rounded-full p-2 transform 
                            transition-transform duration-300 translate-y-full opacity-0 
                            group-hover:opacity-100 group-hover:translate-y-6
                            "
                        >
                          <Play className="text-white h-6 w-6" />
                        </div>
                      </div>
                    </div>
                  )}
                  <h2 className="text-lg font-semibold">{file.title}</h2>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteFileId(file._id);
                        handleDelete();
                      }}
                      className="text-red-50 font-mono hover:text-red-600 transition-all delay-75"
                    >
                      <TrashIcon />
                    </button>
                    {/* {deleteFileId === file._id && (
                      <div className="absolute top-8 right-0 bg-white p-2 rounded-lg shadow-md">
                        <button
                          onClick={handleDelete}
                          className="text-red-600 font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {fileId && currentSong && (
        <AudioPlayer
          id={fileId}
          title={title}
          artist={artist}
          coverArt={coverArt}
          songUrl={currentSong}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
        />
      )}
    </div>
  );
};

export default Home;
