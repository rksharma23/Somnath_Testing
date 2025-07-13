import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import Badge from "../ui/badge/Badge";

export default function MonthlyTarget() {
  // State for cycling target
  const [target, setTarget] = useState(500);
  const [isOpen, setIsOpen] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState(target.toString());

  // Example: current cycled km this month (replace with real data as needed)
  const currentKm = 320;
  // Milestones: 1/4, 1/2, 3/4, full of target
  const milestones = [
    Math.round(target * 0.25),
    Math.round(target * 0.5),
    Math.round(target * 0.75),
    target,
  ];

  const series = [Math.min((currentKm / target) * 100, 100)];
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return Math.round((val / 100) * target) + " km";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleModalOpen() {
    setShowInput(true);
    setIsOpen(false);
    setInputValue(target.toString());
  }

  function handleInputBoxClose() {
    setShowInput(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value.replace(/[^0-9]/g, ""));
  }

  function handleInputBoxSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newTarget = parseInt(inputValue, 10);
    if (!isNaN(newTarget) && newTarget > 0) {
      setTarget(newTarget);
      setShowInput(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Cycling Target
            </h3>
          </div>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={handleModalOpen}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Change Target
              </DropdownItem>
            </Dropdown>
            {/* Small input box for changing target */}
            {showInput && (
              <form
                onSubmit={handleInputBoxSubmit}
                className="absolute right-0 mt-2 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 flex gap-2 items-center min-w-[180px]"
                style={{ minWidth: 180 }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  minLength={1}
                  value={inputValue}
                  onChange={handleInputChange}
                  className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                  placeholder="Target (km)"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleInputBoxClose}
                  className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="flex flex-row items-center justify-between mt-6">
          {/* Arc/Chart on the left */}
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>
          {/* All milestones in a single card on the right */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col gap-3 ml-8 w-full max-w-xs">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center w-full block">Milestones</span>
            {milestones.map((milestone) => (
              <Badge
                key={milestone}
                color={currentKm >= milestone ? "success" : "light"}
                variant={currentKm >= milestone ? "solid" : "light"}
                startIcon={currentKm >= milestone ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 16 16"><path d="M4 8.5l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : null}
              >
                {milestone} km
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
