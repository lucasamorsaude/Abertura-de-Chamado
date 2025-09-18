// script.js

// O ID correto do formulário é 'chamadoForm'
const form = document.getElementById('chamadoForm'); 
const statusEnvio = document.getElementById('status-envio');
const submitButton = document.getElementById('submit');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHcK_XwN8wlPb6rqkZKSX28GpO5gfi17qAxnz30Z6sU_dc3HNWGnfy9ZqJmgTYCYuF/exec';

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    // Desabilita o botão para evitar cliques duplos
    submitButton.disabled = true;
    statusEnvio.textContent = 'Enviando, por favor aguarde...';
    statusEnvio.style.color = '#333';

    // 1. Pega os valores de TODOS os campos usando os IDs corretos do HTML
    const solicitante = document.getElementById('taskRequester').value;
    const titulo = document.getElementById('taskTitle').value;
    const descricao = document.getElementById('taskDescription').value;
    const prioridade = document.getElementById('taskPriority').value;

    // 2. Cria um objeto com todos os dados para enviar
    const dadosDoFormulario = {
        solicitante: solicitante,
        titulo: titulo,
        descricao: descricao,
        prioridade: parseInt(prioridade) // Converte a prioridade para número
    };

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            // headers são importantes para o Apps Script entender o tipo de conteúdo
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Usar text/plain evita problemas de CORS com Apps Script
            },
            body: JSON.stringify(dadosDoFormulario) // 3. Envia o objeto completo
        });

        const result = await response.json();

        if (result.status === 'sucesso') {
            statusEnvio.textContent = '✅ Chamado aberto com sucesso!';
            statusEnvio.style.color = 'green';
            form.reset(); // Limpa o formulário
        } else {
            // Se o erro vier do nosso script (ex: "Chave de API não configurada")
            throw new Error(result.message);
        }

    } catch (error) {
        // Se o erro for de rede ou outro problema
        statusEnvio.textContent = `❌ Erro ao abrir chamado: ${error.message}`;
        statusEnvio.style.color = 'red';
    } finally {
        // Reabilita o botão ao final do processo
        submitButton.disabled = false;
    }
});