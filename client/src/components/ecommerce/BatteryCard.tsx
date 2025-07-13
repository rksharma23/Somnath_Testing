import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BoltIcon } from "../../icons";
import Badge from "../ui/badge/Badge";

interface BikeData {
  bikeId: string;
  data: {
    avgSpeed: number;
    distance?: number;
    location: {
      lat: number;
      lng: number;
    };
    battery: number;
  };
}

export default function BatteryCard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let newSocket: Socket | null = null;
    const hostname = window.location.hostname;
    const port = 3001;
    newSocket = io(`http://${hostname}:${port}`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,
      timeout: 20000
    });

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("bikeData", (data: BikeData) => {
      if (typeof data?.data?.battery === "number") {
        setBattery(data.data.battery);
      }
    });
    setSocket(newSocket);
    return () => {
      if (newSocket) newSocket.close();
    };
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex flex-col items-center justify-center">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 mb-2">
        <BoltIcon className="text-yellow-500 size-6 dark:text-yellow-400" />
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Battery</span>
      <h4 className="font-bold text-gray-800 text-2xl dark:text-white/90 mb-1">
        {battery !== null ? `${battery}%` : "--%"}
      </h4>
      <Badge color={isConnected ? "success" : "error"}>
        {isConnected ? "Live" : "Offline"}
      </Badge>
    </div>
  );
} 