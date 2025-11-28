import React from 'react';
import { Transaction } from '../types';
import { Search } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredTransactions = transactions.filter(t => 
    t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-800">รายการขายล่าสุด</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="px-6 py-3">วันที่</th>
              <th className="px-6 py-3">สินค้า</th>
              <th className="px-6 py-3">แพลตฟอร์ม</th>
              <th className="px-6 py-3 text-right">ทุน/ชิ้น</th>
              <th className="px-6 py-3 text-right">ขาย/ชิ้น</th>
              <th className="px-6 py-3 text-center">จำนวน</th>
              <th className="px-6 py-3 text-right">ยอดรวม</th>
              <th className="px-6 py-3 text-right text-emerald-600">กำไร</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => {
                const totalRevenue = t.price * t.quantity;
                const totalCost = t.cost * t.quantity;
                const profit = totalRevenue - totalCost;

                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{t.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{t.productName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs border ${
                        t.platform === 'Shopee' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        t.platform === 'Lazada' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        t.platform === 'TikTok' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                        t.platform === 'Line' ? 'bg-green-50 text-green-600 border-green-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {t.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">฿{t.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">฿{t.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">{t.quantity}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-800">
                      ฿{totalRevenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      +฿{profit.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  ไม่พบข้อมูลรายการขาย
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};