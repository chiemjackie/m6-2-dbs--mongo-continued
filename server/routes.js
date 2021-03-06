const router = require("express").Router();
const { getSeats, bookSeat, updateUser } = require("./handlers");

let state;

const NUM_OF_ROWS = 8;
const SEATS_PER_ROW = 12;

const getRowName = (rowIndex) => {
  return String.fromCharCode(65 + rowIndex);
};

const randomlyBookSeats = (num) => {
  const bookedSeats = {};

  while (num > 0) {
    const row = Math.floor(Math.random() * NUM_OF_ROWS);
    const seat = Math.floor(Math.random() * SEATS_PER_ROW);

    const seatId = `${getRowName(row)}-${seat + 1}`;

    bookedSeats[seatId] = true;

    num--;
  }

  return bookedSeats;
};

router.get("/api/seat-availability", async (req, res) => {
  try {
    if (!state) {
      state = {
        bookedSeats: randomlyBookSeats(30),
      };
    }

    return res.json({
      seats: await getSeats(),
      bookedSeats: state.bookedSeats,
      numOfRows: 8,
      seatsPerRow: 12,
    });
  } catch ({ message }) {
    console.log(message);
    res.status(404).json({ status: 404, message });
  }
});

let lastBookingAttemptSucceeded = false;

router.post("/api/book-seat", async (req, res) => {
  const { seatId, fullName, email, creditCard, expiration } = req.body;

  updateUser(fullName, email, seatId);

  if (!state) {
    state = {
      bookedSeats: randomlyBookSeats(30),
    };
  }

  const isAlreadyBooked = !!state.bookedSeats[seatId];
  if (isAlreadyBooked) {
    return res.status(400).json({
      message: "This seat has already been booked!",
    });
  }

  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  if (lastBookingAttemptSucceeded) {
    lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

    return res.status(500).json({
      message: "An unknown error has occurred. Please try your request again.",
    });
  }

  lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

  await bookSeat(seatId);

  return res.status(200).json({
    status: 200,
    success: true,
  });
});

module.exports = router;
