import React, { useEffect, useState } from 'react'
import {
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
} from 'lucide-react'
import SalesChart from './SalesChart'
import { api } from '../../lib/api'

const AdminOverview = ({ orders = [] }) => {
  const [fetchedOrders, setFetchedOrders] = useState([])

  useEffect(() => {
    api.get('/admin/orders')
      .then((res) => {
        const data = res?.data?.orders ?? res?.data ?? []
        setFetchedOrders(Array.isArray(data) ? data : [])
      })
      .catch((err) => console.warn('Overview fetch failed', err))
  }, [])

  const safeOrders = Array.isArray(orders) && orders.length > 0 ? orders : fetchedOrders

  const totalRevenue = safeOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
  const pendingOrders = safeOrders.filter(o => (o.fulfillmentStatus || o.status || '').toString().toLowerCase() === 'pending').length
  const shippedOrders = safeOrders.filter(o => (o.fulfillmentStatus || o.status || '').toString().toLowerCase() === 'shipped').length
  const deliveredOrders = safeOrders.filter(o => (o.fulfillmentStatus || o.status || '').toString().toLowerCase() === 'delivered').length

  const formatCurrency = (val) => {
    const n = Number(val || 0)
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">Overview of store performance</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{safeOrders.length}</h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Package className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{pendingOrders}</h3>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Shipped</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{shippedOrders}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Delivered</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{deliveredOrders}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <SalesChart orders={safeOrders} />
      </div>
    </div>
  )
}

export default AdminOverview
