import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSocket } from "../context/Provider";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { socket, setSocket } = useSocket();

  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();
  const handlRoomJoin = (e) => {
    e.preventDefault();
    console.log(email + " " + roomId);

    if (socket == null || !email || !roomId) return;
    socket.emit("join_room", { email, roomId });
  };

  let handleJoinedRoom = (data) => {
    console.log("Joined the room successfully", data);
    navigate(`/room/${data.roomId}`);
  };

  useEffect(() => {
    if (socket) {
      socket.on("joined_room", handleJoinedRoom);
    }
  }, [socket]);

  useEffect(() => {
    if (socket == null) {
      console.log("Setting socket");

      let connection = io("http://localhost:3000");
      setSocket(connection);
    }
  }, [socket]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-sky-200 bg-white/80 shadow-2xl backdrop-blur-sm md:grid-cols-2">
          <div className="relative hidden bg-gradient-to-br from-cyan-600 via-sky-600 to-emerald-500 p-10 text-white md:block">
            <div className="absolute -left-14 top-1/3 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute bottom-10 right-10 h-24 w-24 rounded-full bg-white/20 blur-xl" />
            <h1 className="text-3xl font-extrabold leading-tight lg:text-4xl">
              Join Your Video Room
            </h1>
            <p className="mt-4 max-w-sm text-sm text-cyan-50 lg:text-base">
              Enter your email and room ID to connect instantly and start your
              conversation.
            </p>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in your details to join the room.
            </p>

            <form className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="roomId"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Room ID
                </label>
                <input
                  id="roomId"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                />
              </div>

              <button
                onClick={handlRoomJoin}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01] hover:from-cyan-500 hover:to-emerald-400 active:scale-[0.99]"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
