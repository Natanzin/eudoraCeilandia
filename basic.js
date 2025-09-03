// Dados do sistema
let fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];
let itemCounter = 0;

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
  const hoje = new Date();
  const mesAtual = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');

  document.getElementById('dashboardMonth').value = mesAtual;
  document.getElementById('dataVenda').value = hoje.toISOString().split('T')[0];

  atualizarDashboard();
});

// Sistema de Login Seguro
const USUARIO_CORRETO = 'admin@eudora.com';
const SENHA_CORRETA = 'Eudora2024@';

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginPassword').value;

  // Verificar credenciais
  if (email === USUARIO_CORRETO && senha === SENHA_CORRETA) {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainSystem').classList.remove('hidden');
    showScreen('dashboard');

    // Salvar sessão
    sessionStorage.setItem('usuarioLogado', 'true');
  } else {
    // Mostrar erro
    mostrarErroLogin('Usuário ou senha incorretos!');
  }
});

function mostrarErroLogin(mensagem) {
  // Remove erro anterior se existir
  const erroAnterior = document.querySelector('.erro-login');
  if (erroAnterior) {
    erroAnterior.remove();
  }

  // Cria novo erro
  const divErro = document.createElement('div');
  divErro.className = 'erro-login fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-lg text-center font-medium shadow-lg z-50 max-w-md mx-auto transition-all duration-300 opacity-0 translate-y-4';
  divErro.textContent = mensagem;

  // Adiciona ao body
  document.body.appendChild(divErro);

  // Anima entrada
  setTimeout(() => {
    divErro.classList.remove('opacity-0', 'translate-y-4');
    divErro.classList.add('opacity-100', 'translate-y-0');
  }, 10);

  // Remove após 4 segundos com animação
  setTimeout(() => {
    divErro.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => {
      if (divErro.parentNode) {
        divErro.remove();
      }
    }, 300);
  }, 4000);
}

// Verificar se já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
  if (sessionStorage.getItem('usuarioLogado') === 'true') {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainSystem').classList.remove('hidden');
    showScreen('dashboard');
  }
});

function logout() {
  // Limpar sessão
  sessionStorage.removeItem('usuarioLogado');

  // Limpar formulários
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';

  // Voltar para tela de login
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('mainSystem').classList.add('hidden');
}

// Navegação
function showScreen(screen) {
  const screens = ['dashboardScreen', 'vendasScreen', 'fornecedoresScreen'];
  screens.forEach(s => document.getElementById(s).classList.add('hidden'));
  document.getElementById(screen + 'Screen').classList.remove('hidden');

  if (screen === 'dashboard') {
    atualizarDashboard();
  } else if (screen === 'vendas') {
    atualizarSelectFornecedores();
    document.getElementById('dataVenda').value = new Date().toISOString().split('T')[0];
  } else if (screen === 'fornecedores') {
    atualizarListaFornecedores();
  }
}

// Fornecedores
document.getElementById('fornecedorForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const nome = document.getElementById('nomeFornecedor').value.trim();
  const porcentagem = parseFloat(document.getElementById('porcentagemLucro').value);

  // Validações
  if (!nome) {
    mostrarAviso('Por favor, digite o nome do fornecedor.', 'erro');
    return;
  }

  if (isNaN(porcentagem) || porcentagem < 0 || porcentagem > 100) {
    mostrarAviso('A porcentagem deve ser um número entre 0 e 100.', 'erro');
    return;
  }

  // Verificar se já existe fornecedor com mesmo nome
  if (fornecedores.some(f => f.nome.toLowerCase() === nome.toLowerCase())) {
    mostrarAviso('Já existe um fornecedor com este nome.', 'erro');
    return;
  }

  try {
    fornecedores.push({ id: Date.now(), nome, porcentagem });
    localStorage.setItem('fornecedores', JSON.stringify(fornecedores));

    document.getElementById('fornecedorForm').reset();
    atualizarListaFornecedores();

    mostrarAviso(`Fornecedor "${nome}" cadastrado com sucesso! 🎉`, 'sucesso');
  } catch (error) {
    mostrarAviso('Erro ao cadastrar fornecedor. Tente novamente.', 'erro');
  }
});

function atualizarListaFornecedores() {
  const lista = document.getElementById('listaFornecedores');
  lista.innerHTML = '';

  fornecedores.forEach(fornecedor => {
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg';
    div.innerHTML = `
                    <div>
                        <span class="font-medium">${fornecedor.nome}</span>
                        <span class="text-sm text-gray-600 ml-2">${fornecedor.porcentagem}% lucro</span>
                    </div>
                    <button onclick="removerFornecedor(${fornecedor.id})" class="text-red-500 hover:text-red-700">
                        Remover
                    </button>
                `;
    lista.appendChild(div);
  });
}

function removerFornecedor(id) {
  fornecedores = fornecedores.filter(f => f.id !== id);
  localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
  atualizarListaFornecedores();
}

// Vendas
let itensVendaAtual = [];

function atualizarSelectFornecedores() {
  const select = document.getElementById('fornecedorItem');
  select.innerHTML = '<option value="">Selecione um fornecedor...</option>';

  fornecedores.forEach(fornecedor => {
    const option = document.createElement('option');
    option.value = fornecedor.nome;
    option.textContent = fornecedor.nome;
    select.appendChild(option);
  });
}

document.getElementById('itemForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const fornecedor = document.getElementById('fornecedorItem').value;
  const produto = document.getElementById('produtoItem').value.trim();
  const quantidade = parseInt(document.getElementById('quantidadeItem').value);
  const valorUnitario = parseFloat(document.getElementById('valorItem').value);

  // Validações
  if (!fornecedor) {
    mostrarAviso('Por favor, selecione um fornecedor.', 'erro');
    return;
  }

  if (!produto) {
    mostrarAviso('Por favor, digite o nome do produto.', 'erro');
    return;
  }

  if (isNaN(quantidade) || quantidade <= 0) {
    mostrarAviso('A quantidade deve ser um número maior que zero.', 'erro');
    return;
  }

  if (isNaN(valorUnitario) || valorUnitario <= 0) {
    mostrarAviso('O valor unitário deve ser um número maior que zero.', 'erro');
    return;
  }

  try {
    const valorTotal = quantidade * valorUnitario;
    const item = {
      id: Date.now() + Math.random(),
      fornecedor,
      produto,
      quantidade,
      valorUnitario,
      valor: valorTotal
    };

    itensVendaAtual.push(item);
    atualizarListaItens();
    document.getElementById('itemForm').reset();
    document.getElementById('quantidadeItem').value = '1'; // Resetar quantidade para 1
  } catch (error) {
    mostrarAviso('Erro ao adicionar item. Tente novamente.', 'erro');
  }
});

function atualizarListaItens() {
  const lista = document.getElementById('listaItensVenda');

  if (itensVendaAtual.length === 0) {
    lista.innerHTML = '<div class="text-gray-500 text-center py-8">Nenhum item adicionado ainda</div>';
    document.getElementById('finalizarVenda').disabled = true;
  } else {
    lista.innerHTML = '';

    itensVendaAtual.forEach(item => {
      const div = document.createElement('div');
      div.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg';
      div.innerHTML = `
                        <div class="flex-1">
                            <div class="font-medium text-gray-800">${item.produto}</div>
                            <div class="text-sm text-gray-600">${item.fornecedor}</div>
                            <div class="text-xs text-gray-500">Qtd: ${item.quantidade} x R$ ${item.valorUnitario.toFixed(2).replace('.', ',')}</div>
                        </div>
                        <div class="flex items-center space-x-3">
                            <span class="font-semibold text-purple-600">R$ ${item.valor.toFixed(2).replace('.', ',')}</span>
                            <button onclick="removerItemVenda('${item.id}')" class="text-red-500 hover:text-red-700 text-sm">
                                Remover
                            </button>
                        </div>
                    `;
      lista.appendChild(div);
    });

    document.getElementById('finalizarVenda').disabled = false;
  }

  calcularTotalVenda();
}

function removerItemVenda(id) {
  itensVendaAtual = itensVendaAtual.filter(item => item.id !== id);
  atualizarListaItens();
}

function calcularTotalVenda() {
  const total = itensVendaAtual.reduce((sum, item) => sum + item.valor, 0);
  document.getElementById('totalVenda').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function finalizarVenda() {
  const data = document.getElementById('dataVenda').value;

  if (!data) {
    mostrarAviso('Por favor, selecione a data da venda.', 'erro');
    return;
  }

  if (itensVendaAtual.length === 0) {
    mostrarAviso('Adicione pelo menos um item à venda.', 'erro');
    return;
  }

  // Gerar ID único para esta venda
  const vendaId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  itensVendaAtual.forEach(item => {
    vendas.push({
      id: Date.now() + Math.random(),
      vendaId: vendaId, // ID único da venda para agrupar itens
      data,
      fornecedor: item.fornecedor,
      produto: item.produto,
      valor: item.valor
    });
  });

  localStorage.setItem('vendas', JSON.stringify(vendas));

  // Limpar venda atual
  itensVendaAtual = [];
  atualizarListaItens();
  document.getElementById('dataVenda').value = new Date().toISOString().split('T')[0];

  mostrarAviso('Venda finalizada com sucesso! 🎉', 'sucesso');
}

function mostrarAviso(mensagem, tipo) {
  // Remove aviso anterior se existir
  const avisoAnterior = document.querySelector('.aviso-sistema');
  if (avisoAnterior) {
    avisoAnterior.remove();
  }

  // Define cores baseado no tipo
  const cores = {
    sucesso: 'bg-green-500 text-white',
    erro: 'bg-red-500 text-white'
  };

  // Cria novo aviso
  const divAviso = document.createElement('div');
  divAviso.className = `aviso-sistema fixed bottom-6 left-1/2 transform -translate-x-1/2 ${cores[tipo]} px-6 py-4 rounded-lg text-center font-medium shadow-lg z-50 max-w-md mx-auto transition-all duration-300 opacity-0 translate-y-4`;
  divAviso.textContent = mensagem;

  // Adiciona ao body
  document.body.appendChild(divAviso);

  // Anima entrada
  setTimeout(() => {
    divAviso.classList.remove('opacity-0', 'translate-y-4');
    divAviso.classList.add('opacity-100', 'translate-y-0');
  }, 10);

  // Remove após 4 segundos com animação
  setTimeout(() => {
    divAviso.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => {
      if (divAviso.parentNode) {
        divAviso.remove();
      }
    }, 300);
  }, 4000);
}

// Dashboard
function atualizarDashboard() {
  const mes = document.getElementById('dashboardMonth').value;
  const vendasMes = vendas.filter(v => v.data.startsWith(mes));

  // Atualizar cards de estatísticas
  atualizarCardsDashboard(vendasMes);

  // Atualizar gráfico
  atualizarGraficoPizza(vendasMes);

  // Atualizar ranking
  atualizarRankingDashboard(vendasMes);

  // Atualizar tabela de lucros
  atualizarTabelaLucros(vendasMes);

  // Atualizar vendas por dia
  atualizarVendasPorDiaDashboard(vendasMes);

  // Atualizar tabela detalhada
  atualizarTabelaDetalhadaDashboard(vendasMes);
}

function atualizarCardsDashboard(vendasMes) {
  const totalVendas = vendasMes.reduce((sum, venda) => sum + venda.valor, 0);

  // Contar transações únicas por data e ID da venda
  const transacoesUnicas = new Set();
  vendasMes.forEach(venda => {
    if (venda.vendaId) {
      transacoesUnicas.add(venda.vendaId);
    } else {
      // Para vendas antigas sem vendaId, agrupa por data
      transacoesUnicas.add(venda.data + '_' + Math.floor(venda.id / 1000));
    }
  });
  const qtdTransacoes = transacoesUnicas.size;

  // Calcular lucro total
  let lucroTotal = 0;
  const dadosFornecedores = {};

  vendasMes.forEach(venda => {
    dadosFornecedores[venda.fornecedor] = (dadosFornecedores[venda.fornecedor] || 0) + venda.valor;
  });

  Object.entries(dadosFornecedores).forEach(([nome, vendaTotal]) => {
    const fornecedor = fornecedores.find(f => f.nome === nome);
    const porcentagem = fornecedor ? fornecedor.porcentagem : 0;
    lucroTotal += (vendaTotal * porcentagem) / 100;
  });

  const dizimo = lucroTotal * 0.1;

  document.getElementById('dashTotalVendas').textContent = `R$ ${totalVendas.toFixed(2).replace('.', ',')}`;
  document.getElementById('dashLucroTotal').textContent = `R$ ${lucroTotal.toFixed(2).replace('.', ',')}`;
  document.getElementById('dashDizimo').textContent = `R$ ${dizimo.toFixed(2).replace('.', ',')}`;
  document.getElementById('dashTransacoes').textContent = qtdTransacoes;
}

function atualizarRankingDashboard(vendasMes) {
  const dadosFornecedores = {};

  vendasMes.forEach(venda => {
    if (!dadosFornecedores[venda.fornecedor]) {
      dadosFornecedores[venda.fornecedor] = { total: 0, qtd: 0 };
    }
    dadosFornecedores[venda.fornecedor].total += venda.valor;
    dadosFornecedores[venda.fornecedor].qtd += 1;
  });

  const ranking = Object.entries(dadosFornecedores)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5);

  const container = document.getElementById('dashRankingFornecedores');
  container.innerHTML = '';

  if (ranking.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhuma venda no período</p>';
    return;
  }

  ranking.forEach(([nome, dados], index) => {
    const posicao = index + 1;
    const medalha = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `${posicao}º`;
    const porcentagem = (dados.total / vendasMes.reduce((sum, v) => sum + v.valor, 0)) * 100;

    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors';
    div.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <span class="text-2xl">${medalha}</span>
                        <div>
                            <div class="font-semibold text-gray-800">${nome}</div>
                            <div class="text-sm text-gray-600">${dados.qtd} vendas • ${porcentagem.toFixed(1)}% do total</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-lg text-purple-600">R$ ${dados.total.toFixed(2).replace('.', ',')}</div>
                    </div>
                `;
    container.appendChild(div);
  });
}

function atualizarVendasPorDiaDashboard(vendasMes) {
  const vendasPorDia = {};

  vendasMes.forEach(venda => {
    const data = new Date(venda.data + 'T00:00:00');
    const dataStr = data.toLocaleDateString('pt-BR');

    if (!vendasPorDia[dataStr]) {
      vendasPorDia[dataStr] = { total: 0, transacoes: new Set() };
    }
    vendasPorDia[dataStr].total += venda.valor;

    // Contar transações únicas por dia
    if (venda.vendaId) {
      vendasPorDia[dataStr].transacoes.add(venda.vendaId);
    } else {
      // Para vendas antigas sem vendaId, agrupa por data
      vendasPorDia[dataStr].transacoes.add(venda.data + '_' + Math.floor(venda.id / 1000));
    }
  });

  const diasOrdenados = Object.entries(vendasPorDia)
    .sort(([a], [b]) => {
      const [diaA, mesA, anoA] = a.split('/');
      const [diaB, mesB, anoB] = b.split('/');
      return new Date(anoB, mesB - 1, diaB) - new Date(anoA, mesA - 1, diaA);
    });

  const container = document.getElementById('dashVendasPorDia');
  container.innerHTML = '';

  if (diasOrdenados.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhuma venda</p>';
    return;
  }

  diasOrdenados.forEach(([data, dados]) => {
    const qtdVendas = dados.transacoes.size;
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg';
    div.innerHTML = `
                    <div>
                        <div class="font-medium text-gray-800">${data}</div>
                        <div class="text-xs text-gray-600">${qtdVendas} venda${qtdVendas > 1 ? 's' : ''}</div>
                    </div>
                    <div class="font-semibold text-purple-600">R$ ${dados.total.toFixed(2).replace('.', ',')}</div>
                `;
    container.appendChild(div);
  });
}

function atualizarTabelaDetalhadaDashboard(vendasMes) {
  const tabela = document.getElementById('dashTabelaVendas');
  const semVendas = document.getElementById('dashSemVendas');

  tabela.innerHTML = '';

  if (vendasMes.length === 0) {
    semVendas.classList.remove('hidden');
    document.getElementById('dashTotalItens').textContent = '0 itens';
    return;
  }

  semVendas.classList.add('hidden');
  document.getElementById('dashTotalItens').textContent = `${vendasMes.length} ${vendasMes.length === 1 ? 'item' : 'itens'}`;

  // Ordenar por data (mais recente primeiro) e limitar a 10 itens
  const vendasOrdenadas = [...vendasMes].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 10);

  vendasOrdenadas.forEach((venda, index) => {
    const tr = document.createElement('tr');
    tr.className = `border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`;

    const dataVenda = new Date(venda.data + 'T00:00:00');

    tr.innerHTML = `
                    <td class="py-3 sm:py-4 px-2 sm:px-4">
                        <div class="font-medium text-sm sm:text-base">${dataVenda.toLocaleDateString('pt-BR')}</div>
                        <div class="text-xs text-gray-500 hidden sm:block">${dataVenda.toLocaleDateString('pt-BR', { weekday: 'long' })}</div>
                    </td>
                    <td class="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            ${venda.fornecedor}
                        </span>
                    </td>
                    <td class="py-3 sm:py-4 px-2 sm:px-4">
                        <div class="font-medium text-gray-900 text-sm sm:text-base">${venda.produto}</div>
                        <div class="text-xs text-gray-500 sm:hidden">${venda.fornecedor}</div>
                    </td>
                    <td class="py-3 sm:py-4 px-2 sm:px-4 text-right">
                        <span class="font-bold text-base sm:text-lg text-green-600">R$ ${venda.valor.toFixed(2).replace('.', ',')}</span>
                    </td>
                `;
    tabela.appendChild(tr);
  });
}

function atualizarGraficoPizza(vendasMes) {
  const dadosFornecedores = {};

  vendasMes.forEach(venda => {
    dadosFornecedores[venda.fornecedor] = (dadosFornecedores[venda.fornecedor] || 0) + venda.valor;
  });

  const ctx = document.getElementById('pieChart').getContext('2d');

  if (window.pieChartInstance) {
    window.pieChartInstance.destroy();
  }

  window.pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(dadosFornecedores),
      datasets: [{
        data: Object.values(dadosFornecedores),
        backgroundColor: [
          '#ec4899', '#a855f7', '#f97316', '#06b6d4', '#10b981', '#f59e0b'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}



function atualizarTabelaLucros(vendasMes) {
  const tabela = document.getElementById('tabelaLucros');
  const dadosFornecedores = {};

  vendasMes.forEach(venda => {
    dadosFornecedores[venda.fornecedor] = (dadosFornecedores[venda.fornecedor] || 0) + venda.valor;
  });

  tabela.innerHTML = '';
  let totalVendas = 0;
  let totalLucro = 0;
  let totalDizimo = 0;

  Object.entries(dadosFornecedores).forEach(([nome, vendaTotal]) => {
    const fornecedor = fornecedores.find(f => f.nome === nome);
    const porcentagem = fornecedor ? fornecedor.porcentagem : 0;
    const lucro = (vendaTotal * porcentagem) / 100;
    const dizimo = lucro * 0.1;

    totalVendas += vendaTotal;
    totalLucro += lucro;
    totalDizimo += dizimo;

    const tr = document.createElement('tr');
    tr.className = 'border-b border-gray-100';
    tr.innerHTML = `
                    <td class="py-2 sm:py-3 px-2 sm:px-4">${nome}</td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">R$ ${vendaTotal.toFixed(2).replace('.', ',')}</td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4">${porcentagem}%</td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4">R$ ${lucro.toFixed(2).replace('.', ',')}</td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">R$ ${dizimo.toFixed(2).replace('.', ',')}</td>
                `;
    tabela.appendChild(tr);
  });

  document.getElementById('totalVendas').textContent = `R$ ${totalVendas.toFixed(2).replace('.', ',')}`;
  document.getElementById('totalLucro').textContent = `R$ ${totalLucro.toFixed(2).replace('.', ',')}`;
  document.getElementById('totalDizimo').textContent = `R$ ${totalDizimo.toFixed(2).replace('.', ',')}`;
}



// Menu Mobile
document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
}

// Fechar menu mobile ao clicar fora
document.addEventListener('click', function (e) {
  const menu = document.getElementById('mobileMenu');
  const btn = document.getElementById('mobileMenuBtn');

  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

// Event listeners para filtros
document.getElementById('dashboardMonth').addEventListener('change', atualizarDashboard);