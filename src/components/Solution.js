import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import '../App.css';

const Solution = ({ calcEquation, aiSolution, getSolution }) => {
    const [displayedResult, setDisplayedResult] = useState('');
    const [showCalculation, setShowCalculation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const solutionRef = useRef(null);
    const defaultWidth = '150px';

    const calculateTextWidth = useCallback((text) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '32px Helvetica';
        return Math.ceil(context.measureText(text).width);
    }, []);

    const updateWidth = useCallback((content) => {
        if (content === "???") return '50px';
        if (content === "calculate") return '130px';
        if (content === "loading") return '150px';
        const padding = 8;
        const textWidth = calculateTextWidth(content);
        const calculatedWidth = textWidth + padding;
        const newWidth = Math.max(calculatedWidth, 30);
        return `${newWidth}px`;
    }, [calculateTextWidth]);

    useEffect(() => {
        setShowCalculation(false);
        setIsLoading(true);
        if (solutionRef.current) {
            solutionRef.current.style.width = updateWidth("loading");
        }
        const timeoutId = setTimeout(() => {
            const newResult = calcEquation ? "calculate" : "???";
            setDisplayedResult(newResult);
            setIsLoading(false);
            if (solutionRef.current) {
                solutionRef.current.style.width = updateWidth(newResult);
            }
        }, 250);
        return () => clearTimeout(timeoutId);
    }, [calcEquation, updateWidth]);

    useEffect(() => {
        if (aiSolution) {
            setShowCalculation(true);
            setIsLoading(false);
            if (solutionRef.current) {
                solutionRef.current.style.width = updateWidth(aiSolution);
            }
        } else {
            setShowCalculation(false);
        }
    }, [aiSolution, updateWidth]);

    const handleClick = () => {
        if (calcEquation && !showCalculation && !isLoading) {
            setIsLoading(true);
            if (solutionRef.current) {
                solutionRef.current.style.width = updateWidth("loading");
            }
            setTimeout(async () => {
                await getSolution();
                setIsLoading(false);
            }, 1000);
        }
    };

    const solutionStyle = {
        transition: 'color 0.1s ease, background 0.3s ease, opacity 0.3s ease, transform 0.3s ease, width 0.3s ease',
        color: showCalculation ? '#000000' : (calcEquation ? '#ffffff' : '#959595'),
        background: showCalculation ? '#ffffff' : (calcEquation ? '#F15A22' : '#ffffff'),
        cursor: calcEquation && !showCalculation && !isLoading ? 'pointer' : 'not-allowed',
        fontWeight: showCalculation || calcEquation ? 500 : 300,
        width: solutionRef.current ? solutionRef.current.style.width : defaultWidth,
    };

    const getDisplayContent = () => {
        if (isLoading) {
            return (
                <>
                    <span role="img" aria-label="loading">⏳</span> loading
                </>
            );
        }
        if (showCalculation && aiSolution) {
            return aiSolution;
        }
        if (calcEquation) {
            return (
                <>
                    calculate
                </>
            );
        }
        return (
            <>
                ???
            </>
        );
    };

    return (
        <div ref={solutionRef} className="solution" style={solutionStyle} onClick={handleClick}>
            {getDisplayContent()}
        </div>
    );
};

Solution.propTypes = {
    calcEquation: PropTypes.bool.isRequired,
    aiSolution: PropTypes.string,
    getSolution: PropTypes.func.isRequired,
};

export default Solution;