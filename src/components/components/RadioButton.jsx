const RadioButton = ({ selected, setSelected, title }) => {
  return (
    <button
      onClick={() => setSelected(!selected)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          width: 20,
          height: 20,
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 5,
          flexShrink: 0,
        }}
      >
        {selected && (
          <div style={{ backgroundColor: 'black', width: 12, height: 12, borderRadius: '50%' }} />
        )}
      </div>
      <span style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{title}</span>
    </button>
  );
};

export default RadioButton;
