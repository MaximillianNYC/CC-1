import React, { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import ConceptInput from './components/ConceptInput.js';
import Operation from './components/Operation.js';
import Solution from './components/Solution.js'

function App() {
  const [operations, setOperations] = useState([
    { id: 1, input: '', operation: '+' },
    { id: 2, input: '', operation: '=' }
  ]);
  const [calcEquation, setCalcEquation] = useState(false);
  const prevOperationsRef = useRef();

  const handleCharacterChange = useCallback((id, newOperation) => {
    setOperations(prevOps => {
      const newOps = prevOps.map(op => 
        op.id === id ? { ...op, operation: newOperation } : op
      );
      newOps[newOps.length - 1].operation = '=';
      return newOps;
    });
  }, []);

  const handleOperationAddition = useCallback(() => {
    setOperations(prev => {
      const newId = Math.max(...prev.map(op => op.id)) + 1;
      const mostRecentOperation = prev[prev.length - 1].operation;
      return [
        ...prev.slice(0, -1),
        { id: newId - 1, input: '', operation: mostRecentOperation },
        { id: newId, input: '', operation: '=' }
      ];
    });
  }, []);

  const handleInputChange = useCallback((id, value) => {
    setOperations(prev => prev.map(op => 
        op.id === id ? { ...op, input: value } : op
    ));
  }, []);

  const handleInputDelete = useCallback((id) => {
    setOperations(prev => {
      const index = prev.findIndex(op => op.id === id);
      if (index === -1) return prev;
      let newOperations = [...prev];
      if (newOperations.length > 1) {
        newOperations.splice(index, 1);
        if (index < newOperations.length) {
          newOperations[index].input = prev[index].input;
          newOperations[index].inputWidth = prev[index].inputWidth;
        }
        if (newOperations.length > 0) {
          newOperations[newOperations.length - 1].operation = '=';
        }
      } else {
        newOperations[0].input = '';
      }
      return newOperations;
    });
  }, []);

  useEffect(() => {
    const allInputsFilled = operations.every(op => op.input.trim() !== '');
    const inputsChanged = prevOperationsRef.current && operations.some((op, index) => {
      const prevOp = prevOperationsRef.current[index];
      return prevOp && op.input.trim() !== prevOp.input.trim();
    });
    if (!allInputsFilled || inputsChanged) {
      setCalcEquation(false);
    } else {
      setCalcEquation(true);
    }
    prevOperationsRef.current = operations;
  }, [operations]);

  return (
    <div className="App">
      <div className='Nav'>CC-1 CONCEPT CALCULATOR</div>
      <main className="mainContainer">
        <div className='calculator'>
          {operations.map((op, index) => (
            <React.Fragment key={op.id}>
              <ConceptInput
                value={op.input}
                onChange={(value) => handleInputChange(op.id, value)}
                onDelete={() => handleInputDelete(op.id)}
                emojiOnBlur="🤔"
              />
              <Operation
                className='operation'
                character={op.operation}
                onCharacterChange={(newOp) => handleCharacterChange(op.id, newOp)}
                addOperation={index === operations.length - 1 ? handleOperationAddition : undefined}
              />
            </React.Fragment>
          ))}
          <Solution calcEquation={calcEquation} />
        </div>
      </main>
      <div className='Footer'>MADE BY MAXIMILLIAN PIRAS</div>
    </div>
  );
}

export default App;