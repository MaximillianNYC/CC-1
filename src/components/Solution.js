import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../App.css';

const Solution = ({ allFilled }) => {
    const [displayedResult, setDisplayedResult] = useState('');
    const [showFrog, setShowFrog] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDisplayedResult(allFilled ? "calculate" : "???");
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [allFilled]);

    const handleClick = () => {
        if (displayedResult === "calculate") {
            setShowFrog(true);
        }
    };

    const solutionStyle = {
        color: showFrog ? '#959595' : (displayedResult === "calculate" ? '#ffffff' : '#959595'),
        background: showFrog ? '#ffffff' : (displayedResult === "calculate" ? '#F15A22' : '#ffffff'),
        cursor: displayedResult === "calculate" ? 'pointer' : 'not-allowed',
    };

    return (
        <div className="solution" style={solutionStyle} onClick={handleClick}>
            {showFrog ? "frog" : displayedResult}
        </div>
    );
};

Solution.propTypes = {
    allFilled: PropTypes.bool.isRequired,
};

export default Solution;