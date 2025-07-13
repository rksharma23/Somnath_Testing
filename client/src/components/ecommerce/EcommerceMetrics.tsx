import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
  BoltIcon,
  PaperPlaneIcon,
  BoxIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

interface EcommerceMetricsProps {
  cardTitles?: [string, string, string, string];
}

interface BikeData {
  bikeId: string;
  timestamp: string;
  serverTimestamp: string;
  receivedAt: number;
  data: {
    avgSpeed: number;
    distance: number;
    location: {
      lat: number;
      lng: number;
    };
    batteryLevel?: number;
    engineTemp?: number;
    fuelLevel?: number;
    battery?: number;
  };
}

export default function EcommerceMetrics({ cardTitles }: EcommerceMetricsProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestData, setLatestData] = useState<BikeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const titles = cardTitles || [
    "Current Speed",
    "Total Distance",
    "Battery",
    "Current Location"
  ];

  useEffect(() => {
    let newSocket: Socket | null = null;
    
    try {
      const hostname = window.location.hostname;
      const port = 3001; // You can move this to environment variable if needed
      
      newSocket = io(`http://${hostname}:${port}`, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        forceNew: true,
        timeout: 20000
      });

      newSocket.on("connect", () => {
        console.log("Connected to server via WebSocket");
        setIsConnected(true);
        setError(null);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Disconnected from server:", reason);
        setIsConnected(false);
        setError(`Disconnected: ${reason}`);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
        setError(`Connection error: ${error.message}`);
      });

      newSocket.on("bikeData", (data: BikeData) => {
        console.log("Received bike data via WebSocket:", data);
        if (data && data.data) {
          setLatestData(data);
          setError(null);
        }
      });

      setSocket(newSocket);
    } catch (err) {
      console.error("Error setting up WebSocket:", err);
      setError(`Setup error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return () => {
      if (newSocket) {
        console.log("Cleaning up WebSocket connection");
        newSocket.close();
      }
    };
  }, []);

  const formatSpeed = (speed: number) => {
    return `${speed.toFixed(1)} km/h`;
  };

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(2)} km`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {error && (
        <div className="col-span-4 p-4 text-red-500 bg-red-100 rounded-lg dark:bg-red-900/20">
          {error}
        </div>
      )}
      {/* <!-- Speed Metric Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex flex-col items-center">
        {cardTitles ? (
          <>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold text-center mb-2">{titles[0]}</span>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 mb-2">
              <BoxIcon className="text-gray-800 size-6 dark:text-white/90" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <BoltIcon className="text-gray-800 size-6 dark:text-white/90" />
            </div>
            <div className="flex items-end justify-between mt-5 w-full">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{titles[0]}</span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {latestData?.data?.avgSpeed ? formatSpeed(latestData.data.avgSpeed) : "0.0 km/h"}
                </h4>
              </div>
              <Badge color={isConnected ? "success" : "error"}>
                {isConnected ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {isConnected ? "Live" : "Offline"}
              </Badge>
            </div>
          </>
        )}
      </div>
      {/* <!-- Speed Metric End --> */}

      {/* <!-- Distance Metric Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex flex-col items-center">
        {cardTitles ? (
          <>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold text-center mb-2">{titles[1]}</span>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 mb-2">
              <BoxIcon className="text-gray-800 size-6 dark:text-white/90" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
            </div>
            <div className="flex items-end justify-between mt-5 w-full">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{titles[1]}</span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {latestData?.data?.distance ? formatDistance(latestData.data.distance) : "0.00 km"}
                </h4>
              </div>
              <Badge color="success">
                <ArrowUpIcon />
                {latestData ? "Active" : "Idle"}
              </Badge>
            </div>
          </>
        )}
      </div>
      {/* <!-- Distance Metric End --> */}

      {/* <!-- Battery Metric Start (was 2nd Distance) --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex flex-col items-center">
        {cardTitles ? (
          <>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold text-center mb-2">{titles[2]}</span>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 mb-2">
              <BoxIcon className="text-gray-800 size-6 dark:text-white/90" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <BoltIcon className="text-yellow-500 size-6 dark:text-yellow-400" />
            </div>
            <div className="flex items-end justify-between mt-5 w-full">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{titles[2]}</span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {typeof latestData?.data?.battery === 'number' ? `${latestData.data.battery}%` : "--%"}
                </h4>
              </div>
              <Badge color={isConnected ? "success" : "error"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </>
        )}
      </div>
      {/* <!-- Battery Metric End --> */}

      {/* <!-- Third Distance Metric Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex flex-col items-center">
        {cardTitles ? (
          <>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold text-center mb-2">{titles[3]}</span>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 mb-2">
              <BoxIcon className="text-gray-800 size-6 dark:text-white/90" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <PaperPlaneIcon className="text-blue-500 size-6 dark:text-blue-400" />
            </div>
            <div className="flex items-end justify-between mt-5 w-full">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">{titles[3]}</span>
                <span className="mt-2 font-semibold text-gray-800 text-xs dark:text-white/90">
                  Lat: {latestData?.data?.location?.lat !== undefined ? latestData.data.location.lat.toFixed(6) : '--'}
                </span>
                <span className="mt-1 font-semibold text-gray-800 text-xs dark:text-white/90">
                  Lng: {latestData?.data?.location?.lng !== undefined ? latestData.data.location.lng.toFixed(6) : '--'}
                </span>
              </div>
              {latestData?.data?.location?.lat !== undefined && latestData?.data?.location?.lng !== undefined && (
                <span
                  className="cursor-pointer select-none"
                  onClick={() => {
                    const lat = latestData.data.location.lat;
                    const lng = latestData.data.location.lng;
                    const url = `https://www.google.com/maps?q=${lat},${lng}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Badge color="info">
                    Locate
                  </Badge>
                </span>
              )}
            </div>
          </>
        )}
      </div>
      {/* <!-- Third Distance Metric End --> */}
    </div>
  );
}
