import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/Provider";
import { usePeer } from "../context/PeerProvider";
import ReactPlayer from "react-player";

const Room = () => {
  const { socket } = useSocket();
  const { createOffer, createAnswer, setRemoteAnswer } = usePeer();

  const [myStream, setMyStream] = useState(null);

  const handleUserJoined = useCallback(
    async (data) => {
      console.log("🟡 [STEP 1] user_joined event received:", data);

      const offer = await createOffer();
      console.log("🟢 [STEP 2] Offer created:", offer);

      socket.emit("call-user", { offer, email: data.email });
      console.log("🟢 [STEP 3] Emitted call-user to:", data.email);
    },
    [socket, createOffer],
  );

  const handleIncomingCall = useCallback(
    async ({ offer, from }) => {
      console.log("🌐 BROWSER: STEP 4 incoming-call from:", from);
      console.log("🟡 [STEP 4] incoming-call received from:", from);
      console.log("🟡 [STEP 4] Offer received:", offer);

      const answer = await createAnswer(offer);
      console.log("🟢 [STEP 5] Answer created:", answer);

      socket.emit("call-accepted", { from, answer });
      console.log("🟢 [STEP 6] Emitted call-accepted back to:", from);
    },
    [socket, createAnswer],
  );

  const handleCallAccepted = useCallback(
    async ({ answer }) => {
      console.log("🟡 [STEP 7] call-accepted received, answer:", answer);

      await setRemoteAnswer(answer);
      console.log("🟢 [STEP 8] Remote answer set — handshake complete ✅");
    },
    [setRemoteAnswer],
  );

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);
    } catch (error) {
      console.error("Unable to access camera/mic:", error);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("user_joined", handleUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Room</h1>
      {myStream && (
        <div>
          <h2 className="text-xl font-semibold mb-2">My Stream</h2>
          <ReactPlayer
            src={myStream}
            controls
            playing
            muted
            width="100%"
            height="360px"
            onError={(error) => console.error("ReactPlayer error:", error)}
            config={{
              file: {
                attributes: {
                  playsInline: true,
                  autoPlay: true,
                  muted: true,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Room;
