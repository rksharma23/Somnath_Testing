import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import axios from "axios";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date: string | null;
}

interface RankData {
  id: number;
  rank: number;
  name: string;
  email: string;
  points: number;
  level: string;
  achievements: Achievement[];
  totalDistance: number;
  avgSpeed: number;
  ridesCompleted: number;
  badge: string;
}

export default function Ranks() {
  const [ranks, setRanks] = useState<RankData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ranks');
      setRanks(response.data.ranks);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch ranks');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Elite': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'Pro': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'Advanced': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'Beginner': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading ranks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title="Ranks | Firefox Dashboard"
        description="User rankings and leaderboards for Firefox Dashboard"
      />
      <PageBreadcrumb pageTitle="Ranks" />
      
      <div className="space-y-6">
        {/* Header Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              🏆 Leaderboard
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {ranks.length} Riders
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compete with other riders and unlock achievements to climb the ranks!
          </p>
        </div>

        {/* Ranks List */}
        <div className="space-y-4">
          {ranks.map((rank) => (
            <div key={rank.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              {/* Left: Badge, Name, Email */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl md:text-2xl">{rank.badge}</span>
                <span className="inline-block bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-semibold px-2 py-1 rounded mr-2">#{rank.rank}</span>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-800 dark:text-white/90 truncate">{rank.name}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">{rank.email}</span>
                </div>
              </div>
              {/* Middle: Info Badges */}
              <div className="flex flex-wrap gap-2 justify-start md:justify-center mt-2 md:mt-0">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getLevelColor(rank.level)}`}>{rank.level}</span>
                <span className="inline-block bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium">{rank.totalDistance} km</span>
                <span className="inline-block bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium">{rank.avgSpeed} km/h</span>
                <span className="inline-block bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium">{rank.ridesCompleted} rides</span>
                <span className="inline-block bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-1 rounded text-xs font-medium">{rank.points} pts</span>
              </div>
              {/* Right: Achievements */}
              <div className="flex flex-wrap gap-1 justify-end md:justify-end mt-2 md:mt-0">
                {rank.achievements.map((achievement) => (
                  <span
                    key={achievement.id}
                    title={achievement.title + (achievement.unlocked ? ' (Unlocked)' : ' (Locked)')}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${achievement.unlocked ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700' : 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'}`}
                  >
                    <span className="text-base">{achievement.icon}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 