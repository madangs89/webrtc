import { createContext, useContext, useState } from "react";

const peerContext = createContext(null);

export const PeerProvider = ({ children }) => {
  const [peer, setPeer] = useState(new RTCPeerConnection());

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };
  return (
    <peerContext.Provider value={{ peer, setPeer, createOffer }}>
      {children}
    </peerContext.Provider>
  );
};

export const usePeer = () => {
  return useContext(peerContext);
};
