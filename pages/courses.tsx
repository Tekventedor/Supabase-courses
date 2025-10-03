import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Member = {
  id: string;
  firstname: string;
  lastname: string;
  company_department: string;
};

export default function CoursesPage() {
  const [course1Members, setCourse1Members] = useState<Member[]>([]);
  const [course2Members, setCourse2Members] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout');
    router.push('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: c1, error: e1 } = await supabase.from('users').select('*').eq('course', 'course1');
        const { data: c2, error: e2 } = await supabase.from('users').select('*').eq('course', 'course2');
        if (e1 || e2) {
          setError('Failed to fetch data');
        } else {
          setCourse1Members(c1 || []);
          setCourse2Members(c2 || []);
        }
      } catch (err) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Course Members</h1>
        <button onClick={handleLogout} style={{ padding: '6px 16px' }}>Logout</button>
      </div>
      <section>
        <h2>Course 1</h2>
        <ul>
          {course1Members.map(member => (
            <li key={member.id}>
              {member.firstname} {member.lastname} — {member.company_department}
            </li>
          ))}
        </ul>
      </section>
      <section style={{ marginTop: 32 }}>
        <h2>Course 2</h2>
        <ul>
          {course2Members.map(member => (
            <li key={member.id}>
              {member.firstname} {member.lastname} — {member.company_department}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;
  const cookie = req.headers.cookie || '';
  const tokenMatch = cookie.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return { props: {} };
  } catch {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};
