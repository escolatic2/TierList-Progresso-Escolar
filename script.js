// 1. DADOS INICIAIS DAS EQUIPAS
// **IMPORTANTE: Edite esta lista com as suas equipas e URLs de imagem.**
let teamsData = [
    { id: 1, name: "Os Batatas", points: 55, imageUrl: "images/osbatatas.jpg" },
    { id: 2, name: "The Best", points: 35, imageUrl: "images/thebest.png" },
    { id: 3, name: "Os Laggers", points: 45, imageUrl: "images/oslaggers.jpg" },
    // { id: 4, name: "?? Guerreiros do Bit", points: 5, imageUrl: "https://i.imgur.com/example4.png" },
    // { id: 5, name: "?? Syntax Errors", points: 5, imageUrl: "https://i.imgur.com/example5.png" }
    // Adicione mais equipas aqui
];

// 2. REGRAS DA TIER LIST
// Define os limites mínimos de pontos para cada Tier.
const TIER_RULES = [
    { tier: "S", minPoints: 55, label: "Tier S (Atingiu o Objetivo Máximo)" },
    { tier: "A", minPoints: 45, label: "Tier A (Excelente Progresso)" },
    { tier: "B", minPoints: 35, label: "Tier B (Bom Progresso)" },
    { tier: "C", minPoints: 25, label: "Tier C (Avança de Forma Constante)" },
    { tier: "D", minPoints: 15, label: "Tier D (A Começar)" }
];

// Função para obter a Tier de uma equipa com base na sua pontuação
function getTeamTier(points) {
    // As regras devem estar ordenadas por 'minPoints' de forma decrescente
    for (const rule of TIER_RULES) {
        if (points >= rule.minPoints) {
            return rule.tier;
        }
    }
    return "D"; // Tier padrão se não cumprir nenhuma regra
}

// 3. PERSISTÊNCIA DE DADOS (USANDO localStorage)
const STORAGE_KEY = 'teamsTierListProgress';

// Carrega os dados da localStorage ou usa os dados iniciais
function loadTeamsData() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        teamsData = JSON.parse(storedData);
    }
    // Garante que só os dados que podem ser atualizados (os pontos) são persistidos
    // e que os nomes e URLs permanecem como definidos inicialmente,
    // caso tenha editado a lista em 'teamsData'.
}

// Guarda os dados na localStorage
function saveTeamsData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teamsData));
}

// 4. LÓGICA DE RENDERIZAÇÃO
function renderTierList() {
    const container = document.getElementById('tier-list-container');
    container.innerHTML = ''; // Limpa o conteúdo anterior

    // Organiza as equipas por Tier
    const teamsByTier = TIER_RULES.reduce((acc, rule) => {
        acc[rule.tier] = [];
        return acc;
    }, {});

    teamsData.forEach(team => {
        const tier = getTeamTier(team.points);
        teamsByTier[tier].push(team);
    });
    
    // Renderiza cada Tier
    TIER_RULES.forEach(rule => {
        const tierSection = document.createElement('section');
        tierSection.className = 'tier';
        tierSection.id = `tier-${rule.tier}`;
        
        tierSection.innerHTML = `
            <h2>${rule.label}</h2>
            <div class="team-list" id="team-list-${rule.tier}">
                </div>
        `;

        const teamListDiv = tierSection.querySelector(`#team-list-${rule.tier}`);
        
        // Ordena as equipas dentro da Tier por pontos (do maior para o menor)
        teamsByTier[rule.tier].sort((a, b) => b.points - a.points);

        teamsByTier[rule.tier].forEach(team => {
            const teamCard = document.createElement('div');
            teamCard.className = 'team-card';
            teamCard.setAttribute('data-team-id', team.id);

            // Se o professor estiver a ver a página, pode atualizar
            const isAdmin = true; // Assumimos que quem publica a página é quem tem controlo.
                                  // Se quiser proteger isto, seria necessário um back-end.

            const updateControls = isAdmin ? `
                <button class="add-points" data-team-id="${team.id}" data-action="add">+</button>
                <button class="add-points remove-points" data-team-id="${team.id}" data-action="remove">-</button>
            ` : '';

            teamCard.innerHTML = `
                <img src="${team.imageUrl}" alt="Logo da ${team.name}">
                <div class="team-info">
                    <h3>${team.name}</h3>
                    <p>Pontos: <span class="points-value">${team.points}</span></p>
                </div>
                <div class="team-controls">
                    ${updateControls}
                </div>
            `;
            teamListDiv.appendChild(teamCard);
        });

        if (teamsByTier[rule.tier].length > 0) {
            container.appendChild(tierSection);
        }
    });

    // Adiciona os event listeners aos botões
    if (isAdmin) {
        document.querySelectorAll('.add-points').forEach(button => {
            button.addEventListener('click', handlePointChange);
        });
    }
}

// 5. FUNÇÃO PARA ATUALIZAR PONTOS
function handlePointChange(event) {
    const teamId = parseInt(event.target.dataset.teamId);
    const action = event.target.dataset.action;
    
    const team = teamsData.find(t => t.id === teamId);
    
    if (team) {
        if (action === 'add') {
            team.points += 1;
        } else if (action === 'remove' && team.points > 0) {
            team.points -= 1;
        }
        
        saveTeamsData(); // Guarda o novo estado
        renderTierList(); // Renderiza novamente a lista
    }
}

// 6. INICIALIZAÇÃO
// Carrega os dados e renderiza a lista ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadTeamsData();
    renderTierList();
});
