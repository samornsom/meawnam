import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, PackagePlus, Menu, X } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { Transaction } from './types';

// Helper to generate dynamic dates
const getRelativeDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysOffset);
  return date.toISOString().split('T')[0];
};

// Mock Data with dynamic dates and cost
const MOCK_DATA: Transaction[] = [
  // Today
  { id: '1', date: getRelativeDate(0), productName: 'เสื้อยืด Oversize', category: 'เสื้อผ้า', price: 250, cost: 120, quantity: 2, platform: 'TikTok', status: 'Completed' },
  { id: '2', date: getRelativeDate(0), productName: 'ลิปสติก Matte', category: 'ความงาม', price: 199, cost: 80, quantity: 1, platform: 'Shopee', status: 'Completed' },
  { id: '3', date: getRelativeDate(0), productName: 'น้ำพริกกากหมู', category: 'อาหาร', price: 89, cost: 50, quantity: 10, platform: 'Facebook', status: 'Completed' },
  
  // This Week
  { id: '4', date: getRelativeDate(1), productName: 'เซรั่มหน้าใส', category: 'ความงาม', price: 450, cost: 200, quantity: 3, platform: 'Line', status: 'Completed' },
  { id: '5', date: getRelativeDate(2), productName: 'กางเกงยีนส์ขาสั้น', category: 'เสื้อผ้า', price: 390, cost: 180, quantity: 1, platform: 'Lazada', status: 'Completed' },
  { id: '6', date: getRelativeDate(3), productName: 'ขนมเปี๊ยะลาวา', category: 'อาหาร', price: 120, cost: 70, quantity: 5, platform: 'Facebook', status: 'Completed' },
  { id: '7', date: getRelativeDate(4), productName: 'เสื้อยืด Oversize', category: 'เสื้อผ้า', price: 250, cost: 120, quantity: 1, platform: 'Shopee', status: 'Completed' },
  
  // Older
  { id: '8', date: getRelativeDate(10), productName: 'เดรสเกาหลี', category: 'เสื้อผ้า', price: 590, cost: 300, quantity: 1, platform: 'TikTok', status: 'Completed' },
  { id: '9', date: getRelativeDate(15), productName: 'ครีมกันแดด', category: 'ความงาม', price: 290, cost: 150, quantity: 2, platform: 'Line', status: 'Completed' },
  { id: '10', date: getRelativeDate(20), productName: 'เสื้อยืด Oversize', category: 'เสื้อผ้า', price: 250, cost: 120, quantity: 5, platform: 'TikTok', status: 'Completed' },
  { id: '11', date: getRelativeDate(25), productName: 'หูฟังบลูทูธ', category: 'ของใช้', price: 890, cost: 450, quantity: 2, platform: 'Shopee', status: 'Completed' },
  { id: '12', date: getRelativeDate(32), productName: 'กระเป๋าผ้า', category: 'เสื้อผ้า', price: 150, cost: 60, quantity: 5, platform: 'Lazada', status: 'Completed' },
];

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-indigo-600 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const AppContent = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_DATA);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const addTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center space-x-2 mb-10">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-gray-800">MerchantInsight</span>
          </div>
          
          <nav className="flex-1 space-y-2">
            <SidebarItem to="/" icon={LayoutDashboard} label="ภาพรวมผลกำไร" />
            <SidebarItem to="/list" icon={List} label="รายการขาย" />
            <SidebarItem to="/add" icon={PackagePlus} label="บันทึกยอด/ต้นทุน" />
          </nav>

          <div className="mt-auto p-4 bg-indigo-50 rounded-xl">
            <p className="text-xs text-indigo-600 font-semibold mb-1">PRO TIP</p>
            <p className="text-xs text-indigo-800">
              ใส่ต้นทุนให้ครบถ้วน เพื่อให้ AI ช่วยคำนวณกำไรสุทธิได้อย่างแม่นยำ
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto pt-16 lg:pt-0">
          <Routes>
            <Route path="/" element={<Dashboard transactions={transactions} />} />
            <Route path="/list" element={<TransactionList transactions={transactions} />} />
            <Route path="/add" element={<TransactionForm onAdd={addTransaction} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;