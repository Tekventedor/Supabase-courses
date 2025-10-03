import { GetServerSideProps } from 'next';
import { useState } from 'react';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  company_department: string;
  course: string;
}

interface AdminProps {
  users: User[];
  admin: boolean;
}

export default function AdminPage({ users: initialUsers, admin }: AdminProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [error, setError] = useState('');

  const handleDelete = async (id: string) => {
    setError('');
    const res = await fetch(`/api/admin-delete-user?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== id));
    } else {
      setError('Failed to delete user');
    }
  };

  if (!admin) return <div>Access denied</div>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1>Admin: Manage Users</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Department</th>
            <th>Course</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.firstname} {user.lastname}</td>
              <td>{user.company_department}</td>
              <td>{user.course}</td>
              <td>
                <button onClick={() => handleDelete(user.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const cookie = req.headers.cookie || '';
  const tokenMatch = cookie.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

  if (!token) {
    return { props: { users: [], admin: false } };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    if (decoded.username !== 'admin') {
      return { props: { users: [], admin: false } };
    }
    // Fetch all users
    const { data: users, error } = await supabase.from('users').select('*');
    if (error || !users) throw new Error('Failed to fetch users');
    return { props: { users, admin: true } };
  } catch {
    return { props: { users: [], admin: false } };
  }
};
