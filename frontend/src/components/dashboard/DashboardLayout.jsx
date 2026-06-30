import TopNavBar from "./TopNavBar.jsx";

export default function DashboardLayout({ children, activeTab, isMarketOpen }) {
  return (
    <div className="min-h-screen bg-surface">
      <TopNavBar activeTab={activeTab} isMarketOpen={isMarketOpen} />

      <main className="pt-[88px] px-lg pb-lg max-w-[1920px] mx-auto h-[calc(100vh-16px)]">
        <div className="flex flex-col lg:flex-row gap-gutter h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
