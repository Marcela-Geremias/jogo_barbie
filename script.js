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

// Custos dos terrenos
const custosTerreno = {
    '0': 5,   // Grama
    '1': 1,   // Asfalto
    '2': 3,   // Terra
    '3': 10,  // Paralelepípedo
    '4': Infinity // Edifícios não podem ser atravessados
};

let custoTotal = 0; // Custo total acumulado
let amigosSorteados = []; // Armazena os amigos sorteados

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

// Função para sortear três amigos aleatoriamente e mostrar os nomes
function sortearAmigos() {
    amigosSorteados = [];
    const indicesSorteados = new Set();

    while (indicesSorteados.size < 3) {
        const indiceAleatorio = Math.floor(Math.random() * posicoesAmigos.length);
        indicesSorteados.add(indiceAleatorio);
    }

    indicesSorteados.forEach(indice => amigosSorteados.push(posicoesAmigos[indice]));

    const nomesAmigos = ['Amigo 1', 'Amigo 2', 'Amigo 3', 'Amigo 4', 'Amigo 5', 'Amigo 6'];

    // Exibe os amigos sorteados no painel
    const painelAmigos = document.getElementById('painelAmigos');
    painelAmigos.innerHTML = '💖 Amigos sorteados: ' + amigosSorteados.map((amigo) => {
        const indexAmigo = posicoesAmigos.findIndex(
            (posicao) => posicao[0] === amigo[0] && posicao[1] === amigo[1]
        );
        return `<span>${nomesAmigos[indexAmigo]}</span>`;
    }).join(', ');
}


// Função A* para encontrar a rota de menor custo
function aStar(start, goal, tabuleiro) {
    const openSet = new Set([JSON.stringify(start)]); //Conj. de nós a serem explorados. Inicia no ponto de partida
    const closedSet = new Set(); //Conj. de nós já explorados
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
// Função para mover a Barbie e desenhar o caminho, visitando todos os amigos na rota de menor custo,
// mas voltando para casa assim que encontrar os três sorteados
// Variáveis para o cronômetro
let tempoInicial;
let intervaloCronometro;

// Função para iniciar o cronômetro
function iniciarCronometro() {
    tempoInicial = Date.now();
    intervaloCronometro = setInterval(atualizarCronometro, 1000);
}

// Função para atualizar o cronômetro no front-end
function atualizarCronometro() {
    const tempoAtual = Math.floor((Date.now() - tempoInicial) / 1000); // Tempo em segundos
    document.getElementById('timer').innerText = `⏱ Tempo de execução: ${tempoAtual} segundos`;
}

// Função para parar o cronômetro
function pararCronometro() {
    clearInterval(intervaloCronometro);
    const tempoTotal = Math.floor((Date.now() - tempoInicial) / 1000);
    document.getElementById('timer').innerText = `⏱ Tempo total: ${tempoTotal} segundos`;
}

// Modifique a função moverBarbie para iniciar e parar o cronômetro
async function moverBarbie() {
    iniciarCronometro(); // Inicia o cronômetro ao começar o movimento da Barbie

    const tabuleiro = await carregarTabuleiro();
    let posicaoAtual = [...posicaoBarbie];
    let amigosVisitados = 0;
    const amigosRestantes = [...posicoesAmigos];

    while (amigosRestantes.length > 0) {
        let menorCusto = Infinity;
        let amigoMaisProximo = null;
        let melhorCaminho = null;

        for (const amigo of amigosRestantes) {
            const caminho = aStar(posicaoAtual, amigo, tabuleiro);
            if (caminho) {
                const custoCaminho = caminho.reduce((total, [x, y]) => {
                    return total + custosTerreno[tabuleiro[x][y]];
                }, 0);

                if (custoCaminho < menorCusto) {
                    menorCusto = custoCaminho;
                    amigoMaisProximo = amigo;
                    melhorCaminho = caminho;
                }
            }
        }

        if (melhorCaminho) {
            for (const passo of melhorCaminho) {
                await new Promise(r => setTimeout(r, 100));
                desenharTabuleiro();
                desenharAmigos();
                posicaoAtual = passo;
                desenharBarbie(passo[0], passo[1]);

                const terrenoAtual = tabuleiro[passo[0]][passo[1]];
                custoTotal += custosTerreno[terrenoAtual];
                document.getElementById('custoMaquiagem').innerText = ` 💄 Custo da maquiagem: ${custoTotal}`;
            }

            if (amigosSorteados.some(amigo => amigo[0] === amigoMaisProximo[0] && amigo[1] === amigoMaisProximo[1])) {
                amigosVisitados += 1;
            }

            const index = amigosRestantes.indexOf(amigoMaisProximo);
            if (index > -1) {
                amigosRestantes.splice(index, 1);
            }

            if (amigosVisitados >= 3) {
                break;
            }
        } else {
            console.log('Nenhum caminho foi encontrado para o próximo amigo.');
            break;
        }
    }

    const caminhoDeVolta = aStar(posicaoAtual, posicaoBarbie, tabuleiro);
    if (caminhoDeVolta) {
        for (const passo of caminhoDeVolta) {
            await new Promise(r => setTimeout(r, 100));
            desenharTabuleiro();
            desenharAmigos();
            posicaoAtual = passo;
            desenharBarbie(passo[0], passo[1]);

            const terrenoAtual = tabuleiro[passo[0]][passo[1]];
            custoTotal += custosTerreno[terrenoAtual];
            document.getElementById('custoMaquiagem').innerText = ` 💄 Custo da maquiagem: ${custoTotal}`;
        }
    }

    pararCronometro(); // Para o cronômetro quando a Barbie completa a rota

    alert(`Custo total da rodada: ${custoTotal}`);
}


// Função para iniciar o jogo
async function iniciarJogo() {
    await desenharTabuleiro(); // Desenha o tabuleiro
    desenharAmigos(); // Desenha os amigos
    desenharBarbie(posicaoBarbie[0], posicaoBarbie[1]); // Desenha a Barbie
    sortearAmigos(); // Sorteia os amigos
    moverBarbie(); // Inicia o movimento da Barbie
}

// Inicia o jogo quando a página carregar
window.onload = iniciarJogo;
