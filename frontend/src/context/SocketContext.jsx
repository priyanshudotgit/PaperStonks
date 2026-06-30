import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [livePrices, setLivePrices] = useState({});

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("market-data-update", (feeds) => {
      if (!feeds) return;
      setLivePrices(prev => {
        const updated = { ...prev };
        for (const [key, feed] of Object.entries(feeds)) {
          const full = feed.ff || feed.fullFeed;
          let ltpc = null;
          let ohlc = null;
          let volume = null;
          if (full) {
            const marketFF = full.marketFF;
            const indexFF = full.indexFF;
            ltpc = marketFF?.ltpc || indexFF?.ltpc;
            
            const ohlcData = marketFF?.marketOHLC?.ohlc?.[0] || indexFF?.marketOHLC?.ohlc?.[0];
            if (ohlcData) ohlc = ohlcData;

            const eut = marketFF?.eut || indexFF?.eut;
            if (eut?.v) volume = eut.v;
          } else if (feed.ltpc) {
            ltpc = feed.ltpc;
          }

          if (ltpc && typeof ltpc.ltp === "number") {
            const cp = ltpc.cp;
            const ltp = ltpc.ltp;
            let changePercent = 0;
            if (cp && cp > 0) {
               changePercent = ((ltp - cp) / cp) * 100;
            }
            updated[key] = {
              price: ltp,
              changePercent: changePercent,
              cp: cp
            };
            if (ohlc) {
                updated[key].open = ohlc.open;
                updated[key].high = ohlc.high;
                updated[key].low = ohlc.low;
            }
            if (volume != null) {
                updated[key].volume = volume;
            }
          }
        }
        return updated;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, livePrices }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
