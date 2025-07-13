import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useNavigate } from "react-router-dom";

export default function Map() {
  const navigate = useNavigate();
  
  console.log("Map component rendered");

  const testNavigation = () => {
    console.log("Testing navigation to profile");
    navigate('/profile');
  };

  return (
    <div>
      <PageMeta
        title="Map | Firefox Dashboard"
        description="Map page for Firefox Dashboard"
      />
      <PageBreadcrumb pageTitle="Map" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Map
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            This page will display interactive maps and location data. Content coming soon.
          </p>
          
          <button 
            onClick={testNavigation}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Navigation to Profile
          </button>
        </div>
      </div>
    </div>
  );
} 