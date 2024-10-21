let mapa;
let barbie;
const TAMANHO_CELULA = 20;
const CORES = {
    "asfalto": [169, 169, 169],
    "grama": [0, 255, 0],
    "terra": [139, 69, 19],
    "paralelepipedo": [211, 211, 211],
    "edificio": [255, 165, 0]
};

function setup() {
    createCanvas(840, 840); // Tamanho da tela (42 * 20)
    mapa = new Mapa();
    barbie = new Barbie([19, 23], mapa);
    frameRate(5);  // Controla a velocidade do movimento
}

function draw() {
    background(255);

    // Desenha o mapa
    mapa.desenharMapa(TAMANHO_CELULA, CORES);

    // Desenha a Barbie
    barbie.desenhar(TAMANHO_CELULA);

    // Executa a jornada da Barbie
    if (barbie.amigos.length > barbie.convidados.length) {
        barbie.jornada();
    }
}
