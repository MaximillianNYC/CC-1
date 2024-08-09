import React, { useState, useEffect } from 'react';
import '../App.css';

const Operation = ({ character, onCharacterChange, addOperation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localCharacter, setLocalCharacter] = useState(character);

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    setLocalCharacter(character);
  }, [character]);

  const handleButtonClick = (value) => {
    setLocalCharacter(value);
    onCharacterChange(value);
    setIsExpanded(false);
    if (addOperation) {
      addOperation();
    }
  };

  const operationButtonStyle = {
    zIndex: 900,
    width: isExpanded ? '10px' : '80px',
    height: isExpanded ? '10px' : '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '80px',
    color: '#F15A22',
    textAlign: 'center',
    fontFamily: '"DM Sans"',
    fontSize: isExpanded ? '0px' : '32px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 'normal',
    transition: 'width 0.3s ease, height 0.3s ease, font-size 0.3s ease'
  };

  const operationMenuStyle = {
    opacity: isExpanded ? '1' : '0',
    position: 'absolute', 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    zIndex: '9999',
    transition: 'opacity 0.1s ease, height 0.15s ease, width 0.15s ease',
  };

  const operationMenuButtonStyle = {
    width: isExpanded ? '80px' : '0px',
    height: isExpanded ? '80px' : '0px',
    opacity: isExpanded ? '1' : '0',
    pointerEvents: isExpanded ? 'auto' : 'none',
    cursor: isExpanded ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '80px',
    color: '#F15A22',
    textAlign: 'center',
    fontFamily: '"DM Sans"',
    fontSize: '32px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 'normal',
    boxShadow: '0px 0px 30px 0px rgba(0, 0, 0, 0.1)',
    transition: 'width 0.15s ease, height 0.15s ease'
  };

  return (
      <div className="operation" onClick={toggleMenu} style={{ position: 'relative' }}>
        <div style={operationButtonStyle} className="operationButton">{localCharacter}</div>
        {isExpanded && (
          <div style={operationMenuStyle}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
              <div 
                style={operationMenuButtonStyle} className="operationMenuButton"
                onClick={() => handleButtonClick('+')}>
                  +
              </div>
              <div 
                style={operationMenuButtonStyle} className="operationMenuButton"
                onClick={() => handleButtonClick('-')}>
                  -
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
              <div 
                  style={operationMenuButtonStyle} className="operationMenuButton"
                  onClick={() => handleButtonClick('×')}>
                    ×
                </div>
                <div 
                  style={operationMenuButtonStyle} className="operationMenuButton"
                  onClick={() => handleButtonClick('÷')}>
                    ÷
                </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default Operation;