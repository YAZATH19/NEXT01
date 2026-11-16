
function App() {
  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#050A30',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <img
        src="/next01-logo.png"
        alt="NEXT01 Official Logo"
        style={{
          width: 'min(420px, 85vw)',
          height: 'auto',
          display: 'block',
          marginBottom: '28px',
        }}
      />

      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>
        Welcome to NEXT 01
      </h2>

      <p style={{ fontSize: '16px', marginBottom: '28px' }}>
        Your Digital Lifestyle Starts Here.
      </p>

      <div
        style={{
          backgroundColor: '#FBC713',
          color: '#050A30',
          padding: '14px 32px',
          borderRadius: '8px',
          fontWeight: 'bold',
        }}
      >
        Coming Soon
      </div>

      <p
        style={{
          marginTop: '48px',
          fontSize: '12px',
          opacity: 0.7,
        }}
      >
        Powered by UDB Corporation (Pvt) Ltd.
      </p>
    </main>
  )
}

export default App
