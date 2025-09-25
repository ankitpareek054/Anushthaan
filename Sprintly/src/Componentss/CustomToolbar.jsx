import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const CustomToolbar = ({ label, onNavigate }) => {
    return (
        <div className="flex justify-between items-center px-4 mt-2 mb-4">
            {/* Today Button */}
            <button
                onClick={() => onNavigate('TODAY')}
                className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-blue-500"
            >
                Today
            </button>

            {/* Center Month Label with Arrows */}
            <div className="flex items-center justify-center">
                <button
                    onClick={() => onNavigate('PREV')}
                    className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-blue-500"
                    aria-label="Previous month"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                <h2 className="text-lg font-bold mx-4 text-gray-800 dark:text-white">
                    {label}
                </h2>

                <button
                    onClick={() => onNavigate('NEXT')}
                    className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-blue-500"
                    aria-label="Next month"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>

            {/* Invisible spacer to balance flex space (same width as "Today" button) */}
            <div style={{ width: '74px' }}></div>
        </div>
    );
};

export default CustomToolbar;
