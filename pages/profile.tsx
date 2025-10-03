import { GetServerSideProps } from 'next';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ProfileProps {
  firstname: string;
  lastname: string;
  company_department: string;
  course: string;
}

export default function ProfilePage({ firstname, lastname, company_department, course }: ProfileProps) {
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <h1>Profile</h1>
      <p><b>Name:</b> {firstname} {lastname}</p>
      <p><b>Department:</b> {company_department}</p>
      <p><b>Course:</b> {course}</p>
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
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    // Fetch user info from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('firstname, lastname, company_department, course')
      .eq('id', decoded.userId)
      .single();
    if (error || !user) throw new Error('User not found');
    return { props: user };
  } catch {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};
