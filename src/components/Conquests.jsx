import { useState } from 'react';
import RadioButton from './components/RadioButton';
import conquestData from '../data/conquestData';

const Conquests = () => {
  const [showShort, setShowShort] = useState(true);
  const [completedMap, setCompletedMap] = useState(() =>
    Object.fromEntries(conquestData.map((d) => [d.key, { sc: d.completed, hc: d.completedHardcore }]))
  );

  const toggle = (key, field) => {
    setCompletedMap((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: !prev[key][field] },
    }));
  };

  return (
    <div style={{ height: '100%', position: 'relative', overflowY: 'auto', paddingBottom: 70 }}>
      {conquestData.map((d) => (
        <div
          key={d.key}
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            margin: 5,
            padding: 5,
            borderRadius: 6,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 'bold', color: 'white', flex: 1 }}>
              {d.title}
            </span>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <div
                style={{
                  backgroundColor: 'green',
                  height: 25,
                  width: 25,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 5,
                }}
              >
                <span style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>HC</span>
              </div>
              <span style={{ fontSize: 18, color: 'white' }}>{d.hardcore}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <RadioButton
              selected={completedMap[d.key].sc}
              setSelected={() => toggle(d.key, 'sc')}
              title="Completed"
            />
            <RadioButton
              selected={completedMap[d.key].hc}
              setSelected={() => toggle(d.key, 'hc')}
              title="Completed HC"
            />
          </div>

          <span style={{ fontSize: 14, fontWeight: 'bold', color: 'white', display: 'block' }}>
            {showShort ? d.short : d.conquest}
          </span>
        </div>
      ))}

      <button
        onClick={() => setShowShort(!showShort)}
        style={{
          backgroundColor: 'rgba(27,90,8,1)',
          position: 'sticky',
          bottom: 0,
          width: '100%',
          height: 55,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          border: 'none',
        }}
      >
        <span style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
          Show {showShort ? 'Long' : 'Short'} Description
        </span>
      </button>
    </div>
  );
};

export default Conquests;
