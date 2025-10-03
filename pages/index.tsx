import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
      <h1>Supabase Courses Portal</h1>
      <p>Welcome. Use the links below to navigate.</p>

      <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
        <Link href="/login"><button>Login</button></Link>
        <Link href="/courses"><button>View Courses</button></Link>
        <Link href="/profile"><button>My Profile</button></Link>
        <Link href="/admin"><button>Admin</button></Link>
      </div>

      <p style={{ marginTop: 24, color: '#666' }}>
        Note: Courses and profile require login. Admin is restricted.
      </p>
    </div>
  );
}
