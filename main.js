'use strict'

// === ABRIR E FECHAR MODAL ===
const openModal = () => document.getElementById('modal').classList.add('active');

const closeModal = () => {
  clearFields();
  document.getElementById('modal').classList.remove('active');
};

// === LOCAL STORAGE ===
const getLocalStorage = () => JSON.parse(localStorage.getItem('db_client')) ?? [];

const setLocalStorage = (dbClient) =>
  localStorage.setItem('db_client', JSON.stringify(dbClient));

// === CRUD ===
const deleteClient = (index) => {
  const dbClient = readClient();
  dbClient.splice(index, 1);
  setLocalStorage(dbClient);
};

const updateClient = (index, client) => {
  const dbClient = readClient();
  dbClient[index] = client;
  setLocalStorage(dbClient);
};

const readClient = () => getLocalStorage();

const createClient = (client) => {
  const dbClient = getLocalStorage();
  dbClient.push(client);
  setLocalStorage(dbClient);
};

// === VALIDAÇÃO E FORMULÁRIO ===
const isValidFields = () => {
  return document.getElementById('form').reportValidity();
};

const clearFields = () => {
  const fields = document.querySelectorAll('.modal-field');
  fields.forEach((field) => (field.value = ''));
  document.getElementById('nome').dataset.index = 'new';
};

// === SALVAR CLIENTE ===
const saveClient = () => {
  if (isValidFields()) {
    const client = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      celular: document.getElementById('celular').value,
      cidade: document.getElementById('cidade').value,
      data: document.getElementById('data').value,
      valor: document.getElementById('valor').value,
      datapagamento: document.getElementById('data-pagamento').value,

      // 💰 remove R$, pontos e vírgulas antes de salvar
      valor: parseFloat(
        document
          .getElementById('valor')
          .value.replace(/[R$\s.]/g, '')
          .replace(',', '.')
      ),

      data: document.getElementById('data').value,
      datapg: document.getElementById('data-pagamento').value,
    };

    const index = document.getElementById('nome').dataset.index;
    if (index == 'new') {
      createClient(client);
      updateTable();
      closeModal();
    } else {
      updateClient(index, client);
      updateTable();
      closeModal();
    }
  }
};

// === TABELA ===
const createRow = (client, index) => {
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td>${client.nome}</td>
    <td>${client.email}</td>
    <td>${client.celular}</td>
    <td>${client.cidade}</td>
    <td>${client.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
    <td>${client.data}</td>
    <td>${client.datapg}</td>
    <td>
      <button type="button" class="button green" id="edit-${index}">Editar</button>
      <button type="button" class="button red" id="delete-${index}">Excluir</button>
    </td>
  `;
  document.querySelector('#tableClient>tbody').appendChild(newRow);
};

const clearTable = () => {
  const rows = document.querySelectorAll('#tableClient>tbody tr');
  rows.forEach((row) => row.parentNode.removeChild(row));
};

const updateTable = () => {
  const dbClient = readClient();
  clearTable();
  dbClient.forEach(createRow);
};

// === EDITAR CLIENTE ===
const fillFields = (client) => {
  document.getElementById('nome').value = client.nome;
  document.getElementById('email').value = client.email;
  document.getElementById('celular').value = client.celular;
  document.getElementById('cidade').value = client.cidade;
  document.getElementById('data').value = client.data;
  document.getElementById('valor').value = client.valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  document.getElementById('data-pagamento').value = client.datapg;
  document.getElementById('nome').dataset.index = client.index;
};

const editClient = (index) => {
  const client = readClient()[index];
  client.index = index;
  fillFields(client);
  openModal();
};

const editDelete = (event) => {
  if (event.target.type == 'button') {
    const [action, index] = event.target.id.split('-');

    if (action == 'edit') {
      editClient(index);
    } else {
      const client = readClient()[index];
      const response = confirm(`Deseja realmente excluir o cliente ${client.nome}?`);
      if (response) {
        deleteClient(index);
        updateTable();
      }
    }
  }
};

// === INICIALIZAÇÃO ===
updateTable();

// === MÁSCARA DE MOEDA (R$) ===
document.addEventListener('DOMContentLoaded', () => {
  const campoValor = document.getElementById('valor');

  if (campoValor) {
    campoValor.addEventListener('input', (e) => {
      let valor = e.target.value.replace(/\D/g, '');
      valor = (parseInt(valor, 10) / 100).toFixed(2);
      valor = valor
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
        .replace('R$', 'R$ ');
      e.target.value = valor;
    });
  }
});

// === EVENTOS ===
document.getElementById('cadastrarCliente').addEventListener('click', openModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('salvar').addEventListener('click', saveClient);
document.querySelector('#tableClient>tbody').addEventListener('click', editDelete);
document.getElementById('cancelar').addEventListener('click', closeModal);
