import React, { useState } from 'react';
import { Transaction } from '../types';
import { PlusCircle } from 'lucide-react';

interface TransactionFormProps {
  onAdd: (transaction: Transaction) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    platform: 'TikTok',
    status: 'Completed',
    category: 'เสื้อผ้า'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productName && formData.price && formData.quantity && formData.cost !== undefined) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: formData.date || new Date().toISOString().split('T')[0],
        productName: formData.productName,
        category: formData.category || 'ทั่วไป',
        price: Number(formData.price),
        cost: Number(formData.cost),
        quantity: Number(formData.quantity),
        platform: formData.platform as any,
        status: formData.status as any
      };
      onAdd(newTransaction);
      // Reset critical fields but keep date/platform for ease of entry
      setFormData(prev => ({ ...prev, productName: '', price: 0, cost: 0, quantity: 1 }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <PlusCircle className="w-5 h-5 mr-2 text-indigo-600" />
        บันทึกรายการขายและต้นทุน
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">วันที่</label>
          <input
            type="date"
            required
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า</label>
          <input
            type="text"
            required
            placeholder="เช่น เสื้อยืดสีขาว"
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.productName || ''}
            onChange={e => setFormData({ ...formData, productName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
          <select
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="เสื้อผ้า">เสื้อผ้า</option>
            <option value="ความงาม">ความงาม</option>
            <option value="อาหาร">อาหาร</option>
            <option value="ของใช้">ของใช้</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">แพลตฟอร์ม</label>
          <select
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.platform}
            onChange={e => setFormData({ ...formData, platform: e.target.value as any })}
          >
            <option value="TikTok">TikTok</option>
            <option value="Shopee">Shopee</option>
            <option value="Lazada">Lazada</option>
            <option value="Facebook">Facebook</option>
            <option value="Line">Line OA</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ต้นทุน (บาท)</label>
          <input
            type="number"
            min="0"
            required
            placeholder="0"
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
            value={formData.cost === 0 ? '' : formData.cost}
            onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ราคาขาย (บาท)</label>
          <input
            type="number"
            min="0"
            required
            placeholder="0"
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.price === 0 ? '' : formData.price}
            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">จำนวน</label>
          <input
            type="number"
            min="1"
            required
            placeholder="1"
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.quantity || ''}
            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3 flex items-end">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm flex justify-center items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            บันทึกรายการ
          </button>
        </div>
      </form>
    </div>
  );
};