import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import { AlertIcon, AlertHexaIcon, ErrorHexaIcon } from "../icons";

export default function Notification() {
  return (
    <>
      <PageMeta
        title="Notification | Firefox Dashboard"
        description="Notification page for Firefox Dashboard"
      />
      <PageBreadcrumb pageTitle="Notification" />
      <div className="space-y-6 mt-8">
        <ComponentCard title="Alert" className="">
          <div className="flex items-center gap-4">
            <AlertIcon className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="font-semibold text-gray-800 dark:text-white">This is an alert notification.</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">Something needs your attention, but it is not urgent.</div>
            </div>
          </div>
        </ComponentCard>
        <ComponentCard title="Warning" className="">
          <div className="flex items-center gap-4">
            <AlertHexaIcon className="w-8 h-8 text-orange-500" />
            <div>
              <div className="font-semibold text-gray-800 dark:text-white">This is a warning notification.</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">There is a potential issue that you should be aware of.</div>
            </div>
          </div>
        </ComponentCard>
        <ComponentCard title="Risk" className="">
          <div className="flex items-center gap-4">
            <ErrorHexaIcon className="w-8 h-8 text-red-500" />
            <div>
              <div className="font-semibold text-gray-800 dark:text-white">This is a risk notification.</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">Immediate action is required to address this risk.</div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
} 