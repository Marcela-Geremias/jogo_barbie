// Função A* para encontrar a rota de menor custo
function aStar(start, goal, tabuleiro, custosTerreno) {
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

        const neighbors = getNeighbors(current, tabuleiro, custosTerreno);
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

    return []; // Retorna um caminho vazio se não encontrar
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
function getNeighbors(node, tabuleiro, custosTerreno) {
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

        if (newX >= 0 && newY >= 0 && newX < tabuleiro.length && newY < tabuleiro[0].length) {
            if (custosTerreno[tabuleiro[newX][newY]] < Infinity) {
                neighbors.push([newX, newY]);
            }
        }
    }

    return neighbors;
}
