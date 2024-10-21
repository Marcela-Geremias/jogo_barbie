function aStar(mapa, inicio, objetivo) {
    let aberto = [];
    let fechado = [];
    let caminho = [];

    aberto.push({ pos: inicio, custo: 0 });

    while (aberto.length > 0) {
        let atual = aberto.shift();
        fechado.push(atual);

        if (atual.pos[0] === objetivo[0] && atual.pos[1] === objetivo[1]) {
            let atualPos = atual.pos;
            caminho.push(atualPos);
            return caminho.reverse();
        }

        let vizinhos = obterVizinhos(atual.pos);

        for (let vizinho of vizinhos) {
            let novoCusto = atual.custo + mapa.obterCusto(vizinho);
            let existeNoAberto = aberto.some(n => n.pos[0] === vizinho[0] && n.pos[1] === vizinho[1]);

            if (!existeNoAberto) {
                aberto.push({ pos: vizinho, custo: novoCusto });
                caminho.push(vizinho);
            }
        }
    }
    return caminho;
}

function obterVizinhos(posicao) {
    let [x, y] = posicao;
    let vizinhos = [];

    let direcoes = [[-1, 0], [1, 0], [0, -1], [0, 1]];  // Cima, baixo, esquerda, direita
    for (let [dx, dy] of direcoes) {
        let novoX = x + dx;
        let novoY = y + dy;
        if (novoX >= 0 && novoX < 42 && novoY >= 0 && novoY < 42) {
            vizinhos.push([novoX, novoY]);
        }
    }
    return vizinhos;
}
