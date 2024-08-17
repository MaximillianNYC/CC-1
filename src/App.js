import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';  
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
  const [aiSolution, setAiSolution] = useState('');
  const prevOperationsRef = useRef();



  const handleCharacterChange = useCallback((id, newOperation) => {
    setOperations(prevOps => {
      return prevOps.map(op => {
        if (op.id === id) {
          return { ...op, operation: newOperation };
        }
        // Ensure the last operation is always '='
        if (op.id === prevOps[prevOps.length - 1].id) {
          return { ...op, operation: '=' };
        }
        return op;
      });
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
      setAiSolution('');
    } else {
      setCalcEquation(true);
    }
    prevOperationsRef.current = operations;
  }, [operations]);

  const getEquationString = () => {
    return operations
      .map((op, index) => {
        // For the last operation (which should be '='), we don't want to include it in the string
        if (index === operations.length - 1) {
          return op.input;
        }
        return `${op.input} ${op.operation}`;
      })
      .join(' ')
      .trim();
  };

  const getAISolution = async () => {
    const equation = getEquationString();
    console.log(equation);
    try {
      const response = await axios.post('https://api.anthropic.com/v1/chat/completions', {
        model: "claude-3-opus-20240229",
        messages: [{ 
          role: "user", 
          content: `Solve this conceptual equation and explain the result: ${equation}. Keep your response under 100 words.`
        }],
        max_tokens: 1000,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
        }
      });
      setAiSolution(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      setAiSolution('Error: Unable to get solution from AI');
    }
  };

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
          <Solution 
            calcEquation={calcEquation} 
            aiSolution={aiSolution}
            getAISolution={getAISolution}
          />
        </div>
      </main>
      <div className='Footer'>MADE BY MAXIMILLIAN PIRAS</div>
    </div>
  );
}

export default App;