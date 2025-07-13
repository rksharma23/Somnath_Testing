import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function WardsData() {
  return (
    <>
      <PageMeta
        title="Wards Data | Firefox Dashboard"
        description="Wards data page for Firefox Dashboard"
      />
      <PageBreadcrumb pageTitle="Wards Data" />
      
      <div className="space-y-6">
        {/* Header Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              📊 Wards Data
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Coming soon
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This page will display comprehensive data and analytics for all wards.
          </p>
        </div>

        {/* Blank Content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
            Wards Data Dashboard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This page is currently under development. Check back soon for comprehensive wards data and analytics.
          </p>
        </div>
      </div>
    </>
  );
} 