import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Community() {
  return (
    <>
      <PageMeta
        title="Community | Firefox Dashboard"
        description="Community page for Firefox Dashboard"
      />
      <PageBreadcrumb pageTitle="Community" />
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] text-center">
        <div className="text-4xl mb-4">🌐</div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          Community
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This page will display community features and discussions. (Template)
        </p>
      </div>
    </>
  );
} 