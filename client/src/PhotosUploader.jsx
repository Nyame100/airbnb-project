import axios from "axios";
import { useState } from "react";

const PhotosUploader = ({ state, setState }) => {
  const [photoLink, setPhotoLink] = useState("");

  const addPhotoByLink = async (e) => {
    e.preventDefault();
    const { data: filename } = await axios.post("/upload-by-link", {
      link: photoLink,
    });

    setState({
      ...state,
      addedPhotos: [...state.addedPhotos, filename],
    });
    setPhotoLink("");
  };

  const uploadPhoto = async (e) => {
    const imageFiles = e.target.files;
    const formData = new FormData();
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append("photos", imageFiles[i]);
    }
    try {
      const { data: filenames } = await axios.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setState({
        ...state,
        addedPhotos: [...state.addedPhotos, ...filenames],
      });
    } catch (error) {
      // filename = null;
      console.log(error);
    }
  };
  return (
    <>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add using link ...jpg"
          value={photoLink}
          onChange={(e) => setPhotoLink(e.target.value)}
        />
        <button
          onClick={addPhotoByLink}
          className="bg-gray-200 px-4 rounded-2xl"
        >
          Grab&nbsp;photo
        </button>
      </div>
      <div className="mt-2 gap-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {state.addedPhotos.length > 0 &&
          state.addedPhotos.map((link, index) => {
            return (
              <div key={index} className="h-32 flex">
                <img className="rounded-2xl w-full object-cover" src={link} />
              </div>
            );
          })}
        <label className="h-32 cursor-pointer flex justify-center items-center border bg-transparent rounded-2xl p-2 text-2xl text-gray-500 gap-2">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={uploadPhoto}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
            />
          </svg>
          Upload
        </label>
      </div>
    </>
  );
};

export default PhotosUploader;
