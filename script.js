// Tamanho do tabuleiro e células
const CANVAS_SIZE = 840;
const GRID_SIZE = 42;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Matriz do tabuleiro fornecida
const tabuleiro = [
    '000000000000000000000000000000000000000000',
    '003333333333333300003333310000000000000000',
    '003444443444444300003444010003333333333300',
    '003444443444444333333441110003000000000300',
    '003443443444344344440441110003000222000300',
    '003333333333333334440444010003000222000300',
    '003222222222222334440000010003000222000300',
    '003222222222222344440444010003000222000300',
    '003222200002222333333444010003000000000300',
    '003222200002222300003441110003333333333300',
    '003222200002222300003444010000000030000000',
    '003222222222222300003444010000000030000000',
    '003222222222222300003000010000000030000000',
    '003333333333333311111111111111111111111111',
    '001000000000000100000000010000000000000000',
    '001044400444400104444444010444444404444400',
    '001334400444111104444444010444444404444400',
    '001044400444400104144414010444414404414400',
    '001000000000000100100010010000010000010000',
    '001111111111111111111111111111111111111100',
    '001333333100000000001000100000100103000100',
    '001344443104440044401044140440104143440100',
    '001344443104440044111044440440104443440100',
    '001344433111440044401000000411100003411100',
    '001344443104440044401044440440104443440100',
    '001344443104440044401044140440104143440100',
    '001333333100000000001000100000100103000100',
    '001111111111111111111111111111111111111100',
    '001000000001000030103000301000100003000100',
    '001044444401044434143444341400104443440100',
    '001044114401041434443414344400104444440100',
    '001000110001001030003010300000100000000100',
    '001111111111111111111111111111111111111100',
    '001000000000000000001000000300000013333100',
    '001044444444444444401000000300000013443100',
    '001041111111441114401000000300000013443100',
    '001041444441444414401333333333333313343100',
    '001041111441111114401000000300000013443100',
    '001044441444444444401000000300000013443100',
    '001000001000000000001000000300000013333100',
    '001111111111111111111111111111111111111100',
    '000000000000000000000000000000000000000000'
];

// Posições da Barbie e dos amigos
const posicaoBarbie = [22, 18]; // Posição da Barbie (23, 19)
const posicoesAmigos = [
    [4, 12],   // Amigo 1 (5, 13)
    [9, 8],    // Amigo 2 (10, 9)
    [35, 14],  // Amigo 3 (36, 15)
    [5, 34],   // Amigo 4 (6, 35)
    [23, 37],  // Amigo 5 (24, 38)
    [36, 36]   // Amigo 6 (37, 37)
];

const custosTerreno = {
    '0': 5,   // Grama
    '1': 1,   // Asfalto
    '2': 3,   // Terra
    '3': 10,  // Paralelepípedo
    '4': Infinity // Edifícios não podem ser atravessados
};

// Função para retornar a cor do terreno
function getTerrenoClasse(valor) {
    switch (valor) {
        case '0': return '#228b22';  // Grama (verde)
        case '1': return '#4d4d4d';  // Asfalto (cinza escuro)
        case '2': return '#8b4513';  // Terra (marrom)
        case '3': return '#d3d3d3';  // Paralelepípedo (cinza claro)
        case '4': return '#ff8c00';  // Edifício (laranja)
        default: return '#000000';   // Preta como padrão
    }
}

// Função para desenhar o tabuleiro
function desenharTabuleiro() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const terreno = tabuleiro[i][j];
            ctx.fillStyle = getTerrenoClasse(terreno);  // Define a cor baseada no terreno
            ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);

            // Desenhar a linha da grade em volta da célula
            ctx.strokeStyle = '#000000';  // Cor da linha (preta)
            ctx.lineWidth = 1;            // Espessura da linha
            ctx.strokeRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

// Função para desenhar a Barbie
function desenharBarbie() {
    const [x, y] = posicaoBarbie; // Posição da Barbie
    ctx.fillStyle = '#ff69b4';  // Rosa para a Barbie
    ctx.beginPath();
    ctx.arc((y + 0.5) * CELL_SIZE, (x + 0.5) * CELL_SIZE, CELL_SIZE / 3, 0, 2 * Math.PI);
    ctx.fill();
}

// Função para desenhar os amigos
function desenharAmigos() {
    ctx.fillStyle = '#1e90ff';  // Azul para os amigos
    posicoesAmigos.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc((y + 0.5) * CELL_SIZE, (x + 0.5) * CELL_SIZE, CELL_SIZE / 3, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Função A* para encontrar a rota de menor custo
function aStar(start, goal) {
    const openSet = new Set();
    const closedSet = new Set();
    const gScore = {};
    const fScore = {};
    const cameFrom = {};

    openSet.add(JSON.stringify(start));
    gScore[JSON.stringify(start)] = 0;
    fScore[JSON.stringify(start)] = heuristic(start, goal);

    while (openSet.size > 0) {
        const current = Array.from(openSet).reduce((lowest, node) => {
            const score = fScore[node] || Infinity;
            return score < fScore[lowest] ? node : lowest;
        });

        if (JSON.stringify(current) === JSON.stringify(goal)) {
            return reconstructPath(cameFrom, current);
        }

        openSet.delete(current);
        closedSet.add(current);

        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            if (closedSet.has(JSON.stringify(neighbor))) continue;

            const tentative_gScore = gScore[JSON.stringify(current)] + custosTerreno[tabuleiro[neighbor[0]][neighbor[1]]];

            if (!openSet.has(JSON.stringify(neighbor))) {
                openSet.add(JSON.stringify(neighbor));
            } else if (tentative_gScore >= (gScore[JSON.stringify(neighbor)] || Infinity)) {
                continue;
            }

            cameFrom[JSON.stringify(neighbor)] = current;
            gScore[JSON.stringify(neighbor)] = tentative_gScore;
            fScore[JSON.stringify(neighbor)] = gScore[JSON.stringify(neighbor)] + heuristic(neighbor, goal);
        }
    }

    return []; // Retorna um caminho vazio se não encontrar um
}

// Função para calcular a heurística (distância Manhattan)
function heuristic(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

// Função para reconstruir o caminho
function reconstructPath(cameFrom, current) {
    const totalPath = [JSON.parse(current)];
    while (current in cameFrom) {
        current = cameFrom[current];
        totalPath.push(JSON.parse(current));
    }
    return totalPath.reverse(); // Retorna o caminho do início ao fim
}

// Função para obter os vizinhos de uma célula
function getNeighbors(node) {
    const [x, y] = JSON.parse(node);
    const neighbors = [];

    const directions = [
        [0, 1],  // Direita
        [1, 0],  // Abaixo
        [0, -1], // Esquerda
        [-1, 0]  // Acima
    ];

    for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newY >= 0 && newX < GRID_SIZE && newY < GRID_SIZE) {
            if (custosTerreno[tabuleiro[newX][newY]] < Infinity) {
                neighbors.push([newX, newY]);
            }
        }
    }

    return neighbors;
}

// Função principal para iniciar o jogo
function iniciarJogo() {
    desenharTabuleiro();
    desenharBarbie();
    desenharAmigos();

    // Executar A* para cada amigo
    const amigosAceitos = [];
    for (const posicaoAmigo of posicoesAmigos) {
        const caminho = aStar(posicaoBarbie, posicaoAmigo);
        if (caminho.length > 0) {
            amigosAceitos.push(posicaoAmigo);
            console.log(`Caminho para amigo em ${posicaoAmigo}:`, caminho);
        }
    }

    if (amigosAceitos.length >= 3) {
        console.log("Barbie conseguiu convencer pelo menos três amigos!");
    } else {
        console.log("Barbie não conseguiu convencer três amigos.");
    }
}

// Iniciar o jogo
iniciarJogo();
