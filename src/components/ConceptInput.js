import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import '../App.css';

const ConceptInput = ({ onChange, onDelete, initialWidth, placeholder = 'add concept', initialEmoji = '🤔', emojiOnFocus = '🤔', emojiOnBlur }) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [currentEmoji, setCurrentEmoji] = useState(initialEmoji);
    const inputRef = useRef(null);
    const defaultInputWidth = '316px';

    const calculateTextWidth = useCallback((text) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '32px Helvetica';
        const width = context.measureText(text).width;
        return width;    
    }, []);

    const updateWidth = useCallback((text) => {
        if (!text.trim() && !isFocused) {
            if (inputRef.current) {
                inputRef.current.style.width = defaultInputWidth;
            }
            return defaultInputWidth;
        }
        const emojiWidth = 40;
        const padding = 64;
        const deleteButtonWidth = 24;
        const minWidth = 120;
        const textWidth = Math.ceil(calculateTextWidth(text));
        const calculatedWidth = textWidth + emojiWidth + padding + deleteButtonWidth;
        const newWidth = Math.max(minWidth, calculatedWidth);
        if (inputRef.current) {
            inputRef.current.style.width = `${newWidth}px`;
        }
        return `${newWidth}px`;
    }, [calculateTextWidth, isFocused, defaultInputWidth]);

    const memoizedOnChange = useCallback((value, width) => {
        onChange(value, width);
    }, [onChange]);
    
    useEffect(() => {
        const newWidth = updateWidth(inputValue);
        memoizedOnChange(inputValue, newWidth);
    }, [inputValue, updateWidth, memoizedOnChange]);

    const inputStyle = {
        transition: 'width 0.1s, outline 0.05s',
        outline: (isFocused || isHovered) ? '2px solid #F15A22' : '0px solid #F15A22',
        paddingLeft: '70px',
        boxSizing: 'border-box',
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.width = initialWidth;
        }
    }, [initialWidth]);

    return (
        <div style={{ 
            position: 'relative', 
            display: 'inline-block' 
        }}> {}
        <span 
            role="img" 
            aria-label="emoji" 
            style={{ 
                position: 'absolute', 
                left: '24px',
                top: '52%', 
                transform: 'translateY(-50%)',
                fontSize: '32px' 
            }}
        >
            {currentEmoji} {}
        </span>
        <input
            ref={inputRef}
            className="conceptInput"
            type="text"
            value={inputValue}
            onChange={(e) => {
                const newValue = e.target.value;
                setInputValue(newValue);
            }}
            placeholder={isFocused && inputValue === '' ? '' : placeholder}
            onFocus={(e) => {
                setIsFocused(true);
                setCurrentEmoji(emojiOnFocus);
                if (inputValue === '') {
                    e.target.placeholder = '';
                    e.target.style.width = '130px';
                }
            }}
            onBlur={(e) => {
                setIsFocused(false);
                setCurrentEmoji(emojiOnBlur);
                e.target.placeholder = inputValue === '' ? placeholder : '';
                if (inputValue === '') {
                    e.target.style.width = '316px';
                }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={inputStyle}
        />
        <button
            onClick={onDelete}
            style={{
                position: 'absolute',
                right: '16px',
                top: '52%', 
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
            }}
        >
            <img src="/Remove.svg" alt="Remove" style={{ width: '24px', height: '24px' }} />
        </button>
        </div>
    );
};

ConceptInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    initialWidth: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    emojiOnFocus: PropTypes.string,
    emojiOnBlur: PropTypes.string,
};

export default ConceptInput;