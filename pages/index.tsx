import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: 40, maxWidth: 500, margin: '0 auto' }}>
      <h1>Welcome to Supabase Courses</h1>
      <p>This is the portal for course members and admins.</p>
      <div style={{ marginTop: 24 }}>
        <Link href="/login"><button style={{ marginRight: 12 }}>Login</button></Link>
        <Link href="/courses"><button>View Courses</button></Link>
      </div>
    </div>
  );
}
