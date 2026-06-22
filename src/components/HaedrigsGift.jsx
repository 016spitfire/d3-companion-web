import haedrigsGiftData from '../data/haedrigsGiftData';

const HaedrigsGift = () => (
  <div style={{
    width: '100%', height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--bg-base)',
    padding: '24px 16px 48px',
  }}>

    {/* Header */}
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: '700', color: 'var(--text)', letterSpacing: '0.04em' }}>
        Haedrig&apos;s Gift
      </h2>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
        Complete Chapters II, III, and IV of the Season Journey to earn a full class set.
      </p>
    </div>

    {/* Class list */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {haedrigsGiftData.map((entry) => {
        const activeSet = entry.sets.find((s) => s.active);
        return (
          <div
            key={entry.class}
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '3px solid var(--red-dim)',
              borderRadius: 'var(--r-md)',
            }}
          >
            {/* Class name + active set */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: '600', color: 'var(--text-dim)', width: 110, flexShrink: 0 }}>
                {entry.class}
              </span>
              <span style={{ fontSize: 15, fontWeight: '700', color: 'var(--gold-bright)' }}>
                {activeSet?.name ?? '—'}
              </span>
            </div>

            {/* Inactive sets — rotation context */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', paddingLeft: 122 }}>
              {entry.sets.filter((s) => !s.active).map((s) => (
                <span key={s.name} style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default HaedrigsGift;
