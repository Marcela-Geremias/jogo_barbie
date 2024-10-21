class Mapa {
    constructor() {
        // Inicializa a matriz 42x42 como 'asfalto'
        this.mapa = Array(42).fill().map(() => Array(42).fill('asfalto'));
        this.definirTerrenos();
    }

    definirTerrenos() {
        // Exemplo de definição de terrenos
        this.preencherRegiao(5, 10, 5, 10, 'terra');
        this.preencherRegiao(10, 20, 20, 25, 'grama');
        this.preencherRegiao(30, 35, 35, 40, 'paralelepipedo');
        this.preencherRegiao(15, 18, 10, 12, 'edificio');
    }

    preencherRegiao(linhaInicio, linhaFim, colunaInicio, colunaFim, tipo) {
        for (let i = linhaInicio; i < linhaFim; i++) {
            for (let j = colunaInicio; j < colunaFim; j++) {
                this.mapa[i][j] = tipo;
            }
        }
    }

    desenharMapa(tamanhoCelula, cores) {
        for (let i = 0; i < 42; i++) {
            for (let j = 0; j < 42; j++) {
                let terreno = this.mapa[i][j];
                fill(cores[terreno] || [0, 0, 0]);  // Preta se não for definida
                rect(j * tamanhoCelula, i * tamanhoCelula, tamanhoCelula, tamanhoCelula);
            }
        }
    }

    obterCusto(posicao) {
        let [x, y] = posicao;
        let terreno = this.mapa[x][y];
        const CUSTOS = {
            "asfalto": 1,
            "grama": 3,
            "terra": 2,
            "paralelepipedo": 1.5,
            "edificio": Infinity
        };
        return CUSTOS[terreno] || 1;
    }
}
