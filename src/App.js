import React, { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import ConceptInput from './components/ConceptInput.js';
import Operation from './components/Operation.js';
import Solution from './components/Solution.js'
import API from './API.js';
import CC1Logo from './assets/CC1.svg';
import GitLogo from './assets/GitHub.png';

function App() {
  const [operations, setOperations] = useState([
    { id: 1, input: '', operation: '+' },
    { id: 2, input: '', operation: '=' }
  ]);
  const [calcEquation, setCalcEquation] = useState(false);
  const [aiSolution, setAiSolution] = useState('');
  const prevOperationsRef = useRef();
  const [conceptEmojis, setConceptEmojis] = useState({});

  const handleCharacterChange = useCallback((id, newOperation) => {
    setOperations(prevOps => {
      return prevOps.map(op => {
        if (op.id === id) {
          return { ...op, operation: newOperation };
        }
        if (op.id === prevOps[prevOps.length - 1].id) {
          return { ...op, operation: '=' };
        }
        return op;
      });
    });
  }, []);

  const handleOperationAddition = useCallback(() => {
    setOperations(prev => {
      const newId = Math.max(...prev.map(op => op.id), 0) + 1;
      const mostRecentOperation = prev[prev.length - 1].operation;
      return [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], operation: mostRecentOperation },
        { id: newId + 1, input: '', operation: '=' }
      ];
    });
    
    setConceptEmojis(prev => {
      const newId = Math.max(...Object.keys(prev).map(Number), 0) + 1;
      return { 
        ...prev, 
        [newId + 1]: '🤔' 
      };
    });
  }, []);

  const handleGetConceptEmoji = useCallback(async (id, text) => {
    if (!text.trim()) return;
    try {
      const emoji = await API.getConceptEmoji(text);
      setConceptEmojis(prev => ({ ...prev, [id]: emoji }));
    } catch (error) {
      console.error('Error getting concept emoji:', error);
      setConceptEmojis(prev => ({ ...prev, [id]: '❓' }));
    }
  }, []);

  const handleInputChange = useCallback((id, value) => {
    setOperations(prev => prev.map(op => 
        op.id === id ? { ...op, input: value } : op
    ));
  }, []);

  const handleInputBlur = useCallback((id, value) => {
    const stringValue = String(value);
    if (stringValue.trim()) {
      handleGetConceptEmoji(id, stringValue);
    }
  }, [handleGetConceptEmoji]);

  const handleInputDelete = useCallback((id) => {
    setOperations(prev => {
      const index = prev.findIndex(op => op.id === id);
      if (index === -1) return prev;
      let newOperations = [...prev];
      if (newOperations.length > 2) {
        newOperations.splice(index, 1);
        newOperations = newOperations.map((op, i) => {
          if (i === newOperations.length - 1) {
            return { ...op, id: i + 1, operation: '=' };
          }
          return { ...op, id: i + 1, operation: i === index ? op.operation : prev[i].operation };
        });
      } else {
        newOperations = [{ id: 1, input: '', operation: '+' }];
      }
      return newOperations;
    });

    setConceptEmojis(prev => {
      const { [id]: deletedEmoji, ...rest } = prev;
      const updatedRest = Object.entries(rest).reduce((acc, [key, value], index) => {
        acc[index + 1] = value;
        return acc;
      }, {});
      return updatedRest;
    });
  }, []);

  useEffect(() => {
    const allInputsFilled = operations.every(op => op.input.trim() !== '');
    const inputsChanged = prevOperationsRef.current
      ? JSON.stringify(operations) !== JSON.stringify(prevOperationsRef.current)
      : true;

    if (allInputsFilled) {
      setCalcEquation(true);
      if (inputsChanged) {
        setAiSolution('');
        setCalcEquation(false);
        setTimeout(() => setCalcEquation(true), 0);
      }
    } else {
      setCalcEquation(false);
      setAiSolution('');
    }
    prevOperationsRef.current = JSON.parse(JSON.stringify(operations));
  }, [operations]);

  const getEquationString = () => {
    return operations
      .map((op, index) => {
        if (index === operations.length - 1) {
          return String(op.input);
        }
        return `${String(op.input)} ${op.operation}`;
      })
      .join(' ')
      .trim();
  };

  const handleGetSolution = async () => {
    const equation = getEquationString();
    if (!equation.trim()) {
      console.error('Equation is empty');
      setAiSolution('Error: Equation is empty');
      return;
    }

    try {
      const aiResponse = await API.getSolution(equation);
      console.log(`${equation} = ${aiResponse}`);
      setAiSolution(aiResponse);

      try {
        await API.saveEquation(equation, aiResponse);
        console.log('Equation saved');
      } catch (saveError) {
        console.error('Error saving equation:', saveError);
      }

    } catch (error) {
      console.error('Error getting AI solution:', error);
      setAiSolution('Error: Unable to get solution from AI');
    }
  };

  return (
    <div className="App">
      <div className='Nav'>
        <img src={CC1Logo} alt="CC-1" className='Logo'/>
        "CONCEPT CALCULATOR"
        <a href="https://github.com/MaximillianNYC/CC-1" target="_blank" rel="noopener noreferrer">
          <img src={GitLogo} alt="GitHub" className='Git'/>
        </a>
      </div>
      <main className="mainContainer">
        <div className='calculator'>
          {operations.map((op, index) => (
            <React.Fragment key={op.id}>
              <ConceptInput
                key={`input-${op.id}`}
                id={op.id}
                value={op.input}
                onChange={(value) => handleInputChange(op.id, value)}
                onBlur={(value) => handleInputBlur(op.id, value)}
                onDelete={() => handleInputDelete(op.id)}
                currentEmoji={conceptEmojis[op.id] || "🤔"}
                initialWidth="316px"
              />
              <Operation
                key={`operation-${op.id}`}
                className='operation'
                character={op.operation}
                onCharacterChange={(newOp) => handleCharacterChange(op.id, newOp)}
                addOperation={index === operations.length - 1 ? handleOperationAddition : undefined}
              />
            </React.Fragment>
          ))}
          <Solution 
            calcEquation={calcEquation} 
            aiSolution={aiSolution}
            getSolution={handleGetSolution}
          />
        </div>
      </main>
      <div className='Footer'>
          MADE BY <a href="https://www.maximillian.nyc" target="_blank" rel="noopener noreferrer">MAXIMILLIAN PIRAS</a>
      </div>
    </div>
  );
}

export default App;