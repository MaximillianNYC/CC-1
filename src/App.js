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
  const [conceptEmojis, setConceptEmojis] = useState({});
  const [hasCalculated, setHasCalculated] = useState(false);

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
        ...prev.slice(0, -1), // Keep all but the last operation
        { ...prev[prev.length - 1], operation: mostRecentOperation }, // Update the operation of the previous last item
        { id: newId + 1, input: '', operation: '=' } // Add new empty operation
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

  const getConceptEmoji = useCallback(async (id, text) => {
    if (!text.trim()) return;
    try {
      const response = await axios.post('http://localhost:3001/api/openai/emoji-generator', {
        messages: [{ 
          role: "user", 
          content: `Given the concept "${text}", suggest a single emoji that best represents it. Respond with only the emoji, nothing else.`
        }],
        max_tokens: 5,
      });
      
      if (response.data && response.data.emoji) {
        const emoji = response.data.emoji.trim();
        setConceptEmojis(prev => ({ ...prev, [id]: emoji }));
      } else {
        console.error('Unexpected API response structure:', response.data);
        setConceptEmojis(prev => ({ ...prev, [id]: '❓' }));
      }
    } catch (error) {
      console.error('Error calling OpenAI API for emoji:', error);
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
      getConceptEmoji(id, stringValue);
    }
  }, [getConceptEmoji]);

  const handleInputDelete = useCallback((id) => {
    setOperations(prev => {
      const index = prev.findIndex(op => op.id === id);
      if (index === -1) return prev;
      let newOperations = [...prev];
      if (newOperations.length > 2) {
        newOperations.splice(index, 1);
        // Preserve operations and update IDs
        newOperations = newOperations.map((op, i) => {
          if (i === newOperations.length - 1) {
            return { ...op, id: i + 1, operation: '=' };
          }
          return { ...op, id: i + 1, operation: i === index ? op.operation : prev[i].operation };
        });
      } else {
        // If only two items left, reset the first one and remove the second
        newOperations = [{ id: 1, input: '', operation: '+' }];
      }
      return newOperations;
    });

    setConceptEmojis(prev => {
      const { [id]: deletedEmoji, ...rest } = prev;
      // Update emoji IDs to match new operation IDs
      const updatedRest = Object.entries(rest).reduce((acc, [key, value], index) => {
        acc[index + 1] = value;
        return acc;
      }, {});
      return updatedRest;
    });
  }, []);

  useEffect(() => {
    console.log('Current operations:', operations);
    console.log('Previous operations:', prevOperationsRef.current);

    const allInputsFilled = operations.every(op => op.input.trim() !== '');
    console.log('All inputs filled:', allInputsFilled);

    const inputsChanged = prevOperationsRef.current
      ? JSON.stringify(operations) !== JSON.stringify(prevOperationsRef.current)
      : true;
    console.log('Inputs changed:', inputsChanged);

    if (allInputsFilled) {
      if (inputsChanged && hasCalculated) {
        console.log('Inputs changed after calculation, setting calcEquation to true');
        setCalcEquation(true);
        setAiSolution('');
        setHasCalculated(false);  // Reset hasCalculated
      } else if (!hasCalculated) {
        console.log('All inputs filled, no calculation yet, setting calcEquation to true');
        setCalcEquation(true);
      }
    } else {
      console.log('Not all inputs filled, setting calcEquation to false');
      setCalcEquation(false);
      setAiSolution('');
      setHasCalculated(false);
    }

    prevOperationsRef.current = JSON.parse(JSON.stringify(operations));
  }, [operations, hasCalculated]);

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

  const getAISolution = async () => {
    const equation = getEquationString();
    console.log(equation);
    try {
      const response = await axios.post('http://localhost:3001/api/openai/concept-calculator', {
        messages: [{ 
          role: "user", 
          content: `Solve this conceptual equation: ${equation}. Respond in a single concept preceeded by an emoji that best illustrates the concept. Match the case format of the input text.`
        }],
        max_tokens: 1000,
      });
      const aiResponse = response.data.choices[0].message.content;
      setAiSolution(aiResponse);
      setHasCalculated(true);  // Set this to true after successful calculation
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
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
            getAISolution={getAISolution}
          />
        </div>
      </main>
      <div className='Footer'>MADE BY MAXIMILLIAN PIRAS</div>
    </div>
  );
}

export default App;