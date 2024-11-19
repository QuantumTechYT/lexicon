document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsArea = document.getElementById('resultsArea');
    const trendingWords = document.getElementById('trendingWords');
    const homeLink = document.getElementById('homeLink');
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Dictionary API configuration
    const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });

    // Dictionary functionality
    async function fetchWord(word) {
        try {
            const response = await fetch(`${API_URL}${word}`);
            if (!response.ok) throw new Error('Word not found');
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }

    async function handleSearch() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) return;

        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        resultsArea.innerHTML = '';
        trendingWords.classList.add('hide-trending');
        
        try {
            const wordData = await fetchWord(searchTerm);
            displayWordData(wordData);
        } catch (error) {
            resultsArea.innerHTML = `
                <div class="error-container">
                    <h3>😕 No Definitions Found</h3>
                    <p>Sorry, we couldn't find definitions for the word "${searchTerm}"</p>
                </div>
            `;
        } finally {
            searchButton.innerHTML = '<i class="fas fa-search"></i>';
        }
    }

    function displayWordData(wordData) {
        const wordElement = document.createElement('div');
        wordElement.className = 'word-container';
        
        const word = wordData[0];
        const audioUrl = word.phonetics.find(p => p.audio)?.audio || '';

        wordElement.innerHTML = `
            <div class="word-header">
                <h2 id="word">${word.word}</h2>
                ${word.phonetic ? `<div class="phonetics">${word.phonetic}</div>` : ''}
                ${audioUrl ? `
                    <button class="pronunciation" data-audio="${audioUrl}">
                        <i class="fas fa-volume-up"></i>
                    </button>
                ` : ''}
            </div>

            ${word.meanings.map(meaning => `
                <div class="meanings">
                    <div class="part-of-speech">
                        <span>${meaning.partOfSpeech}</span>
                        <div class="line"></div>
                    </div>

                    ${meaning.definitions.map((def, index) => `
                        <div class="definition-group">
                            <h3>Definition ${index + 1}</h3>
                            <p>${def.definition}</p>
                            
                            ${def.example ? `
                                <div class="example">
                                    <h4>Example</h4>
                                    <p>"${def.example}"</p>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        `;

        // Add audio functionality
        const pronButton = wordElement.querySelector('.pronunciation');
        if (pronButton) {
            const audio = new Audio(pronButton.dataset.audio);
            pronButton.addEventListener('click', () => {
                audio.play().catch(error => {
                    console.error('Audio playback failed:', error);
                });
                pronButton.classList.add('playing');
                setTimeout(() => pronButton.classList.remove('playing'), 1000);
            });
        }

        resultsArea.appendChild(wordElement);
    }

    function createTrendingWordsGrid() {
        const commonWords = [
            'serendipity', 'ephemeral', 'mellifluous', 
            'ethereal', 'luminous', 'enigmatic',
            'resilient', 'eloquent', 'nostalgia',
            'euphoria', 'wanderlust', 'serene'
        ];
        
        const wordGrid = trendingWords.querySelector('.word-grid');
        wordGrid.innerHTML = commonWords.map(word => `
            <div class="trending-word" data-word="${word}">
                ${word}
            </div>
        `).join('');

        // Add click handlers to trending words
        wordGrid.querySelectorAll('.trending-word').forEach(wordElement => {
            wordElement.addEventListener('click', () => {
                searchInput.value = wordElement.dataset.word;
                handleSearch();
            });
        });
    }

    // Event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    homeLink.addEventListener('click', () => {
        resultsArea.innerHTML = '';
        trendingWords.classList.remove('hide-trending');
        searchInput.value = '';
    });

    // Initialize trending words
    createTrendingWordsGrid();
}); 