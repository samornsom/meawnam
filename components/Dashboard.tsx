import React, { useMemo, useState } from 'react';
import { Transaction, SalesInsight } from '../types';
import { StatsCard } from './StatsCard';
import { DollarSign, ShoppingBag, TrendingUp, Package, Sparkles, Loader2, Calendar, Coins, PieChart as PieIcon } from 'lucide-react';
import { ComposedChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { analyzeSalesData } from '../services/geminiService';

interface DashboardProps {
  transactions: Transaction[];
}

const PLATFORM_COLORS: Record<string, string> = {
  'Shopee': '#EE4D2D', 
  'Lazada': '#0f4c81', 
  'TikTok': '#000000', 
  'Line': '#06C755', 
  'Facebook': '#1877F2', 
  'Other': '#9CA3AF'
};

const DEFAULT_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

type TimeRange = 'today' | 'week' | 'month' | 'all';

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const [insight, setInsight] = useState<SalesInsight | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Filter Transactions based on Time Range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return transactions.filter(t => {
      const tDate = new Date(t.date).getTime();
      
      if (timeRange === 'today') {
        return tDate >= todayStart;
      } else if (timeRange === 'week') {
        const weekAgo = new Date(todayStart);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return tDate >= weekAgo.getTime();
      } else if (timeRange === 'month') {
        const monthAgo = new Date(todayStart);
        monthAgo.setDate(monthAgo.getDate() - 30);
        return tDate >= monthAgo.getTime();
      }
      return true;
    });
  }, [transactions, timeRange]);

  // Calculate Stats
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalProfit = 0;
    
    filteredTransactions.forEach(t => {
      const revenue = t.price * t.quantity;
      const cost = t.cost * t.quantity;
      totalRevenue += revenue;
      totalProfit += (revenue - cost);
    });

    const totalOrders = filteredTransactions.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Top product by Profit
    const productProfit: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      const profit = (t.price - t.cost) * t.quantity;
      productProfit[t.productName] = (productProfit[t.productName] || 0) + profit;
    });
    const topProduct = Object.entries(productProfit).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    return { totalRevenue, totalProfit, totalOrders, avgOrderValue, topProduct };
  }, [filteredTransactions]);

  // Chart: Trend (Revenue vs Profit)
  const trendData = useMemo(() => {
    const data: Record<string, { revenue: number, profit: number }> = {};
    filteredTransactions.forEach(t => {
      const date = t.date; 
      const revenue = t.price * t.quantity;
      const profit = (t.price - t.cost) * t.quantity;
      
      if (!data[date]) data[date] = { revenue: 0, profit: 0 };
      data[date].revenue += revenue;
      data[date].profit += profit;
    });
    return Object.entries(data)
      .map(([name, val]) => ({ name, revenue: val.revenue, profit: val.profit }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredTransactions]);

  // Chart: Platform Breakdown
  const platformData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      data[t.platform] = (data[t.platform] || 0) + (t.price * t.quantity);
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Chart: Product Breakdown (Top 5 by Profit)
  const productData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      const profit = (t.price - t.cost) * t.quantity;
      data[t.productName] = (data[t.productName] || 0) + profit;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredTransactions]);

  const handleAnalyze = async () => {
    setLoadingAi(true);
    try {
      const result = await analyzeSalesData(filteredTransactions.length > 0 ? filteredTransactions : transactions);
      setInsight(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">สรุปผลกำไร</h2>
          <p className="text-gray-500 text-sm">วิเคราะห์รายรับ รายจ่าย และกำไรสุทธิ</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(['all', 'month', 'week', 'today'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
                timeRange === range
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {range === 'all' && 'ทั้งหมด'}
              {range === 'month' && 'เดือนนี้'}
              {range === 'week' && 'สัปดาห์นี้'}
              {range === 'today' && 'วันนี้'}
            </button>
          ))}
          
          <button
            onClick={handleAnalyze}
            disabled={loadingAi || filteredTransactions.length === 0}
            className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-2"
          >
            {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="hidden md:inline">วิเคราะห์กำไร</span>
          </button>
        </div>
      </div>

      {/* AI Insight */}
      {insight && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
            AI Insight ({timeRange === 'all' ? 'ภาพรวมทั้งหมด' : timeRange})
          </h3>
          <div className="grid md:grid-cols-3 gap-6 relative z-10">
             <div className="bg-white/70 p-4 rounded-lg backdrop-blur-sm border border-white/50">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">สรุปผลกำไร</span>
                <p className="text-gray-800 mt-1 text-sm leading-relaxed">{insight.summary}</p>
             </div>
             <div className="bg-white/70 p-4 rounded-lg backdrop-blur-sm border border-white/50">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">จุดทำเงิน</span>
                <p className="text-gray-800 mt-1 text-sm leading-relaxed">{insight.trend}</p>
             </div>
             <div className="bg-white/70 p-4 rounded-lg backdrop-blur-sm border border-white/50">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">ข้อแนะนำ</span>
                <p className="text-gray-800 mt-1 text-sm leading-relaxed">{insight.recommendation}</p>
             </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="ยอดขายรวม (Revenue)" 
          value={`฿${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="text-blue-600 bg-blue-100" 
        />
        <StatsCard 
          title="กำไรสุทธิ (Profit)" 
          value={`+฿${stats.totalProfit.toLocaleString()}`} 
          icon={Coins} 
          color="text-emerald-600 bg-emerald-100" 
        />
        <StatsCard 
          title="กำไรต่อบิลเฉลี่ย" 
          value={`฿${stats.totalOrders > 0 ? (stats.totalProfit / stats.totalOrders).toFixed(0) : 0}`} 
          icon={TrendingUp} 
          color="text-amber-600 bg-amber-100" 
        />
        <StatsCard 
          title="สินค้าทำกำไรสูงสุด" 
          value={stats.topProduct} 
          icon={Package} 
          color="text-rose-600 bg-rose-100" 
        />
      </div>

      {/* Charts Row 1: Revenue vs Profit Trend */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-gray-500" />
          ผลการดำเนินงาน (ยอดขาย vs กำไร)
        </h3>
        <div className="h-80">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#9ca3af" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#9ca3af" tickFormatter={(value) => `฿${value}`} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  formatter={(value: number, name: string) => [
                    `฿${value.toLocaleString()}`, 
                    name === 'revenue' ? 'ยอดขาย' : 'กำไร'
                  ]}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" />
                <Bar dataKey="revenue" name="Revenue" fill="#93C5FD" barSize={30} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">ไม่มีข้อมูลในช่วงเวลานี้</div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Platform Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
             <PieIcon className="w-5 h-5 mr-2 text-gray-500" />
             สัดส่วนยอดขายตามช่องทาง
          </h3>
          <div className="h-64">
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PLATFORM_COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `฿${value.toLocaleString()}`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
            )}
          </div>
        </div>

        {/* Product Profit Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
            Top 5 สินค้ากำไรสูง
          </h3>
          <div className="h-64">
            {productData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    formatter={(value: number) => [`฿${value.toLocaleString()}`, 'กำไรสุทธิ']}
                  />
                  <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};