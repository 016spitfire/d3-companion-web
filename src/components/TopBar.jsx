const TopBar = ({ topBarHeight }) => (
  <div
    style={{
      width: '100%',
      height: topBarHeight,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to bottom, #2a0008, #0c0c0e)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
      position: 'relative',
    }}
  >
    <span
      style={{
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text)',
        textShadow: '0 0 20px rgba(196,18,48,0.5)',
      }}
    >
      Diablo III Companion
    </span>
    {/* thin gold accent line at the bottom */}
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(to right, transparent, var(--gold), transparent)',
        opacity: 0.6,
      }}
    />
  </div>
);

export default TopBar;
