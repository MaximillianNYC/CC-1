import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import '../App.css';

const Solution = ({ calcEquation }) => {
    const [displayedResult, setDisplayedResult] = useState('');
    const [showCalculation, setShowCalculation] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
        //const emojiWidth = 40;
        const padding = 56;
        const textWidth = calculateTextWidth(content);
        const calculatedWidth = textWidth + padding;
        const newWidth = Math.max(calculatedWidth);
        return `${newWidth}px`;
    }, [calculateTextWidth]);

    useEffect(() => {
        setShowCalculation(false);
        if (solutionRef.current) {
            solutionRef.current.style.width = updateWidth("loading");
        }
        setTimeout(() => setIsLoading(true), 150);
        const timeoutId = setTimeout(() => {
            const newResult = calcEquation ? "calculate" : "???";
            setDisplayedResult(newResult);
            setIsLoading(false);
            if (solutionRef.current) {
                solutionRef.current.style.width = updateWidth(newResult);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [calcEquation, updateWidth]);

    const handleClick = () => {
        if (displayedResult === "calculate" && !showCalculation) {
            if (solutionRef.current) {
                solutionRef.current.style.width = updateWidth("loading");
            }
            setTimeout(() => setIsLoading(true), 150);
            setTimeout(() => setShowCalculation(true), 200);
            setTimeout(() => {
                setIsLoading(false);
                if (solutionRef.current) {
                    solutionRef.current.style.width = updateWidth("result");
                }
            }, 1000);
        }
    };

    const solutionStyle = {
        transition: 'color 0.1s ease, background 0.3s ease, opacity 0.3s ease, transform 0.3s ease, width 0.3s ease',
        color: showCalculation ? '#000000' : (displayedResult === "calculate" ? '#ffffff' : '#959595'),
        background: showCalculation ? '#ffffff' : (displayedResult === "calculate" ? '#F15A22' : '#ffffff'),
        cursor: displayedResult === "calculate" && !showCalculation ? 'pointer' : 'not-allowed',
        fontWeight: showCalculation || displayedResult === "calculate" ? 500 : 300,
        width: defaultWidth,
    };

    const getDisplayContent = () => {
        if (isLoading) {
            return (
                <>
                    <span role="img" aria-label="loading">⏳</span> loading
                </>
            );
        }
        if (showCalculation) {
            return (
                <>
                    <span role="img" aria-label="happy">😊</span> result
                </>
            );
        }
        if (displayedResult === "calculate") {
            return (
                <>
                    calculate
                </>
            );
        }
        if (displayedResult === "???") {
            return (
                <>
                    ???
                </>
            );
        }
        return displayedResult;
    };

    return (
        <div ref={solutionRef} className="solution" style={solutionStyle} onClick={handleClick}>
            {getDisplayContent()}
        </div>
    );
};

Solution.propTypes = {
    calcEquation: PropTypes.bool.isRequired,
};

export default Solution;