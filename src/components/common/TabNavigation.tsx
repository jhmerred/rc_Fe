'use client';

interface Tab {
  id: string;
  label: string;
  value: any;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: any;
  onTabChange: (value: any) => void;
  className?: string;
}

export default function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}: TabNavigationProps) {
  return (
    <nav className={`flex space-x-2 rounded-t-lg bg-white pb-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.value)}
          className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === tab.value
              ? "border-gray-600 text-gray-800"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}