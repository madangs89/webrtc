import React, { useEffect } from "react";
import { useSocket } from "../context/Provider";
import { usePeer } from "../context/PeerProvider";

const Room = () => {
  const { socket } = useSocket();
  const { peer, createOffer } = usePeer();

  const handleUserJoined = async (data) => {
    console.log("User joined the room", data);
    const offer = await createOffer();
    socket.emit("call-user", { offer, email: data.email });
  };
  const handleIncomingCall = async (data) => {
    const { offer, email, from } = data;
    console.log(from, offer);
  };
  useEffect(() => {
    if (socket) {
      socket.on("user_joined", handleUserJoined);
      socket.on("incoming-call", handleIncomingCall);
    }

    return () => {
      if (socket) {
        socket.off("user_joined", handleUserJoined);
        socket.off("incoming-call", handleIncomingCall);
      }
    };
  }, [socket]);

  return <div></div>;
};

export default Room;
