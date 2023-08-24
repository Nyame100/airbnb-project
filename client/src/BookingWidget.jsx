import React, { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const BookingWidget = ({ place }) => {
  const { user } = useContext(UserContext);
  const [bookingState, setBookingState] = useState({
    checkIn: "",
    checkOut: "",
    numberOfGuests: 1,
    name: "",
    email: "",
    mobile: "",
  });

  useEffect(() => {
    if (user) {
      setBookingState({ ...bookingState, name: user.name, email: user.email });
    }
  }, [user]);

  const [redirect, setRedirect] = useState("");

  let numberOfNights = 0;
  if (bookingState.checkIn && bookingState.checkOut) {
    numberOfNights = differenceInCalendarDays(
      new Date(bookingState.checkOut),
      new Date(bookingState.checkIn)
    );
  }

  const bookPlace = async () => {
    if (
      !bookingState.email ||
      !bookingState.mobile ||
      !bookingState.numberOfGuests ||
      !bookingState.name
    ) {
      alert("Please fill out all fields");
      return;
    }
    if (!bookingState.email.includes("@")) {
      alert("Please enter a valid email");
      return;
    }
    if (user === null) {
      setRedirect("/login");
      return <Navigate to={redirect} />;
    }
    const response = await axios.post("/bookings", {
      ...bookingState,
      place: place._id,
      price: numberOfNights * place.price,
    });
    const bookingId = response.data._id;
    setRedirect(`/account/bookings/${bookingId}`);
  };

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="bg-white shadow p-4 rounded-2xl">
      <div className="text-2xl text-center">
        Price: €{place.price} / per night
      </div>
      <div className="border rounded-2xl mt-4">
        <div className="flex">
          <div className="py-3 px-4">
            <label>Check in: </label>
            <input
              type="date"
              value={bookingState.checkIn}
              onChange={(e) =>
                setBookingState({ ...bookingState, checkIn: e.target.value })
              }
            />
          </div>
          <div className="py-3 px-4 border-l">
            <label>Check out: </label>
            <input
              type="date"
              value={bookingState.checkOut}
              onChange={(e) =>
                setBookingState({ ...bookingState, checkOut: e.target.value })
              }
            />
          </div>
        </div>
        <div className="py-3 px-4 border-t">
          <label>Number of Guests: </label>
          <input
            min={1}
            type="number"
            value={bookingState.numberOfGuests}
            onChange={(e) =>
              setBookingState({
                ...bookingState,
                numberOfGuests: e.target.value,
              })
            }
          />
        </div>
        {numberOfNights > 0 && (
          <div className="py-3 px-4 border-t">
            <label>Full name: </label>
            <input
              type="text"
              placeholder="John Doe"
              value={bookingState.name}
              onChange={(e) =>
                setBookingState({
                  ...bookingState,
                  name: e.target.value,
                })
              }
            />
            <label>Email: </label>
            <input
              type="email"
              pattern="[^ @]*@[^ @]*"
              required
              placeholder="johndoe@mail.com"
              value={bookingState.email}
              onChange={(e) =>
                setBookingState({
                  ...bookingState,
                  email: e.target.value,
                })
              }
            />
            <label>Phone number: </label>
            <input
              type="tel"
              placeholder="+49150895673"
              value={bookingState.mobile}
              onChange={(e) =>
                setBookingState({
                  ...bookingState,
                  mobile: e.target.value,
                })
              }
            />
          </div>
        )}
      </div>
      <button onClick={bookPlace} className="primary mt-4">
        Book this place
        {numberOfNights > 0 && (
          <>
            <span className="text-black">
              &nbsp; €
              {(
                Math.round(
                  (numberOfNights * place.price + Number.EPSILON) * 100
                ) / 100
              ).toFixed(2)}
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default BookingWidget;
