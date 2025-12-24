import React, { useState, useRef } from 'react';
import logoIcon from '../assects/icons/satyamatrix.svg';
import starIcon from '../assects/images/star.png';

const WelcomeScreen = ({ userName, onSendMessage }) => {
    const [message, setMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const suggestionCards = [
        {
            title: 'Black Holes',
            description: 'Explore claims about black hole physics and observations',
            prompt: 'Can black holes evaporate through Hawking radiation?'
        },
        {
            title: 'Exoplanets',
            description: 'Verify discoveries and facts about planets beyond our solar system',
            prompt: 'Have we discovered Earth-like planets in habitable zones?'
        },
        {
            title: 'Neutron Stars',
            description: 'Check claims about neutron star properties and behavior',
            prompt: 'Can neutron stars exceed 5 solar masses?'
        }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message, selectedFiles);
            setMessage('');
            setSelectedFiles([]);
        }
    };

    const handleSuggestionClick = (prompt) => {
        setMessage(prompt);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    const getFileNames = () => {
        if (selectedFiles.length === 0) return '';
        if (selectedFiles.length === 1) return selectedFiles[0].name;
        return `${selectedFiles.length} files selected`;
    };

    return (
        <div className="welcome-screen">
            <div className="orb-background"></div>

            <div className="welcome-logo">
                <img src={logoIcon} alt="SatyaMatrix" />
            </div>

            <div className="welcome-text">
                <h1>Hey! {userName}</h1>
                <h2>What can I help with?</h2>
            </div>

            <div className="suggestion-cards">
                {suggestionCards.map((card, index) => (
                    <button
                        key={index}
                        className="suggestion-card"
                        onClick={() => handleSuggestionClick(card.prompt)}
                    >
                        <div className="card-title">{card.title}</div>
                        <div className="card-desc">{card.description}</div>
                    </button>
                ))}
            </div>

            <div className="input-container">
                <form className="input-box" onSubmit={handleSubmit}>
                    <div className="top-row">
                        <img src={starIcon} alt="star" className="input-icon" />
                        <input
                            type="text"
                            placeholder="Ask me anything......"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <div className="bottom-row">
                        <div className="attach-section">
                            <label htmlFor="fileInput" className="attach-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                </svg>
                                <span>Attach file</span>
                            </label>
                            <input
                                type="file"
                                id="fileInput"
                                ref={fileInputRef}
                                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx"
                                style={{ display: 'none' }}
                                multiple
                                onChange={handleFileChange}
                            />
                            <span className="file-names">{getFileNames()}</span>
                        </div>
                        <button type="submit" className="send-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WelcomeScreen;
