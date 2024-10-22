// Tamanho do tabuleiro e células
const CANVAS_SIZE = 840;
const GRID_SIZE = 42;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Posições da Barbie e dos amigos
const posicaoBarbie = [22, 18]; // Posição da Barbie
const posicoesAmigos = [
    [4, 12],   // Amigo 1
    [9, 8],    // Amigo 2
    [35, 14],  // Amigo 3
    [5, 34],   // Amigo 4
    [23, 37],  // Amigo 5
    [36, 36]   // Amigo 6
];

const custosTerreno = {
    '0': 5,   // Grama
    '1': 1,   // Asfalto
    '2': 3,   // Terra
    '3': 10,  // Paralelepípedo
    '4': Infinity // Edifícios não podem ser atravessados
};

let custoTotal = 0; // Custo total acumulado

// Função para carregar o tabuleiro do arquivo txt
async function carregarTabuleiro() {
    const response = await fetch('tabuleiro.txt');
    const data = await response.text();
    return data.split('\n').map(row => row.trim());
}

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
async function desenharTabuleiro() {
    const tabuleiro = await carregarTabuleiro();
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
function desenharBarbie(x, y) {
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
function aStar(start, goal, tabuleiro) {
    const openSet = new Set([JSON.stringify(start)]);
    const closedSet = new Set();
    const gScore = {};
    const fScore = {};
    const cameFrom = {};

    gScore[JSON.stringify(start)] = 0;
    fScore[JSON.stringify(start)] = heuristic(start, goal);

    while (openSet.size > 0) {
        const current = Array.from(openSet).reduce((lowest, node) => {
            return (fScore[node] || Infinity) < (fScore[lowest] || Infinity) ? node : lowest;
        });

        const currentPos = JSON.parse(current);

        if (current === JSON.stringify(goal)) {
            return reconstructPath(cameFrom, currentPos);
        }

        openSet.delete(current);
        closedSet.add(current);

        const neighbors = getNeighbors(currentPos, tabuleiro);

        for (const neighbor of neighbors) {
            const neighborKey = JSON.stringify(neighbor);
            if (closedSet.has(neighborKey)) continue;

            const tentativeGScore = gScore[current] + custosTerreno[tabuleiro[neighbor[0]][neighbor[1]]];

            if (!openSet.has(neighborKey)) {
                openSet.add(neighborKey);
            } else if (tentativeGScore >= gScore[neighborKey]) {
                continue;
            }

            cameFrom[neighborKey] = currentPos;
            gScore[neighborKey] = tentativeGScore;
            fScore[neighborKey] = tentativeGScore + heuristic(neighbor, goal);
        }
    }

    return null; // Caminho não encontrado
}

function heuristic([x1, y1], [x2, y2]) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2); // Distância de Manhattan (sem diagonal)
}

function getNeighbors([x, y], tabuleiro) {
    const neighbors = [];
    if (x > 0) neighbors.push([x - 1, y]);
    if (x < GRID_SIZE - 1) neighbors.push([x + 1, y]);
    if (y > 0) neighbors.push([x, y - 1]);
    if (y < GRID_SIZE - 1) neighbors.push([x, y + 1]);
    return neighbors.filter(([nx, ny]) => custosTerreno[tabuleiro[nx][ny]] < Infinity); // Evita edifícios
}

function reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom[JSON.stringify(current)]) {
        current = cameFrom[JSON.stringify(current)];
        path.push(current);
    }
    return path.reverse();
}

// Função para mover a Barbie e desenhar o caminho
async function moverBarbie() {
    const tabuleiro = await carregarTabuleiro();
    const amigosVisitados = [];
    let posicaoAtual = [...posicaoBarbie];

    for (const amigo of posicoesAmigos) {
        const caminho = aStar(posicaoAtual, amigo, tabuleiro);
        if (caminho) {
            for (const passo of caminho) {
                await new Promise(r => setTimeout(r, 200));  // Pausa para a animação
                desenharTabuleiro();  // Redesenha o tabuleiro
                desenharAmigos();     // Mantém os amigos visíveis
                posicaoAtual = passo;
                desenharBarbie(passo[0], passo[1]);  // Desenha a Barbie em cada passo

                // Atualiza o custo total
                custoTotal += custosTerreno[tabuleiro[passo[0]][passo[1]]];
                document.getElementById('custoMaquiagem').innerText = `Custo da maquiagem: ${custoTotal}`; // Atualiza o custo no HTML
            }
            amigosVisitados.push(amigo); // Adiciona o amigo encontrado
        }
    }

    // Após encontrar todos os amigos, retornar para casa
    const caminhoDeVolta = aStar(posicaoAtual, posicaoBarbie, tabuleiro);
    if (caminhoDeVolta) {
        for (const passo of caminhoDeVolta) {
            await new Promise(r => setTimeout(r, 200));  // Pausa para a animação
            desenharTabuleiro();  // Redesenha o tabuleiro
            desenharAmigos();     // Mantém os amigos visíveis
            posicaoAtual = passo;
            desenharBarbie(passo[0], passo[1]);  // Desenha a Barbie em cada passo

            // Atualiza o custo total
            custoTotal += custosTerreno[tabuleiro[passo[0]][passo[1]]];
            document.getElementById('custoMaquiagem').innerText = `Custo da maquiagem: ${custoTotal}`; // Atualiza o custo no HTML
        }
    }

    // Exibir popup com o custo total final
    alert(`Custo total da rodada: ${custoTotal}`);
}

// Iniciar o jogo
desenharTabuleiro().then(moverBarbie);
