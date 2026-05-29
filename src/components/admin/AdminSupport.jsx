import React, { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useToast } from '@/context/ToastProvider'

export default function AdminSupport() {
  const { showToast } = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/admin/support-tickets')
      const rows = res?.data?.data || []
      setTickets(Array.isArray(rows) ? rows : [])
    } catch (err) {
      console.error('Failed to load admin support tickets', err)
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const filtered = tickets.filter((ticket) => {
    if (filter === 'all') return true
    if (filter === 'open') return (ticket.status || 'open').toLowerCase() !== 'resolved'
    if (filter === 'resolved') return (ticket.status || 'open').toLowerCase() === 'resolved'
    return true
  })

  const statusBadge = (status) => {
    const key = (status || 'open').toLowerCase()
    if (key === 'resolved') return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Resolved</span>
    if (key === 'in_progress') return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">In Progress</span>
    return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Open</span>
  }

  async function changeStatus(id, newStatus) {
    setUpdatingId(id)
    try {
      const res = await api.patch(`/admin/support-tickets/${id}`, { status: (newStatus || 'open').toLowerCase() })
      const updated = res?.data?.data
      setTickets((rows) => rows.map((ticket) => ticket.id === id ? (updated || { ...ticket, status: newStatus }) : ticket))
      if (selectedTicket?.id === id) setSelectedTicket(updated || { ...selectedTicket, status: newStatus })
      showToast?.('Ticket status updated', 'success')
    } catch (err) {
      console.error('Failed to update ticket status', err)
      showToast?.(err?.message || 'Failed to update status', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  function openTicket(ticket) {
    setSelectedTicket(ticket)
    setReplyText('')
  }

  function closeTicket() {
    setSelectedTicket(null)
    setReplyText('')
  }

  async function sendReply() {
    if (!selectedTicket) return
    if (!replyText.trim()) return showToast?.('Reply cannot be empty', 'error')
    setSendingReply(true)
    try {
      const res = await api.post(`/admin/support-tickets/${selectedTicket.id}/replies`, { message: replyText.trim() })
      const updated = res?.data?.data
      if (updated) {
        setSelectedTicket(updated)
        setTickets((rows) => rows.map((ticket) => ticket.id === updated.id ? updated : ticket))
      }
      setReplyText('')
      showToast?.('Reply sent', 'success')
    } catch (err) {
      console.error('Failed to send reply', err)
      showToast?.(err?.message || 'Failed to send reply', 'error')
    } finally {
      setSendingReply(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Support Tickets</h2>
          <p className="text-sm text-slate-500">Manage customer support tickets</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md ${filter==='all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
          <button onClick={() => setFilter('open')} className={`px-3 py-1 rounded-md ${filter==='open' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Open</button>
          <button onClick={() => setFilter('resolved')} className={`px-3 py-1 rounded-md ${filter==='resolved' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Resolved</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="text-left text-sm text-slate-600 border-b">
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Subject</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center">Loading tickets...</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="py-8 text-center text-red-600">{String(error)}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">No tickets found.</td></tr>
            ) : (
              filtered.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">{statusBadge(ticket.status)}</td>
                  <td className="py-3 px-3 font-medium">{ticket.subject}</td>
                  <td className="py-3 px-3">{ticket.users?.email || ticket.email || '-'}</td>
                  <td className="py-3 px-3">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '-'}</td>
                  <td className="py-3 px-3 flex items-center gap-2">
                    <button onClick={() => openTicket(ticket)} className="text-sm px-3 py-1 rounded-md bg-white/10 hover:bg-white/20">View Details</button>
                    <select value={(ticket.status || 'open').toLowerCase()} onChange={(e) => changeStatus(ticket.id, e.target.value)} disabled={updatingId === ticket.id} className="border p-2 rounded-md">
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <div className="fixed right-6 top-12 bottom-6 w-[480px] bg-white rounded-2xl shadow-xl border z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
              <div className="text-sm text-slate-500">{selectedTicket.users?.name || selectedTicket.users?.email || selectedTicket.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <select value={(selectedTicket.status || 'open').toLowerCase()} onChange={(e) => changeStatus(selectedTicket.id, e.target.value)} className="border p-2 rounded-md">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <button onClick={closeTicket} className="ml-2 text-sm px-2 py-1 bg-gray-100 rounded">Close</button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            <div className="text-sm text-slate-700">
              <div className="font-medium mb-2">Original Message</div>
              <div className="whitespace-pre-wrap text-sm text-slate-600">{selectedTicket.message || '-'}</div>
            </div>

            <div className="space-y-3">
              <div className="font-medium">Replies</div>
              {(selectedTicket.replies || []).length === 0 ? (
                <div className="text-sm text-slate-500">No replies yet.</div>
              ) : (
                selectedTicket.replies.map((reply) => (
                  <div key={`${reply.id || 'reply'}-${reply.created_at || 'item'}`} className={`p-3 rounded-md ${reply.is_admin_reply ? 'bg-blue-50' : 'bg-slate-100'}`}>
                    <div className="text-xs text-slate-500">{reply.is_admin_reply ? 'Admin' : 'Customer'} - {reply.created_at ? new Date(reply.created_at).toLocaleString() : ''}</div>
                    <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{reply.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-1 border rounded px-3 py-2" />
              <button onClick={sendReply} disabled={sendingReply} className="px-4 py-2 bg-indigo-600 text-white rounded">
                {sendingReply ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
