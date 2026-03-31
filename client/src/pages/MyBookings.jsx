import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../assets/assets'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormat'
import { useAppContext } from '../context/AppContext'
import { Link } from 'react-router-dom'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY

  const {
    axios,
    getToken,
    user,
    image_base_url,
  } = useAppContext();

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/user/bookings', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user){
      getMyBookings()
    }
  }, [user])

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
          className="flex items-center gap-5 bg-primary/10 border border-primary/20 rounded-xl mt-6 px-6 py-5 max-w-3xl w-full"
        >

          <img
            src={image_base_url + item.show.movie.poster_path}
            alt=""
            className="w-48 h-24 object-cover rounded-md"
          />

          <div className="flex-1 flex flex-col justify-center gap-1">
            <p className="text-base font-semibold">
              {item.show.movie.title}
            </p>
            <p className="text-sm text-gray-400">
              {timeFormat(item.show.movie.runtime)}
            </p>
            <p className="text-sm text-gray-400">
              {dateFormat(item.show.showDateTime)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-[180px]">

            {/* Price + Button */}
            <div className="flex items-center gap-4">
              <p className="text-2xl font-semibold">
                {currency} {item.amount}
              </p>

              {!item.isPaid && (
                <Link to={item.paymentLink} className="bg-primary px-5 py-1.5 text-sm rounded-full font-medium hover:bg-primary-dull transition">
                  Pay Now
                </Link>
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