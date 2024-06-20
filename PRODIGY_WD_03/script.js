document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const turnDisplay = document.getElementById('turn');
    const restartButton = document.getElementById('restart');
    const playerChoice = document.getElementById('playerChoice');

    let currentPlayer = 'X';
    let gameActive = true;
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let isSinglePlayerMode = true; 

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const handleCellClick = (e) => {
        const cell = e.target;
        const index = parseInt(cell.id.split('-')[1]);

        if (gameState[index] !== '' || !gameActive) {
            return;
        }

        gameState[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer);

        if (checkWin(currentPlayer)) {
            turnDisplay.textContent = `Player ${currentPlayer} wins!`;
            gameActive = false;
            return;
        }

        if (checkDraw()) {
            turnDisplay.textContent = 'It\'s a draw!';
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        turnDisplay.textContent = `Player ${currentPlayer}'s Turn`;

        if (isSinglePlayerMode && currentPlayer === 'O' && gameActive) {
            // AI's turn if playing against AI
            setTimeout(() => {
                const aiMove = getAIMove();
                gameState[aiMove.index] = currentPlayer;
                document.getElementById(`cell-${aiMove.index}`).textContent = currentPlayer;
                document.getElementById(`cell-${aiMove.index}`).classList.add(currentPlayer);

                if (checkWin(currentPlayer)) {
                    turnDisplay.textContent = `Player ${currentPlayer} wins!`;
                    gameActive = false;
                    return;
                }

                if (checkDraw()) {
                    turnDisplay.textContent = 'It\'s a draw!';
                    gameActive = false;
                    return;
                }

                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                turnDisplay.textContent = `Player ${currentPlayer}'s Turn`;
            }, 500); // AI move delay for visual effect
        }
    };

    const getAIMove = () => {
        // Use minimax algorithm to find best move for AI
        let bestScore = -Infinity;
        let bestMove;

        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'O';
                let score = minimax(gameState, 0, false);
                gameState[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return { index: bestMove };
    };

    const minimax = (state, depth, isMaximizing) => {
        let result = checkGameResult();
        if (result !== null) {
            return result.score;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < state.length; i++) {
                if (state[i] === '') {
                    state[i] = 'O';
                    let score = minimax(state, depth + 1, false);
                    state[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < state.length; i++) {
                if (state[i] === '') {
                    state[i] = 'X';
                    let score = minimax(state, depth + 1, true);
                    state[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const checkGameResult = () => {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] !== '' && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                return { score: gameState[a] === 'O' ? 1 : -1 };
            }
        }

        if (!gameState.includes('')) {
            return { score: 0 };
        }

        return null;
    };

    const checkWin = (player) => {
        return winningConditions.some(condition => {
            return condition.every(index => {
                return gameState[index] === player;
            });
        });
    };

    const checkDraw = () => {
        return !gameState.includes('');
    };

    const restartGame = () => {
        currentPlayer = 'X';
        gameActive = true;
        gameState = ['', '', '', '', '', '', '', '', ''];
        turnDisplay.textContent = `Player ${currentPlayer}'s Turn`;

        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('X', 'O');
        });

        // Reset AI mode choice
        playerChoice.disabled = false;
    };

    // Event listener for cell clicks
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    // Event listener for restart button
    restartButton.addEventListener('click', restartGame);

    // Event listener for player choice
    playerChoice.addEventListener('change', () => {
        isSinglePlayerMode = playerChoice.value === 'ai';
        restartGame(); // Restart game when switching modes
        playerChoice.disabled = true; // Disable choice after game starts
    });
});
