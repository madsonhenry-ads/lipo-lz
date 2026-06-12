
function inserirMesTitulo() {
    const hoje = new Date();
    const tituloMes = document.getElementById('titulo-mes');
    const data = document.getElementById('data');

    if (tituloMes) {
        tituloMes.textContent = hoje.toLocaleString('en-US', { month: 'long' });
    }

    if (data) {
        data.textContent = hoje.toLocaleDateString();
    }
}

inserirMesTitulo();

//SCRIPT DO ITENS REDUZINDO
function getRandomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function decreaseItems() {
    const itensLeftElements = document.querySelectorAll('.estoque-reduzir');

    itensLeftElements.forEach(element => {
        let currentValue = parseInt(element.textContent);
        if (currentValue > 0) {
            element.textContent = currentValue - 1;
        }
    });

    const nextInterval = getRandomInterval(40, 120); //faixa de intervalos
    setTimeout(decreaseItems, nextInterval * 1000);
}

//ativa a função
decreaseItems();

//Função do countdown
function iniciarCountdown() {
    const timerEl = document.getElementById('countdown-timer');
    if (!timerEl) return;

    const COUNTDOWN_DURATION = 30 * 60; // 30 minutos em segundos
    const endTime = Date.now() + COUNTDOWN_DURATION * 1000;

    let countdownInterval = null;

    if (window.countdownIntervalGlobal) {
        clearInterval(window.countdownIntervalGlobal);
    }

    function atualizarCountdown() {
        const agora = Date.now();
        const restante = Math.max(0, Math.floor((endTime - agora) / 1000));
        const min = Math.floor(restante / 60);
        const seg = restante % 60;
        timerEl.textContent = `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;

        if (restante <= 0) {
            clearInterval(countdownInterval);
        }
    }

    timerEl.textContent = '30:00';
    atualizarCountdown();
    countdownInterval = setInterval(atualizarCountdown, 1000);
    window.countdownIntervalGlobal = countdownInterval;
}

//Função de esconder
function esconder(tempoAlvo, seletorAlvo = '.esconder') {

    let segundosParaExibir;
    const classeParaRemover = seletorAlvo.startsWith('.') ? seletorAlvo.substring(1) : seletorAlvo; // Remove o ponto inicial se houver

    // Verifica o tempo
    if (typeof tempoAlvo === 'number') {
        segundosParaExibir = tempoAlvo;
    } else if (typeof tempoAlvo === 'string') {
        if (tempoAlvo.includes(':')) {
            const partes = tempoAlvo.split(':');
            const minutos = parseInt(partes[0], 10);
            const segundos = parseInt(partes[1], 10);
            if (!isNaN(minutos) && !isNaN(segundos)) {
                segundosParaExibir = (minutos * 60) + segundos;
            } else {
                console.error(`[esconder] Formato de tempo inválido: "${tempoAlvo}". Use número de segundos ou "m:s".`);
                return;
            }
        } else {
            segundosParaExibir = parseInt(tempoAlvo, 10);
            if (isNaN(segundosParaExibir)) {
                console.error(`[esconder] Formato de tempo inválido: "${tempoAlvo}". Use número de segundos ou "m:s".`);
                return;
            }
        }
    } else {
        console.error(`[esconder] Tipo de tempo inválido: ${typeof tempoAlvo}. Use número de segundos ou "m:s".`);
        return;
    }

    if (typeof segundosParaExibir !== 'number' || isNaN(segundosParaExibir) || segundosParaExibir < 0) {
        console.error(`[esconder] Tempo calculado inválido: ${segundosParaExibir}.`);
        return;
    }

    const chaveLocalStorage = `visivel_${classeParaRemover}_${segundosParaExibir}`;
    const jaExibido = localStorage.getItem(chaveLocalStorage);
    let elementosExibidos = false; // Evita ficar em loop
    let tentativasPlayer = 0;
    const maxTentativasPlayer = 20; // Numero de tentativas

    // Remove a classe
    const exibirElementos = () => {
        if (elementosExibidos) return; // Evita execuções múltiplas

        const quizzContainer = document.getElementById('quizz-container');
        if (quizzContainer) {
            console.log('[esconder] Removendo classe "esconder" de #quizz-container');
            quizzContainer.classList.remove('esconder');

            // Adiciona .esconder em #fb-comments
            const fbComments = document.getElementById('fb-comments');
            if (fbComments) {
                fbComments.classList.add('esconder');
                console.log('[esconder] Classe "esconder" adicionada em #fb-comments');
            }

            elementosExibidos = true;
            localStorage.setItem(chaveLocalStorage, 'true');
            console.log(`[esconder] Estado salvo no localStorage: ${chaveLocalStorage}=true`);
            iniciarCountdown();
        } else {
            console.warn('[esconder] Elemento #quizz-container não encontrado.');
        }
    };

    const iniciarMonitoramentoVideo = () => {
        // Verifica o SmartPlayer
        if (typeof smartplayer === 'undefined' || !(smartplayer.instances && smartplayer.instances.length)) {
            if (tentativasPlayer >= maxTentativasPlayer) {
                console.warn(`[esconder] SmartPlayer não encontrado após ${maxTentativasPlayer} tentativas. Usando setTimeout como fallback.`);
                // Se o player não carregar, usa contador antigo com base em segundos
                setTimeout(exibirElementos, segundosParaExibir * 1000);
                return;
            }
            tentativasPlayer++;
            console.log(`[esconder] Tentativa ${tentativasPlayer}: Aguardando SmartPlayer...`);
            setTimeout(iniciarMonitoramentoVideo, 1000); // Tenta novamente se precisar
            return;
        }

        console.log("[esconder] SmartPlayer encontrado. Configurando listener 'timeupdate'.");
        const player = smartplayer.instances[0];

        const verificarTempoVideo = () => {
            // Não faz nada se já exibiu ou se o player está em modo autoplay
            if (elementosExibidos || player.smartAutoPlay) {
                return;
            }
            // Verifica se bateu o tempo
            if (player.video.currentTime >= segundosParaExibir) {
                console.log(`[esconder] Tempo do vídeo (${player.video.currentTime.toFixed(2)}s) atingiu o alvo (${segundosParaExibir}s).`);
                exibirElementos();
                player.off('timeupdate', verificarTempoVideo);
            }
        };

        player.on('timeupdate', verificarTempoVideo);

        if (!elementosExibidos && !player.smartAutoPlay && player.video.currentTime >= segundosParaExibir) {
            console.log("[esconder] Tempo do vídeo já ultrapassado na inicialização.");
            exibirElementos();
            player.off('timeupdate', verificarTempoVideo); // Para o listener se já executou
        }
    };

    //Verificar localStorage ou iniciar monitoramento
    console.log(`[esconder] Configurado para exibir "${seletorAlvo}" após ${segundosParaExibir} segundos.`);

    if (jaExibido === 'true') {
        console.log("[esconder] Elementos já exibidos anteriormente (localStorage). Exibindo imediatamente.");
        setTimeout(exibirElementos, 50);
    } else {
        console.log("[esconder] Elementos não exibidos anteriormente. Iniciando monitoramento do vídeo/timer.");
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', iniciarMonitoramentoVideo);
        } else {
            iniciarMonitoramentoVideo();
        }
    }
}

function faq(elemento) {
    // Seleciona o container do FAQ
    const container = document.getElementById('faq-container');

    // Remove a classe 'ativo' de todas as perguntas e respostas
    const todasPerguntas = container.querySelectorAll('.pergunta');
    const todasRespostas = container.querySelectorAll('.resposta');

    todasPerguntas.forEach(pergunta => {
        pergunta.classList.remove('ativo');
        // Restaura todos os ícones para 'abrir.svg'
        const icone = pergunta.querySelector('.pergunta-icone');
        icone.src = 'media/abrir.svg';
    });

    todasRespostas.forEach(resposta => {
        resposta.classList.remove('ativo');
    });

    // Adiciona 'ativo' na pergunta clicada
    elemento.classList.add('ativo');

    // Encontra a próxima div de resposta após a pergunta
    const resposta = elemento.nextElementSibling;
    if (resposta && resposta.classList.contains('resposta')) {
        resposta.classList.add('ativo');
    }

    // Altera o ícone da pergunta atual
    const iconeAtual = elemento.querySelector('.pergunta-icone');
    iconeAtual.src = iconeAtual.src.includes('abrir.svg')
        ? 'media/fechar.svg'
        : 'media/abrir.svg';
}

function converterTempo(stringTempo) {
    if (typeof stringTempo !== 'string') return { horas: 0, minutos: 0, segundos: 0 };
    const partes = stringTempo.split(':');
    if (partes.length !== 3) return { horas: 0, minutos: 0, segundos: 0 }; // Basic validation
    const horas = parseInt(partes[0], 10) || 0;
    const minutos = parseInt(partes[1], 10) || 0;
    const segundos = parseInt(partes[2], 10) || 0;
    return { horas, minutos, segundos };
}

function formatarTempo(horas, minutos, segundos) {
    const zeroEsquerda = (numero) => numero.toString().padStart(2, '0');
    return `${zeroEsquerda(minutos)}:${zeroEsquerda(segundos)}`;
}

function cronometro() {
    const timers = document.querySelectorAll('.contador');
    timers.forEach(timer => {
        let tempoPartes = converterTempo(timer.textContent);
        let { horas, minutos, segundos } = tempoPartes;
        let intervalId = null; // Store interval ID

        function updateTimer() {
            if (segundos > 0) {
                segundos--;
            } else if (minutos > 0) {
                minutos--;
                segundos = 59;
            } else if (horas > 0) {
                horas--;
                minutos = 59;
                segundos = 59;
            } else {
                clearInterval(intervalId);
                timer.textContent = formatarTempo(0, 0, 0);
                return;
            }
            timer.textContent = formatarTempo(horas, minutos, segundos);
        }


        if (timer.dataset.intervalId) {
            clearInterval(parseInt(timer.dataset.intervalId));
        }

        intervalId = setInterval(updateTimer, 1000);
        timer.dataset.intervalId = intervalId.toString();
    });
}


function setParams() {
    const queryString = window.location.search;
    const botoes = document.querySelectorAll("[data-cta-button]");

    if (!botoes.length) {
        return;
    }

    const hrefBase = botoes[0].getAttribute("href");
    if (!hrefBase) {
        return;
    }

    for (let i = 0; i < botoes.length; i++) {
        botoes[i].setAttribute("href", hrefBase + queryString);
    }
}
setParams();

function revelarOfertaQuiz() {
    const quizzContainer = document.getElementById('quizz-container');
    const conteudoPrincipal = document.getElementById('conteudo-principal');
    const fbComments = document.getElementById('fb-comments');

    if (quizzContainer) {
        quizzContainer.classList.add('esconder');
    }

    if (conteudoPrincipal) {
        conteudoPrincipal.classList.remove('esconder');
    }

    if (fbComments) {
        fbComments.classList.add('esconder');
    }

    iniciarCountdown();
}

function formatarTempoQuiz(segundos) {
    return `00:${String(segundos).padStart(2, '0')}`;
}

function initLipotideQuiz() {
    const quiz = document.getElementById('lipotide-quiz');
    if (!quiz) {
        return;
    }

    const paineis = Array.from(quiz.querySelectorAll('.quiz-panel'));
    const barraProgresso = document.getElementById('quiz-progress-fill');
    const labelProgresso = document.getElementById('quiz-progress-label');
    const botaoIniciar = quiz.querySelector('[data-quiz-start]');
    const botaoCalcular = quiz.querySelector('[data-quiz-calculate]');
    const timerQuiz = document.getElementById('quiz-timer');
    const barraLoader = document.getElementById('quiz-loader-bar');
    const itensLoader = Array.from(quiz.querySelectorAll('.quiz-loading-item'));
    const ordemPaineis = ['intro', 'age', 'weight', 'height', 'goal', 'target', 'loading', 'result'];
    const proximoPainel = {
        intro: 'age',
        age: 'weight',
        weight: 'height',
        height: 'goal',
        goal: 'target',
        target: 'loading',
        loading: 'result'
    };
    const respostas = {
        age: '',
        weight: '',
        height: '',
        goal: '',
        targetAreas: []
    };

    let painelAtual = 'intro';
    let intervaloLoading = null;
    let timeoutLoading = null;

    function limparLoading() {
        if (intervaloLoading) {
            clearInterval(intervaloLoading);
            intervaloLoading = null;
        }

        if (timeoutLoading) {
            clearTimeout(timeoutLoading);
            timeoutLoading = null;
        }
    }

    function atualizarProgresso(painel) {
        if (!painel) {
            return;
        }

        if (labelProgresso) {
            labelProgresso.textContent = painel.dataset.progressLabel || 'Welcome';
        }

        if (barraProgresso) {
            barraProgresso.style.width = `${painel.dataset.progress || 0}%`;
        }
    }

    function atualizarAreasSelecionadas() {
        const checkboxes = Array.from(quiz.querySelectorAll('input[name="target-area"]'));
        respostas.targetAreas = checkboxes.filter(input => input.checked).map(input => input.value);

        checkboxes.forEach(input => {
            const card = input.closest('.quiz-check-card');
            if (card) {
                card.classList.toggle('is-selected', input.checked);
            }
        });

        if (botaoCalcular) {
            botaoCalcular.disabled = respostas.targetAreas.length === 0;
        }
    }

    function sincronizarSelecoes() {
        const botoesEscolha = quiz.querySelectorAll('.quiz-choice');
        botoesEscolha.forEach(botao => {
            const chave = botao.dataset.answerKey;
            const valor = botao.dataset.answerValue;
            botao.classList.toggle('is-selected', respostas[chave] === valor);
        });

        atualizarAreasSelecionadas();
    }

    function iniciarLoading() {
        limparLoading();

        if (timerQuiz) {
            timerQuiz.textContent = formatarTempoQuiz(6);
        }

        if (barraLoader) {
            barraLoader.style.width = '0%';
            barraLoader.style.transition = 'width 6s linear';
            requestAnimationFrame(() => {
                barraLoader.style.width = '100%';
            });
        }

        itensLoader.forEach((item, index) => {
            item.style.opacity = index === 0 ? '1' : '0.12';
        });

        let restante = 6;

        intervaloLoading = setInterval(() => {
            restante -= 1;

            if (timerQuiz) {
                timerQuiz.textContent = formatarTempoQuiz(Math.max(restante, 0));
            }

            const indiceAtivo = Math.min(3, 6 - restante - 1);
            itensLoader.forEach((item, index) => {
                item.style.opacity = index <= indiceAtivo ? '1' : '0.12';
            });

            if (restante <= 0) {
                limparLoading();
                mostrarPainel('result');
            }
        }, 1000);

        timeoutLoading = setTimeout(() => {
            limparLoading();
            mostrarPainel('result');
        }, 6200);
    }

    function mostrarPainel(nomePainel) {
        const painel = paineis.find(item => item.dataset.panel === nomePainel);
        if (!painel) {
            return;
        }

        limparLoading();

        paineis.forEach(item => {
            item.classList.toggle('active', item === painel);
        });

        painelAtual = nomePainel;
        atualizarProgresso(painel);
        sincronizarSelecoes();

        if (nomePainel === 'loading') {
            iniciarLoading();
        }

    }

    if (botaoIniciar) {
        botaoIniciar.addEventListener('click', () => {
            mostrarPainel('age');
        });
    }

    quiz.querySelectorAll('[data-quiz-back]').forEach(botao => {
        botao.addEventListener('click', () => {
            const painel = botao.closest('.quiz-panel');
            if (!painel) {
                return;
            }

            const indiceAtual = ordemPaineis.indexOf(painel.dataset.panel);
            if (indiceAtual > 0) {
                mostrarPainel(ordemPaineis[indiceAtual - 1]);
            }
        });
    });

    quiz.querySelectorAll('.quiz-choice').forEach(botao => {
        botao.addEventListener('click', () => {
            const chave = botao.dataset.answerKey;
            const valor = botao.dataset.answerValue;
            const painel = botao.closest('.quiz-panel');
            if (!chave || !valor || !painel) {
                return;
            }

            respostas[chave] = valor;
            sincronizarSelecoes();

            const nomeAtual = painel.dataset.panel;
            const nomeSeguinte = proximoPainel[nomeAtual];

            if (nomeSeguinte) {
                setTimeout(() => {
                    mostrarPainel(nomeSeguinte);
                }, 180);
            }
        });
    });

    quiz.querySelectorAll('input[name="target-area"]').forEach(input => {
        input.addEventListener('change', atualizarAreasSelecionadas);
    });

    if (botaoCalcular) {
        botaoCalcular.addEventListener('click', () => {
            atualizarAreasSelecionadas();
            if (!respostas.targetAreas.length) {
                return;
            }

            mostrarPainel('loading');
        });
    }

    quiz.querySelectorAll('[data-quiz-scroll]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            revelarOfertaQuiz();

            const destino = document.getElementById('produtos1');
            if (destino) {
                destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    atualizarProgresso(paineis[0]);
    atualizarAreasSelecionadas();
}

initLipotideQuiz();


function popupSaida(tempo, intervaloInicial = 0) {
    let tempoInativo = tempo * 1000; // Converter segundos para milissegundos
    let temporizador;
    let popupAtivo = false;
    let eventosAtivos = false;

    // HTML do popup
    const conteudoPopup = `
        <style>
            #popup-saida {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 999999;
                width: 100%;
                height: 100svh;
                background: #00000075;
                backdrop-filter: blur(2px) brightness(0.5);
            }

            #popup-info {
                background: #fff;
                padding: 20px;
                border: 1px solid #c1c1c1;
                border-radius: 12px;
                max-width: 450px;
                width: 85%;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            #popup-info h1 {
                color: #dd0202;
                text-align: center;
            }

            #popup-info h5 {
                color: #444444;
                text-align: center;
                padding: 12px 0px;
            }

            #popup-botao {
                border-radius: 6px;
                padding: 12px 35px;
                background: #1d7de3;
                color: #fff;
                font-weight: 800;
                font-size: 1.25em;
                margin-top: 24px;
                cursor: pointer;
                border: 2px solid #036edf;
            }

            .popup-icone {
                font-size: 6em;
            }
            #popup-close {
                position: absolute;
                right: 8px;
                top: 6px;
            }
        </style>
        <div id="popup-saida">
            <div id="popup-info">
                <span id="popup-close">❌</span>
                <span class="popup-icone">⚠️</span>
                <h1>WAIT!</h1>
                <h5>This little-known British discovery is transforming lives — but could disappear without warning. Watch now.</h5>
                <a id="popup-botao">Watch Now</a>
            </div>
        </div>`;

    // Função para mostrar o popup
    function mostrarPopup() {
        if (!popupAtivo && eventosAtivos) {
            document.body.insertAdjacentHTML('beforeend', conteudoPopup);
            popupAtivo = true;

            // Adiciona eventos de fechamento após garantir que os elementos existem
            setTimeout(() => {
                const popupClose = document.getElementById('popup-close');
                const popupBotao = document.getElementById('popup-botao');
                const popupOverlay = document.getElementById('popup-overlay');

                if (popupClose) {
                    popupClose.addEventListener('click', removerPopup);
                }
                if (popupBotao) {
                    popupBotao.addEventListener('click', removerPopup);
                }
                if (popupOverlay) {
                    popupOverlay.addEventListener('click', function (e) {
                        if (e.target.id === 'popup-overlay') {
                            removerPopup();
                        }
                    });
                }
            }, 250);
        }
    }

    // Detectar movimento do mouse próximo às bordas
    function verificarBordas(e) {
        if (!popupAtivo && eventosAtivos) {
            const limitesBorda = 50;
            if (
                e.clientX <= limitesBorda || // Borda esquerda
                e.clientX >= window.innerWidth - limitesBorda || // Borda direita
                e.clientY <= limitesBorda || // Borda superior
                e.clientY >= window.innerHeight - limitesBorda // Borda inferior
            ) {
                mostrarPopup();
            }
        }
    }

    // Função para remover o popup
    function removerPopup() {
        const popup = document.getElementById('popup-saida');
        if (popup) {
            popup.remove();
            popupAtivo = true;
        }
    }

    // Detectar inatividade
    function reiniciarTemporizador() {
        if (eventosAtivos) {
            clearTimeout(temporizador);
            temporizador = setTimeout(mostrarPopup, tempoInativo);
        }
    }

    // Função para iniciar os eventos após o intervalo inicial
    function iniciarEventos() {
        eventosAtivos = true;

        document.addEventListener('mousemove', verificarBordas);
        document.addEventListener('mousemove', reiniciarTemporizador);
        document.addEventListener('keypress', reiniciarTemporizador);
        document.addEventListener('click', reiniciarTemporizador);
        document.addEventListener('scroll', reiniciarTemporizador);

        // Inicia o temporizador de inatividade
        reiniciarTemporizador();
    }

    // Aguarda o intervalo inicial antes de ativar os eventos
    setTimeout(iniciarEventos, intervaloInicial * 1000);
}

//popupSaida(30, 15);
