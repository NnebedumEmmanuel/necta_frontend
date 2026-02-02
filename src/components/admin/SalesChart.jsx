import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const SalesChart = ({ orders = [] }) => {
  // 1. Safe Guard: Ensure orders is an array
  const safeOrders = Array.isArray(orders) ? orders : []

  // 2. Generate Last 7 Days Data
  const data = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)

    // Get clear formats
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dateKey = d.toISOString().split('T')[0]

    // 3. Calculate Daily Total
    const dailyTotal = safeOrders
      .filter((order) => {
        const orderDate = order.created_at || order.createdAt || ''
        return typeof orderDate === 'string' && orderDate.startsWith(dateKey)
      })
      .reduce((sum, order) => sum + (Number(order.total) || 0), 0)

    data.push({ name: dayName, sales: dailyTotal })
  }

  const formatY = (value) => `₦${Number(value).toLocaleString('en-NG')}`

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Overview (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={formatY} />
          <Tooltip formatter={(value) => [formatY(value), 'Sales']} />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SalesChart
