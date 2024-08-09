import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../App.css';

const Solution = ({ allFilled }) => {
    const [displayedResult, setDisplayedResult] = useState('');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDisplayedResult(allFilled ? "calculate" : "???");
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [allFilled]);

    const solutionStyle = {
        color: displayedResult === "calculate" ? '#ffffff' : '#959595',
        background: displayedResult === "calculate" ? '#F15A22' : '#ffffff',
        cursor: displayedResult === "calculate" ? 'pointer' : 'not-allowed',
    };

    return (
      <div className="solution" style={solutionStyle}>
        {displayedResult}
      </div>
    );
  };

  Solution.propTypes = {
    allFilled: PropTypes.bool.isRequired,
};
  
  export default Solution;