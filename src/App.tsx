
function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050A30',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ fontSize: 'clamp(48px, 10vw, 96px)', margin: 0 }}>
        NEXT<span style={{ color: '#FBC713' }}>01</span>
      </h1>

      <div style={{
        width: '100px',
        height: '6px',
        backgroundColor: '#FBC713',
        margin: '20px 0',
        borderRadius: '4px'
      }} />

      <h2>Welcome to NEXT 01</h2>
      <p>Your Digital Lifestyle Starts Here.</p>

      <button style={{
        backgroundColor: '#FBC713',
        color: '#050A30',
        border: 'none',
        padding: '14px 32px',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
        Coming Soon
      </button>

      <p style={{ marginTop: '50px', fontSize: '12px', opacity: 0.7 }}>
        Powered by UDB Corporation (Pvt) Ltd.
      </p>
    </div>
  )
}

export default App
  