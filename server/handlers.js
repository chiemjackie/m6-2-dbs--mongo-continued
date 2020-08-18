"use strict";

const { MongoClient } = require("mongodb");
const assert = require("assert");

require("dotenv").config();
const { MONGO_URI } = process.env;

const getSeats = async (req, res) => {
  try {
    const client = await MongoClient(MONGO_URI, { useUnifiedTopology: true });

    await client.connect();

    const database = client.db("seat_booking");

    const seatsData = await database.collection("seats").find().toArray();

    return seatsData.reduce((seats, seatData) => {
      const { _id, price, isBooked } = seatData;

      seats[_id] = { price, isBooked };
      return seats;
    }, {});
  } catch ({ message }) {
    throw new Error(message);
  }
};

const bookSeat = async (_id) => {
  try {
    if (!_id) throw new Error("Invalid request");

    const client = await MongoClient(MONGO_URI, { useUnifiedTopology: true });

    await client.connect();

    const database = client.db("seat_booking");

    const newValues = { $set: { isBooked: true } };

    const databaseResponse = await database
      .collection("seats")
      .updateOne({ _id }, { ...newValues });

    assert.equal(1, databaseResponse.matchedCount);
    assert.equal(1, databaseResponse.modifiedCount);

    client.close();

    return;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const updateUser = async (fullName, email, seatID) => {
  try {
    const client = await MongoClient(MONGO_URI, { useUnifiedTopology: true });

    await client.connect();

    const database = client.db("seat_booking");

    const databaseResponse = await database.collection("users").insertOne({
      fullName,
      email,
      bookedSeats: { [seatID]: true },
    });

    assert.equal(1, databaseResponse.insertedCount);

    client.close();

    return;
  } catch ({ message }) {
    console.log(message);
    throw new Error(message);
  }
};

module.exports = {
  getSeats,
  bookSeat,
  updateUser,
};
