import React, { useEffect, useState } from "react";
import { perks } from "../data";
import axios from "axios";
import PhotosUploader from "../PhotosUploader";
import AccountNav from "../AccountNav";
import { Navigate, useParams } from "react-router-dom";

const PlacesFormPage = () => {
  const { id } = useParams();
  const [state, setState] = useState({
    title: "",
    address: "",
    addedPhotos: [],
    description: "",
    perks: [],
    extraInfo: "",
    checkIn: "",
    checkOut: "",
    maxGuests: 1,
    price: 100,
  });
  const [redirect, setRedirect] = useState("");
  // const [addedPhotos, setAddedPhotos] = useState([]);

  function handleChange(e) {
    const { checked, name } = e.target;
    if (checked) {
      setState({ ...state, perks: [...state.perks, name] });
    } else {
      setState({
        ...state,
        perks: [...state.perks.filter((selectedName) => selectedName !== name)],
      });
    }
  }

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get("/places/" + id).then((response) => {
      const { data } = response;
      setState({
        ...state,
        title: data.title,
        address: data.address,
        addedPhotos: data.photos,
        description: data.description,
        perks: data.perks,
        extraInfo: data.extraInfo,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        maxGuests: data.maxGuests,
        price: data.price,
      });
    });
  }, [id]);

  function preInput(header, description) {
    return (
      <>
        <h2 className="text-2xl mt-4">{header}</h2>
        <p className="text-gray-500 text-sm">{description}</p>
      </>
    );
  }
  const savePlace = async (e) => {
    e.preventDefault();
    const placeData = state;

    if (id) {
      //UPDATE
      await axios.put("/places", { id, ...placeData });
      setRedirect("/account/places");
    } else {
      // NEW PLACE
      await axios.post("/places", placeData);
      setRedirect("/account/places");
    }
  };

  if (redirect) {
    return <Navigate to="/account/places" />;
  }
  return (
    <div>
      <AccountNav />
      <form onSubmit={savePlace}>
        {preInput(
          "Title",
          "Title should be short and catchy as in advertisement"
        )}
        <input
          type="text"
          placeholder="Title: My lovely apartment"
          value={state.title}
          onChange={(e) => setState({ ...state, title: e.target.value })}
        />
        {preInput("Address", "Address to this place")}
        <input
          type="text"
          placeholder="Address"
          value={state.address}
          onChange={(e) => setState({ ...state, address: e.target.value })}
        />
        {preInput("Photos", "More is better")}
        <PhotosUploader state={state} setState={setState} />
        {preInput("Description", "Description of the place")}
        <textarea
          value={state.description}
          onChange={(e) => setState({ ...state, description: e.target.value })}
        />
        {preInput("Perks", "Select all the perks of the place")}
        <div className="grid gap-2 mt-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {perks.map((perk) => {
            return (
              <label
                key={perk.id}
                className="border p-4 flex rounded-2xl gap-2 items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  name={perk.text}
                  checked={state.perks.includes(perk.text)}
                  onChange={handleChange}
                />
                {perk.svg}
                <span>{perk.text}</span>
              </label>
            );
          })}
        </div>
        {preInput("Extra Info", "House rules, etc")}
        <textarea
          value={state.extraInfo}
          onChange={(e) => setState({ ...state, extraInfo: e.target.value })}
        />
        {preInput(
          "Check in & out times",
          "Add check in and out times, remember to have some time window for cleaning the place between guests"
        )}
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mt-2 -mb-1">Check in time</h3>
            <input
              type="text"
              placeholder="13:00"
              value={state.checkIn}
              onChange={(e) => setState({ ...state, checkIn: e.target.value })}
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Check out time</h3>
            <input
              type="text"
              placeholder="16:00"
              value={state.checkOut}
              onChange={(e) => setState({ ...state, checkOut: e.target.value })}
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Max number of guests</h3>
            <input
              type="number"
              placeholder="2"
              value={state.maxGuests}
              onChange={(e) =>
                setState({ ...state, maxGuests: e.target.value })
              }
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Price per night</h3>
            <input
              type="number"
              placeholder="5"
              value={state.price}
              onChange={(e) => setState({ ...state, price: e.target.value })}
            />
          </div>
        </div>
        <button className="primary my-4">Save</button>
      </form>
    </div>
  );
};

export default PlacesFormPage;
