import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Notification() {
  return (
    <>
      <PageMeta
        title="Notification | Firefox Dashboard"
        description="Notification page for Firefox Dashboard"
      />
      <PageBreadcrumb pageTitle="Notification" />
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] text-center">
        <div className="text-4xl mb-4">🔔</div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          Notification Center
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This page will display your notifications. (Template)
        </p>
      </div>
    </>
  );
}
