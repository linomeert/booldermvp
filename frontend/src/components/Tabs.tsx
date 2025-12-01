import { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children?: ReactNode;
}

export const Tabs = ({ tabs, activeTab, onTabChange, children }: TabsProps) => {
  return (
    <div>
      <div className="border-b bg-white rounded-lg shadow-md overflow-x-auto scrollbar-hide">
        <nav className="-mb-px flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? "border-[#cc2b5e] text-[#cc2b5e]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
};
