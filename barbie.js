
class Barbie {
    constructor(posicaoInicial, mapa) {
        this.posicao = posicaoInicial;
        this.mapa = mapa;
        this.amigos = [[10, 5], [30, 35], [5, 10]];
        this.convidados = [];
    }

    moverPara(objetivo) {
        let caminho = aStar(this.mapa, this.posicao, objetivo);
        if (caminho.length > 0) {
            this.posicao = caminho[0];  // Movimenta-se para a próxima posição no caminho
            console.log(`Barbie moveu-se para ${this.posicao}`);
        }
    }

    convencerAmigo(amigo) {
        if (!this.convidados.includes(amigo)) {
            console.log(`Barbie convidou ${amigo} para o concurso!`);
            this.convidados.push(amigo);
        }
    }

    jornada() {
        if (this.amigos.length > this.convidados.length) {
            let proximoAmigo = this.amigos[this.convidados.length];
            this.moverPara(proximoAmigo);
            if (this.posicao[0] === proximoAmigo[0] && this.posicao[1] === proximoAmigo[1]) {
                this.convencerAmigo(proximoAmigo);
            }
        } else {
            this.moverPara([19, 23]);  // Voltar para casa
        }
    }

    desenhar(tamanhoCelula) {
        let [x, y] = this.posicao;
        fill(255, 182, 193);  // Cor rosa
        ellipse(y * tamanhoCelula + tamanhoCelula / 2, x * tamanhoCelula + tamanhoCelula / 2, tamanhoCelula * 0.8);
    }
}
