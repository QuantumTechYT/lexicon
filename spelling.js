document.addEventListener('DOMContentLoaded', () => {
    const playWordBtn = document.getElementById('playWord');
    const newWordBtn = document.getElementById('newWord');
    const spellingInput = document.getElementById('spellingInput');
    const checkSpellingBtn = document.getElementById('checkSpelling');
    const resultDiv = document.getElementById('result');
    const wordDefinitionDiv = document.getElementById('wordDefinition');
    const scoreSpan = document.getElementById('score');
    const totalAttemptsSpan = document.getElementById('totalAttempts');
    const wordHint = document.getElementById('wordHint');
    const themeToggle = document.querySelector('.theme-toggle');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const showDefinitionBtn = document.getElementById('showDefinition');
    const definitionHint = document.getElementById('definitionHint');

    let currentWord = null;
    let currentAudio = null;
    let score = 0;
    let totalAttempts = 0;
    let currentDifficulty = 'easy';

    const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
    
    // Word lists by difficulty
    const wordLists = {
        easy: [
            'happy', 'smile', 'laugh', 'sunny', 'light',
            'dream', 'peace', 'dance', 'music', 'heart'
        ],
        medium: [
            'serendipity', 'eloquent', 'nostalgia', 'euphoria',
            'resilient', 'diligent', 'paradigm', 'benevolent'
        ],
        hard: [
            'mellifluous', 'ephemeral', 'ubiquitous', 'cacophony',
            'fastidious', 'gregarious', 'hierarchy', 'indigenous'
        ]
    };

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });

    // Update difficulty selection
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.difficulty;
            setNewWord();
        });
    });

    async function fetchRandomWord() {
        const wordList = wordLists[currentDifficulty];
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        try {
            const response = await fetch(`${API_URL}${randomWord}`);
            const data = await response.json();
            return data[0];
        } catch (error) {
            console.error('Error fetching word:', error);
            return null;
        }
    }

    async function setNewWord() {
        const wordData = await fetchRandomWord();
        if (wordData) {
            currentWord = wordData;
            const audioUrl = wordData.phonetics.find(p => p.audio)?.audio || '';
            if (audioUrl) {
                currentAudio = new Audio(audioUrl.startsWith('//') ? `https:${audioUrl}` : audioUrl);
            }
            
            // Clear previous state
            spellingInput.value = '';
            resultDiv.textContent = '';
            wordDefinitionDiv.innerHTML = '';
            definitionHint.innerHTML = '';
            
            // Set new hints
            const definition = wordData.meanings[0].definitions[0].definition;
            wordHint.textContent = `Difficulty: ${currentDifficulty.toUpperCase()}`;
            definitionHint.innerHTML = `<span class="hint-label">Definition:</span> 
                                      <span class="hint-text">${definition}</span>`;
            definitionHint.style.display = 'none';
        }
    }

    function playCurrentWord() {
        if (currentAudio) {
            currentAudio.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    }

    function checkSpelling() {
        if (!currentWord) return;
        
        totalAttempts++;
        totalAttemptsSpan.textContent = totalAttempts;

        const userInput = spellingInput.value.trim().toLowerCase();
        const correctWord = currentWord.word.toLowerCase();

        if (userInput === correctWord) {
            score++;
            scoreSpan.textContent = score;
            resultDiv.innerHTML = `<span class="correct">✓ Correct! The word is "${correctWord}"</span>`;
            showWordDetails();
        } else {
            resultDiv.innerHTML = `<span class="incorrect">✗ Incorrect. Try again!</span>`;
        }
    }

    function showWordDetails() {
        const meanings = currentWord.meanings.map(meaning => `
            <div class="meaning">
                <h4>${meaning.partOfSpeech}</h4>
                <p>${meaning.definitions[0].definition}</p>
                ${meaning.definitions[0].example ? `<p class="example">"${meaning.definitions[0].example}"</p>` : ''}
            </div>
        `).join('');

        wordDefinitionDiv.innerHTML = `
            <div class="word-details">
                <h3>${currentWord.word}</h3>
                ${currentWord.phonetic ? `<p class="phonetic">${currentWord.phonetic}</p>` : ''}
                ${meanings}
            </div>
        `;
    }

    // Show/Hide definition
    showDefinitionBtn.addEventListener('click', () => {
        definitionHint.style.display = definitionHint.style.display === 'none' ? 'block' : 'none';
        showDefinitionBtn.innerHTML = definitionHint.style.display === 'none' ? 
            '<i class="fas fa-book"></i> Show Definition' : 
            '<i class="fas fa-book-open"></i> Hide Definition';
    });

    // Event listeners
    playWordBtn.addEventListener('click', playCurrentWord);
    newWordBtn.addEventListener('click', setNewWord);
    checkSpellingBtn.addEventListener('click', checkSpelling);
    spellingInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkSpelling();
    });

    // Initialize
    setNewWord();
}); 