import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useAuth } from "../../context/AuthContext";

// Define the TypeScript interface for bike data
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
  };
}

export default function RecentOrders() {
  const { guardian } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [recentData, setRecentData] = useState<BikeData[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  // Get bike IDs that belong to the guardian's wards
  const guardianBikeIds = guardian?.wards?.map(ward => ward.bikeId) || [];

  useEffect(() => {
    const hostname = window.location.hostname;
    const newSocket = io(`http://${hostname}:3001`, {
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
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("bikeData", (data: BikeData) => {
      // Only add data if the bike belongs to the guardian's wards
      if (guardianBikeIds.includes(data.bikeId)) {
        console.log("Adding bike data for guardian's ward:", data.bikeId);
        setRecentData(prev => {
          const newData = [data, ...prev];
          // Keep only last 10 entries
          return newData.slice(0, 10);
        });
      } else {
        console.log("Ignoring bike data for non-guardian bike:", data.bikeId);
      }
    });

    setSocket(newSocket);

    return () => {
      console.log("Cleaning up WebSocket connection");
      newSocket.close();
    };
  }, [guardianBikeIds]);

  const formatSpeed = (speed: number) => {
    return `${speed.toFixed(1)} km/h`;
  };

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(2)} km`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (speed: number) => {
    if (speed > 80) return "error";
    if (speed > 60) return "warning";
    return "success";
  };

  const getStatusText = (speed: number) => {
    if (speed > 80) return "High Speed";
    if (speed > 60) return "Medium Speed";
    return "Normal Speed";
  };

  // Get ward name for a bike ID
  const getWardName = (bikeId: string) => {
    const ward = guardian?.wards?.find(w => w.bikeId === bikeId);
    return ward?.name || bikeId;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Bike Data
          </h3>
          {guardian && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing data for {guardian.wards?.length || 0} ward(s)
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Ward/Bike
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Speed
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Distance
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentData.length > 0 ? (
              recentData.map((data, index) => (
                <TableRow key={index} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-400 font-medium text-xs">
                          {data.bikeId}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {getWardName(data.bikeId)}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {formatTime(data.timestamp)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatSpeed(data.data.avgSpeed)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatDistance(data.data.distance)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={getStatusColor(data.data.avgSpeed)}
                    >
                      {getStatusText(data.data.avgSpeed)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="py-8 text-center text-gray-500 dark:text-gray-400">
                  {guardian?.wards?.length === 0 ? (
                    "No wards assigned. Add wards to see their bike data."
                  ) : (
                    "No data received yet. Waiting for bike data from your wards..."
                  )}
                </TableCell>
                <TableCell className="py-8">{" "}</TableCell>
                <TableCell className="py-8">{" "}</TableCell>
                <TableCell className="py-8">{" "}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
