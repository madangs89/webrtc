import { createContext, useContext, useCallback, useMemo } from "react";

const peerContext = createContext(null);

export const PeerProvider = ({ children }) => {
  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      }),
    [],
  );

  const createOffer = useCallback(async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  }, [peer]);

  const createAnswer = useCallback(
    async (offer) => {
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      return answer;
    },
    [peer],
  );

  const setRemoteAnswer = useCallback(
    async (answer) => {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    },
    [peer],
  );

  return (
    <peerContext.Provider
      value={{ peer, createOffer, createAnswer, setRemoteAnswer }}
    >
      {children}
    </peerContext.Provider>
  );
};

export const usePeer = () => useContext(peerContext);
