'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'

interface AdminUser {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  _count: { conversations: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const limit = 20

  useEffect(() => {
    let cancelled = false
    fetch(`/api/admin/users?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setUsers(data.users)
          setTotal(data.total)
          setIsLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error(err)
          setIsLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [page])

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (err) {
      console.error('Role change error:', err)
    }
  }

  const columns = [
    { key: 'name', header: 'Name', render: (u: AdminUser) => u.name || '-' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (u: AdminUser) => (
      <select
        value={u.role}
        onChange={e => handleRoleChange(u.id, e.target.value)}
        className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
      >
        <option value="user">user</option>
        <option value="admin">admin</option>
        <option value="moderator">moderator</option>
      </select>
    )},
    { key: 'conversations', header: 'Chats', render: (u: AdminUser) => u._count.conversations },
    { key: 'createdAt', header: 'Joined', render: (u: AdminUser) => new Date(u.createdAt).toLocaleDateString() },
  ]

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users ({total})</h1>
      </div>

      <DataTable data={users} columns={columns} isLoading={isLoading} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
