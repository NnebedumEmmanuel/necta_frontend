import React, { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { useToast } from '../../context/useToastHook'

export default function AdminSupport() {
  const { showToast } = useToast()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all | open | resolved
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replies, setReplies] = useState([])
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    setLoading(true)
    setError(null)
    try {
      // include the joined users row (email, name, phone)
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, users(email, name, phone)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTickets(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load admin support tickets', err)
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const filtered = tickets.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'open') return (t.status || 'open').toLowerCase() !== 'resolved'
    if (filter === 'resolved') return (t.status || 'open').toLowerCase() === 'resolved'
    return true
  })

  const statusBadge = (s) => {
    const key = (s || 'open').toLowerCase()
    if (key === 'resolved') return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Resolved</span>
    return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Open</span>
  }

  async function changeStatus(id, newStatus) {
    setUpdatingId(id)
    try {
      const { error } = await supabase.from('support_tickets').update({ status: (newStatus || 'open').toLowerCase() }).eq('id', id)
      if (error) throw error
      showToast?.('Ticket status updated', 'success')
      await fetchTickets()
      // if the currently-selected ticket was updated, reflect the change locally
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket({ ...selectedTicket, status: (newStatus || 'open').toLowerCase() })
      }
    } catch (err) {
      console.error('Failed to update ticket status', err)
      showToast?.(err?.message || 'Failed to update status', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  // Open ticket details and load replies
  async function openTicket(ticket) {
    setSelectedTicket(ticket)
    await fetchReplies(ticket.id)
  }

  function closeTicket() {
    setSelectedTicket(null)
    setReplies([])
    setReplyText('')
  }

  async function fetchReplies(ticketId) {
    setRepliesLoading(true)
    try {
      const { data, error } = await supabase
        .from('support_replies')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setReplies(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch replies', err)
      showToast?.(err?.message || 'Failed to load replies', 'error')
    } finally {
      setRepliesLoading(false)
    }
  }

  async function sendReply() {
    if (!selectedTicket) return
    if (!replyText.trim()) return showToast?.('Reply cannot be empty', 'error')
    setSendingReply(true)
    try {
      const payload = {
        ticket_id: selectedTicket.id,
        message: replyText.trim(),
        is_admin_reply: true,
      }

      const { data, error } = await supabase.from('support_replies').insert(payload).select().single()
      if (error) throw error

      // If ticket was open, mark as in_progress
      if ((selectedTicket.status || 'open').toLowerCase() === 'open') {
        const { error: upErr } = await supabase.from('support_tickets').update({ status: 'in_progress' }).eq('id', selectedTicket.id)
        if (upErr) throw upErr
        // reflect locally
        setSelectedTicket({ ...selectedTicket, status: 'in_progress' })
      }

      // append new reply and clear input
      setReplies((r) => [...r, data])
      setReplyText('')
      showToast?.('Reply sent', 'success')
      await fetchTickets()
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
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">{statusBadge(t.status)}</td>
                  <td className="py-3 px-3 font-medium">{t.subject}</td>
                  <td className="py-3 px-3">{(t.users && t.users.email) || t.email || '—'}</td>
                  <td className="py-3 px-3">{t.created_at ? new Date(t.created_at).toLocaleString() : '—'}</td>
                  <td className="py-3 px-3 flex items-center gap-2">
                    <button
                      onClick={() => openTicket(t)}
                      className="text-sm px-3 py-1 rounded-md bg-white/10 hover:bg-white/20"
                    >
                      View Details
                    </button>
                    <select
                      value={(t.status || 'open').toLowerCase()}
                      onChange={(e) => changeStatus(t.id, e.target.value)}
                      disabled={updatingId === t.id}
                      className="border p-2 rounded-md"
                    >
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
      
      {/* Details / Replies panel */}
      {selectedTicket && (
        <div className="fixed right-6 top-12 bottom-6 w-[480px] bg-white rounded-2xl shadow-xl border z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
              <div className="text-sm text-slate-500">{(selectedTicket.users && (selectedTicket.users.name || selectedTicket.users.email)) || selectedTicket.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={(selectedTicket.status || 'open').toLowerCase()}
                onChange={(e) => changeStatus(selectedTicket.id, e.target.value)}
                className="border p-2 rounded-md"
              >
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
              <div className="whitespace-pre-wrap text-sm text-slate-600">{selectedTicket.message || selectedTicket.body || selectedTicket.description || '—'}</div>
            </div>

            <div className="space-y-3">
              <div className="font-medium">Replies</div>
              {repliesLoading ? (
                <div className="text-sm text-slate-500">Loading replies...</div>
              ) : replies.length === 0 ? (
                <div className="text-sm text-slate-500">No replies yet.</div>
              ) : (
                replies.map((r) => (
                  <div key={r.id} className={`p-3 rounded-md ${r.is_admin_reply ? 'bg-blue-50 self-end' : 'bg-slate-100'}`}>
                    <div className="text-xs text-slate-500">{r.is_admin_reply ? 'Admin' : 'Customer'} • {r.created_at ? new Date(r.created_at).toLocaleString() : ''}</div>
                    <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{r.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                onClick={sendReply}
                disabled={sendingReply}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                {sendingReply ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}