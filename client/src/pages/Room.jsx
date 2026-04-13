import React, { useEffect } from "react";
import { useSocket } from "../context/Provider";

const Room = () => {
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on("user_joined", (data) => {
        console.log("User joined the room", data);
      });
    }
  }, [socket]);
  return <div></div>;
};

export default Room;
