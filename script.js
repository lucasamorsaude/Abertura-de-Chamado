document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('chamadoForm');
    const statusDiv = document.getElementById('status');
    const submitBtn = document.getElementById('submitBtn');
    
    let config = {};

    function getDueDateTimestamp() {
        const now = new Date();
        const dueDate = new Date();
        if (now.getDay() === 5) { // Sexta-feira
            dueDate.setDate(now.getDate() + 4);
        } else {
            dueDate.setDate(now.getDate() + 2);
        }
        const dueDayOfWeek = dueDate.getDay();
        if (dueDayOfWeek === 6) { dueDate.setDate(dueDate.getDate() + 2); } 
        else if (dueDayOfWeek === 0) { dueDate.setDate(dueDate.getDate() + 1); }
        return dueDate.getTime();
    }

    async function loadConfig() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) throw new Error('Arquivo config.json não encontrado ou inválido.');
            config = await response.json();
            if (!config.CLICKUP_API_TOKEN || !config.CLICKUP_LIST_ID || !config.CLICKUP_ASSIGNEE_ID) {
                throw new Error('Verifique se TOKEN, LIST_ID e ASSIGNEE_ID estão no config.json.');
            }
        } catch (error) {
            showStatus(`Erro Crítico de Configuração: ${error.message}`, 'error');
            submitBtn.disabled = true;
            submitBtn.textContent = 'CONFIGURAÇÃO INVÁLIDA';
            return false;
        }
        return true;
    }

    const configLoaded = await loadConfig();

    if (configLoaded) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const taskRequester = document.getElementById('taskRequester').value.trim();
            const taskTitle = document.getElementById('taskTitle').value.trim();
            const originalDescription = document.getElementById('taskDescription').value.trim();
            const taskPriority = document.getElementById('taskPriority').value;

            if (!taskTitle || !taskRequester) {
                showStatus('Erro: Solicitante e Título são obrigatórios.', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            const finalDescription = `**Solicitante:** ${taskRequester}\n\n---\n\n${originalDescription}`;

            const body = {
                name: taskTitle,
                description: finalDescription,
                priority: parseInt(taskPriority, 10),
                due_date: getDueDateTimestamp(),
                assignees: [parseInt(config.CLICKUP_ASSIGNEE_ID)]
            };

            // ====================================================================
            // LINHA DE DEPURAÇÃO ADICIONADA AQUI
            console.log("Dados que serão enviados para o ClickUp:", body);
            // ====================================================================

            try {
                const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
                const apiUrl = 'https://api.clickup.com';
                const url = `/api/v2/list/${config.CLICKUP_LIST_ID}/task`;

                const response = await fetch(proxyUrl + apiUrl + url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': config.CLICKUP_API_TOKEN },
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