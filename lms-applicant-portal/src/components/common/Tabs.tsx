interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
            ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
