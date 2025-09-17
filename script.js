document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('chamadoForm');
    const statusDiv = document.getElementById('status');
    const submitBtn = document.getElementById('submitBtn');
    
    let config = {};

    // Função para carregar a configuração do arquivo JSON
    async function loadConfig() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error('Arquivo config.json não encontrado ou inválido.');
            }
            config = await response.json();

            // Verifica se as chaves existem no arquivo
            if (!config.CLICKUP_API_TOKEN || !config.CLICKUP_LIST_ID) {
                throw new Error('Token da API ou ID da Lista não definidos no config.json.');
            }

        } catch (error) {
            showStatus(`Erro Crítico de Configuração: ${error.message}`, 'error');
            submitBtn.disabled = true;
            submitBtn.textContent = 'CONFIGURAÇÃO INVÁLIDA';
            return false;
        }
        return true;
    }

    // Carrega a configuração assim que a página abre
    const configLoaded = await loadConfig();

    if (configLoaded) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const apiToken = config.CLICKUP_API_TOKEN;
            const listId = config.CLICKUP_LIST_ID;
            const taskTitle = document.getElementById('taskTitle').value.trim();
            const taskDescription = document.getElementById('taskDescription').value.trim();
            const taskPriority = document.getElementById('taskPriority').value;

            if (!taskTitle) {
                showStatus('Erro: O título é obrigatório.', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            showStatus('Criando chamado...', '');

            const url = `/api/v2/list/${listId}/task`;
            const body = {
                name: taskTitle,
                description: taskDescription,
                priority: parseInt(taskPriority, 10),
            };

            try {
                const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
                const apiUrl = 'https://api.clickup.com';

                const response = await fetch(proxyUrl + apiUrl + url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': apiToken
                    },
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Erro ${response.status}: ${errorData.err || 'Falha ao criar a tarefa'}`);
                }

                const data = await response.json();
                showStatus(`Chamado criado com sucesso! ID: ${data.id}`, 'success');
                form.reset();
                document.getElementById('taskPriority').value = '3';

            } catch (error) {
                showStatus(`Falha na requisição: ${error.message}`, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Criar Chamado';
            }
        });
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = type;
        statusDiv.style.display = 'block';
    }
});