import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const SalesChart = ({ orders = [] }) => {
  const safeOrders = Array.isArray(orders) ? orders : [];

  const data = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateKey = d.toISOString().split('T')[0];

    const dailyTotal = safeOrders
      .filter((order) => {
        const orderDate = order.created_at || order.createdAt || '';
        return typeof orderDate === 'string' && orderDate.startsWith(dateKey);
      })
      .reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    data.push({ name: dayName, sales: dailyTotal });
  }

  const formatY = (value) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-6 lg:p-8">
      <div className="mb-5 flex flex-col gap-1">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
          Revenue Overview
        </h3>
        <p className="text-sm text-slate-500">Last 7 days performance</p>
      </div>

      <div className="h-[280px] sm:h-[320px] lg:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <YAxis
              width={88}
              tickFormatter={formatY}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [formatY(value), 'Revenue']}
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              }}
              labelStyle={{ color: '#0F172A', fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#6D28D9"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default SalesChart;
