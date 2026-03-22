import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'

const SeatLayout = () => {

  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];

  const { id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)

  const navigate = useNavigate();

  const getShow = async () => {
    const show = dummyShowsData.find(show => show._id === id)
    if (show) {
      setShow({
        movie: show,
        dateTime: dummyDateTimeData
      })
    }
  }

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast("Please select time first");
    }

    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
      return toast("You can only select 5 seats");
    }

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(seat => seat !== seatId)
        : [...prev, seatId]
    );
  };

  const renderSeats = (row, count = 9) => (
    <>
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${row}${i + 1}`;
        return (
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId)}
            className={`h-8 w-8 rounded border border-primary/60 cursor-pointer ${selectedSeats.includes(seatId) ? "bg-primary text-white" : ""
              }`}
          >
            {seatId}
          </button>
        );
      })}
    </>
  );

  useEffect(() => {
    getShow()
  }, [id])


  return show ? (
    <div className="flex flex-col md:flex-row gap-6 md:gap-16 px-6 md:px-16 lg:px-40 pt-20 md:pt-40 min-h-screen">

      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show.dateTime[date].map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time
                ? "bg-primary text-white"
                : "hover:bg-primary/20"
                }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center w-full max-w-5xl mx-auto">

        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        <h1 className="text-3xl font-semibold mb-6">Select your seat</h1>
        <img
          src={assets.screenImage}
          className="w-72 md:w-[500px] lg:w-[600px]"
        />
        <p className="text-gray-400 text-sm mb-16 md:mb-24">
          SCREEN SIDE
        </p>
        <div className="flex flex-col items-center gap-8 w-full text-xs text-gray-300">

          <div className="flex flex-col items-center gap-3">
            {groupRows[0].map((row) => (
              <div key={row} className="flex justify-center gap-3 w-full">
                {renderSeats(row)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-20 gap-y-6 justify-center">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                {group.map((row) => (
                  <div key={row} className="flex justify-center gap-3">
                    {renderSeats(row)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={() => navigate('/my-bookings')}
          className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>

    </div>
  ) : (
    <Loading />
  )
}

export default SeatLayout
