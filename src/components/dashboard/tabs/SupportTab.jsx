import React, { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastProvider'

export default function SupportTab() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [openNew, setOpenNew] = useState(false)
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState('low')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/me/tickets')
      const rows = res?.data?.data || res?.data?.items || []
      setTickets(Array.isArray(rows) ? rows : [])
    } catch (err) {
      console.error('Failed to fetch support tickets', err)
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
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

  async function sendReply(e) {
    e?.preventDefault()
    if (!selectedTicket) return
    if (!replyText.trim()) return showToast?.('Reply cannot be empty', 'error')
    setSendingReply(true)
    try {
      const res = await api.post(`/me/tickets/${selectedTicket.id}/replies`, { message: replyText.trim() })
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

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user?.id) return showToast?.('Please sign in to open a ticket', 'error')
    if (!subject.trim() || !message.trim()) return showToast?.('Please enter subject and message', 'error')

    setSubmitting(true)
    try {
      const res = await api.post('/me/tickets', { subject: subject.trim(), priority, message: message.trim() })
      const created = res?.data?.data
      if (created) setTickets((rows) => [created, ...rows])
      setOpenNew(false)
      setSubject('')
      setPriority('low')
      setMessage('')
      showToast?.('Ticket created successfully', 'success')
    } catch (err) {
      console.error('Failed to create ticket', err)
      showToast?.(err?.message || 'Failed to create ticket', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return '-'
    try { return new Date(d).toLocaleString() } catch { return String(d) }
  }

  const priorityBadge = (p) => {
    const key = (p || '').toLowerCase()
    if (key === 'high') return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">High</span>
    if (key === 'medium') return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">Medium</span>
    return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">Low</span>
  }

  const statusBadge = (s) => {
    const key = (s || '').toLowerCase()
    if (key === 'resolved') return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Resolved</span>
    if (key === 'in_progress') return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">In Progress</span>
    return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Open</span>
  }

  const replies = selectedTicket?.replies || []

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {selectedTicket ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button onClick={closeTicket} className="text-sm text-indigo-600 hover:underline">Back to Tickets</button>
              <h2 className="text-xl font-bold mt-2">{selectedTicket.subject}</h2>
              <p className="text-sm text-slate-500">{statusBadge(selectedTicket.status || 'open')}</p>
            </div>
            <button onClick={() => setOpenNew(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Open New Ticket</button>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50 rounded-lg">
            <div className="mb-2">
              <div className="text-sm text-slate-600 font-medium">Original Message</div>
              <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{selectedTicket.message || '-'}</div>
            </div>

            <div className="space-y-3">
              {replies.length === 0 ? (
                <div className="text-sm text-slate-500">No replies yet.</div>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className={`flex ${reply.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] p-3 text-sm ${reply.is_admin_reply ? 'bg-gray-100 text-black rounded-lg rounded-tr-none' : 'bg-blue-600 text-white rounded-lg rounded-tl-none'}`}>
                      {reply.is_admin_reply && <div className="text-xs text-slate-500 mb-1">Support Agent</div>}
                      <div className="whitespace-pre-wrap">{reply.message}</div>
                      <div className={`text-xs mt-2 ${reply.is_admin_reply ? 'text-slate-500' : 'text-slate-200'}`}>{formatDate(reply.created_at)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={sendReply} className="mt-4">
            <div className="flex items-center gap-2">
              <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type a reply..." className="flex-1 border rounded-full px-4 py-2 shadow-sm" />
              <button type="submit" disabled={sendingReply} className="px-4 py-2 bg-indigo-600 text-white rounded-full">
                {sendingReply ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Support Tickets</h2>
              <p className="text-sm text-slate-500">View and open support tickets</p>
            </div>
            <button onClick={() => setOpenNew(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Open New Ticket</button>
          </div>

          {openNew && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setOpenNew(false)} />
              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 z-10">
                <h3 className="text-lg font-semibold mb-4">Open New Ticket</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-3">
                    <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="border p-3 rounded-lg w-full" />
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border p-3 rounded-lg w-full">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Message" className="border p-3 rounded-lg w-full" />
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button type="button" onClick={() => setOpenNew(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                      <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{submitting ? 'Submitting...' : 'Submit Ticket'}</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] mt-4">
              <thead>
                <tr className="text-left text-sm text-slate-600 border-b">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={4} className="py-8 text-center">Loading tickets...</td></tr>
                ) : error ? (
                  <tr><td colSpan={4} className="py-8 text-center text-red-600">{String(error)}</td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-500">No tickets found.</td></tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-sm text-slate-700">{formatDate(ticket.created_at)}</td>
                      <td className="py-3 px-3 text-sm text-slate-800">{ticket.subject}</td>
                      <td className="py-3 px-3">{priorityBadge(ticket.priority)}</td>
                      <td className="py-3 px-3 flex items-center gap-2">
                        {statusBadge(ticket.status || 'open')}
                        <button onClick={() => openTicket(ticket)} className="ml-2 text-sm px-3 py-1 rounded-md bg-white/10 hover:bg-white/20">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
