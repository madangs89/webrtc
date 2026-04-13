import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/Provider";
import { usePeer } from "../context/PeerProvider";

const Room = () => {
  const { socket } = useSocket();
  const { peer, createOffer, createAnswer, setRemoteAnswer } = usePeer();

  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // get local camera/mic
  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);

      // add tracks to peer so remote can receive them
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    } catch (error) {
      console.error("Unable to access camera/mic:", error);
    }
  }, [peer]);

  // attach local stream to video element
  useEffect(() => {
    if (myStream && myVideoRef.current) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  // attach remote stream to video element
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // listen for remote tracks
  useEffect(() => {
    const handleTrack = (event) => {
      console.log("🎥 Remote track received:", event.streams[0]);
      setRemoteStream(event.streams[0]);
    };
    peer.addEventListener("track", handleTrack);
    return () => peer.removeEventListener("track", handleTrack);
  }, [peer]);

  // ICE candidate exchange
  useEffect(() => {
    if (!socket) return;

    const handleIceCandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 Sending ICE candidate");
        socket.emit("ice-candidate", { candidate: event.candidate });
      }
    };
    peer.addEventListener("icecandidate", handleIceCandidate);
    return () => peer.removeEventListener("icecandidate", handleIceCandidate);
  }, [peer, socket]);

  // receive ICE candidate from remote
  useEffect(() => {
    if (!socket) return;
    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        console.log("🧊 Received ICE candidate, adding...");
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ ICE candidate added");
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    return () => socket.off("ice-candidate");
  }, [socket, peer]);

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
      <div className="flex gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">You</h2>
          <video
            ref={myVideoRef}
            autoPlay
            
            playsInline
            className="w-full rounded-xl bg-black"
            style={{ height: "360px" }}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Remote</h2>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full rounded-xl bg-black"
            style={{ height: "360px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Room;
