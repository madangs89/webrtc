import { createContext, useContext, useState } from "react";

const peerContext = createContext(null);

export const PeerProvider = ({ children }) => {
  const [peer, setPeer] = useState(new RTCPeerConnection());
  return (
    <peerContext.Provider value={{ peer, setPeer }}>
      {children}
    </peerContext.Provider>
  );
};

export const usePeer = () => {
  return useContext(peerContext);
};
