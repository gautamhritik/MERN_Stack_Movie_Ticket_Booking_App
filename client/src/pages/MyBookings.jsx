import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../assets/assets'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormat'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getMyBookings = async () => {
    setBookings(dummyBookingData)
    setIsLoading(false)
  }

  useEffect(() => {
    getMyBookings()
  }, [])

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" left="600px" />
      </div>
      <h1 className="relative text-lg font-semibold mb-4 z-10">My Bookings</h1>

      {bookings.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-lg mt-4 px-2 py-2 max-w-xl"
        >

          <img
            src={item.show.movie.poster_path}
            alt=""
            className="w-48 h-24 object-cover rounded-md"
          />

          <div className="flex flex-col justify-center">
            <p className="text-base font-semibold">
              {item.show.movie.title}
            </p>
            <p className="text-gray-400 text-xs">
              {timeFormat(item.show.movie.runtime)}
            </p>
            <p className="text-gray-500 text-xs">
              {dateFormat(item.show.showDateTime)}
            </p>
          </div>

          <div className="flex flex-col items-end justify-start gap-4 pr-6 min-w-[200px] pt-2">

            {/* Price + Button */}
            <div className="flex items-center gap-5">
              <p className="text-2xl font-semibold">
                {currency} {item.amount}
              </p>

              {!item.isPaid && (
                <button className="bg-primary px-5 py-1.5 text-sm rounded-full font-medium hover:bg-primary-dull transition">
                  Pay Now
                </button>
              )}
            </div>

            {/* Details */}
            <div className="text-sm text-right space-y-1">
              <p>
                <span className="text-gray-400">Total Tickets :</span>{" "}
                {item.bookedSeats.length}
              </p>

              <p>
                <span className="text-gray-400">Seat Number :</span>{" "}
                {item.bookedSeats.join(", ")}
              </p>
            </div>

          </div>

        </div>
      ))}

    </div>
  ) : <Loading />
}

export default MyBookings