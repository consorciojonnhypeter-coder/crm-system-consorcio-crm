// ===== GLOBAL VARIABLES =====
let supervisorLogado = "";
let listaConsultores = ["Caroline", "Deise", "Beatriz", "Jhonathan", "Sarah", "Ryan", "Izadora", "Flavia", "Diogo", "Lucas", "Suelen"];
let databaseLeads = JSON.parse(localStorage.getItem('crm_leads_offline_data')) || [];
let databaseLeadsFiltered = [];

// ===== LOGIN SYSTEM =====
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPassword').value;

    if (pass === "123456") {
        supervisorLogado = user;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-layout').classList.remove('hidden');
        document.getElementById('user-display-name').innerText = user;
        document.getElementById('user-avatar').innerText = user === "Jonnhy Peter" ? "JP" : "BE";
        renderizarTabelaLeads();
        atualizarInterfaceConsultores();
        mostrarToast('Bem-vindo, ' + user + '!', 'success');
    } else {
        mostrarToast('Senha inválida!', 'error');
    }
});

function logout() {
    supervisorLogado = "";
    document.getElementById('loginPassword').value = "";
    document.getElementById('main-layout').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    mostrarToast('Você saiu do sistema', 'info');
}

// ===== TAB NAVIGATION =====
function switchTab(tabName) {
    document.getElementById('tab-dashboard').classList.add('hidden');
    document.getElementById('tab-leads').classList.add('hidden');
    document.getElementById('tab-consultores').classList.add('hidden');
    document.getElementById('tab-relatorios').classList.add('hidden');
    
    document.getElementById('menu-dashboard').className = "w-full flex items-center p-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-xl transition group cursor-pointer";
    document.getElementById('menu-leads').className = "w-full flex items-center p-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-xl transition group cursor-pointer";
    document.getElementById('menu-consultores').className = "w-full flex items-center p-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-xl transition group cursor-pointer";
    document.getElementById('menu-relatorios').className = "w-full flex items-center p-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-xl transition group cursor-pointer";

    if(tabName === 'dashboard') {
        document.getElementById('tab-dashboard').classList.remove('hidden');
        document.getElementById('menu-dashboard').className = "w-full flex items-center p-3 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer";
        document.getElementById('page-title').innerText = "Dashboard de Produção";
        document.getElementById('shared-table-area').classList.remove('hidden');
    } else if(tabName === 'leads') {
        document.getElementById('tab-leads').classList.remove('hidden');
        document.getElementById('menu-leads').className = "w-full flex items-center p-3 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer";
        document.getElementById('page-title').innerText = "Gerenciamento de Leads e Reuniões";
        document.getElementById('shared-table-area').classList.remove('hidden');
    } else if(tabName === 'consultores') {
        document.getElementById('tab-consultores').classList.remove('hidden');
        document.getElementById('menu-consultores').className = "w-full flex items-center p-3 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer";
        document.getElementById('page-title').innerText = "Gerenciamento da Equipe Comercial";
        document.getElementById('shared-table-area').classList.add('hidden');
    } else if(tabName === 'relatorios') {
        document.getElementById('tab-relatorios').classList.remove('hidden');
        document.getElementById('menu-relatorios').className = "w-full flex items-center p-3 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer";
        document.getElementById('page-title').innerText = "Relatórios e Exportação";
        document.getElementById('shared-table-area').add('hidden');
        atualizarFiltrosRelatorio();
    }
}

// ===== TOAST NOTIFICATIONS =====
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('toast');
    const cores = {
        success: 'bg-emerald-500',
        error: 'bg-rose-500',
        info: 'bg-blue-500',
        warning: 'bg-amber-500'
    };
    
    toast.className = `toast ${cores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg`;
    toast.innerText = mensagem;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ===== ATUALIZAR INTERFACES =====
function atualizarInterfaceConsultores() {
    const select = document.getElementById('consultantSelect');
    const listaVisual = document.getElementById('consultoresListaVisual');
    select.innerHTML = '<option value="">Selecione o consultor</option>';
    listaVisual.innerHTML = '';
    listaConsultores.sort();

    listaConsultores.forEach(nome => {
        const opt = document.createElement('option');
        opt.value = nome;
        opt.innerText = nome;
        select.appendChild(opt);

        const card = document.createElement('div');
        card.className = "bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-2.5 shadow-sm hover:shadow-md transition cursor-pointer hover:bg-indigo-50";
        card.innerHTML = `
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-bold text-[10px] flex items-center justify-center">${nome.substring(0,2).toUpperCase()}</div>
            <span class="text-xs font-semibold text-slate-700">${nome}</span>
        `;
        listaVisual.appendChild(card);
    });
    document.getElementById('dash-total-consultores').innerText = listaConsultores.length;
}

function atualizarFiltrosRelatorio() {
    const filterConsultor = document.getElementById('filterConsultor');
    filterConsultor.innerHTML = '<option value="">Todos os Consultores</option>';
    listaConsultores.forEach(nome => {
        const opt = document.createElement('option');
        opt.value = nome;
        opt.innerText = nome;
        filterConsultor.appendChild(opt);
    });
}

// ===== GOOGLE CALENDAR SYNC =====
function abrirAgendaGoogleExterno(cliente, consultor, contato, valor, origem, dataStr, status = 'Novo') {
    const dataInicio = new Date(dataStr);
    const dataFim = new Date(dataInicio.getTime() + 60 * 60 * 1000);

    const formatarDataGoogle = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const titulo = encodeURIComponent(`Reunião Consórcio: ${cliente} (${consultor})`);
    const detalhes = encodeURIComponent(`Consultor: ${consultor}\nContato: ${contato}\nValor: R$ ${parseFloat(valor).toLocaleString('pt-BR')}\nOrigem: ${origem}\nStatus: ${status}\nSupervisor: ${supervisorLogado}`);
    const datas = `${formatarDataGoogle(dataInicio)}/${formatarDataGoogle(dataFim)}`;

    const urlGoogleCalendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${datas}&details=${detalhes}&sf=true&output=xml`;
    
    window.open(urlGoogleCalendar, '_blank');
    mostrarToast('Abrindo Google Calendar...', 'info');
}

// ===== RENDER TABLE =====
function renderizarTabelaLeads() {
    const tableBody = document.getElementById('leadsTableBody');
    tableBody.innerHTML = '';
    let somaVolume = 0;
    let totalAgendadas = 0;

    databaseLeads.forEach(lead => {
        const numValor = parseFloat(lead.valor) || 0;
        somaVolume += numValor;
        totalAgendadas++;

        const formattedValue = numValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const dateObj = new Date(lead.dataReuniao);
        const formattedDate = dateObj.toLocaleDateString('pt-BR') + ' - ' + dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

        const statusColor = {
            'Novo': 'bg-blue-100 text-blue-700',
            'Em Contato': 'bg-yellow-100 text-yellow-700',
            'Qualificado': 'bg-purple-100 text-purple-700',
            'Proposta': 'bg-indigo-100 text-indigo-700',
            'Fechado': 'bg-emerald-100 text-emerald-700',
            'Perdido': 'bg-red-100 text-red-700'
        };

        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50/50 transition";
        row.innerHTML = `
            <td class="p-4 pl-6">
                <div class="font-bold text-slate-900">${lead.cliente}</div>
                <div class="text-xs text-slate-400 font-medium mt-0.5">${lead.contato}</div>
            </td>
            <td class="p-4 font-semibold text-slate-600">${lead.consultor}</td>
            <td class="p-4 font-medium text-slate-500">${formattedDate}</td>
            <td class="p-4 font-bold text-slate-900">${formattedValue}</td>
            <td class="p-4"><span class="${statusColor[lead.status] || 'bg-slate-100 text-slate-700'} px-2.5 py-1 rounded-lg text-xs font-semibold">${lead.status}</span></td>
            <td class="p-4"><span class="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">${lead.origem}</span></td>
            <td class="p-4 text-center">
                <button onclick="abrirAgendaGoogleExterno('${lead.cliente}', '${lead.consultor}', '${lead.contato}', '${lead.valor}', '${lead.origem}', '${lead.dataReuniao}', '${lead.status}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 shadow transition cursor-pointer">
                    <i class="fa-solid fa-calendar-plus"></i> Sync
                </button>
            </td>
            <td class="p-4 text-right pr-6 space-x-1 whitespace-nowrap">
                <button onclick="prepararEdicao('${lead.id}')" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg text-xs font-bold transition hover:bg-indigo-100"><i class="fa-solid fa-pen"></i></button>
                <button onclick="removerLead('${lead.id}')" class="text-rose-600 hover:text-rose-900 bg-rose-50 p-2 rounded-lg text-xs font-bold transition hover:bg-rose-100"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('dash-total-leads').innerText = databaseLeads.length;
    document.getElementById('dash-total-agendadas').innerText = totalAgendadas;
    document.getElementById('dash-volume-total').innerText = somaVolume.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const metaTotal = 15000000;
    const pct = Math.min((somaVolume / metaTotal) * 100, 100).toFixed(1);
    document.getElementById('dash-meta-texto').innerText = `${somaVolume.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de ${metaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    document.getElementById('dash-meta-barra').style.width = `${pct}%`;

    localStorage.setItem('crm_leads_offline_data', JSON.stringify(databaseLeads));
}

// ===== LEAD CRUD =====
document.getElementById('leadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const editId = document.getElementById('editLeadId').value;
    const name = document.getElementById('clientName').value;
    const contact = document.getElementById('clientContact').value;
    const consultant = document.getElementById('consultantSelect').value;
    const rawDate = document.getElementById('meetingDate').value;
    const rawValue = document.getElementById('dealValue').value;
    const source = document.getElementById('leadSource').value;
    const status = document.getElementById('leadStatus').value;
    const probability = document.getElementById('probability').value || 0;

    if (!consultant) {
        mostrarToast('Selecione um consultor!', 'warning');
        return;
    }

    if (editId) {
        const idx = databaseLeads.findIndex(l => l.id === editId);
        if(idx !== -1) {
            databaseLeads[idx] = { 
                ...databaseLeads[idx], 
                cliente: name, 
                contato: contact, 
                consultor: consultant, 
                dataReuniao: rawDate, 
                valor: rawValue, 
                origem: source,
                status: status,
                probability: probability
            };
            mostrarToast('Lead atualizado com sucesso!', 'success');
        }
    } else {
        databaseLeads.unshift({ 
            id: String(Date.now()), 
            cliente: name, 
            contato: contact, 
            consultor: consultant, 
            dataReuniao: rawDate, 
            valor: rawValue, 
            origem: source,
            status: status,
            probability: probability
        });
        mostrarToast('Lead cadastrado com sucesso!', 'success');
    }

    renderizarTabelaLeads();
    document.getElementById('leadForm').reset();
    ajustarLayoutFormulario(false);
    
    if(!editId) {
        abrirAgendaGoogleExterno(name, consultant, contact, rawValue, source, rawDate, status);
    }
});

function removerLead(id) {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;
    databaseLeads = databaseLeads.filter(l => l.id !== id);
    renderizarTabelaLeads();
    mostrarToast('Lead removido com sucesso!', 'info');
}

function prepararEdicao(id) {
    const lead = databaseLeads.find(l => l.id === id);
    if(!lead) return;
    switchTab('leads');
    document.getElementById('editLeadId').value = lead.id;
    document.getElementById('clientName').value = lead.cliente;
    document.getElementById('clientContact').value = lead.contato;
    document.getElementById('consultantSelect').value = lead.consultor;
    document.getElementById('meetingDate').value = lead.dataReuniao;
    document.getElementById('dealValue').value = lead.valor;
    document.getElementById('leadSource').value = lead.origem;
    document.getElementById('leadStatus').value = lead.status || 'Novo';
    document.getElementById('probability').value = lead.probability || 0;
    ajustarLayoutFormulario(true);
}

function cancelarEdicao() {
    document.getElementById('leadForm').reset();
    ajustarLayoutFormulario(false);
}

function ajustarLayoutFormulario(modoEdicao) {
    const indicador = document.getElementById('form-indicator');
    const titulo = document.getElementById('form-title');
    const btnCancelar = document.getElementById('btnCancelarEdicao');

    if (modoEdicao) {
        indicador.className = "w-2 h-5 bg-amber-500 rounded-full";
        titulo.innerText = "Modo Edição: Atualizar Dados do Lead";
        btnCancelar.classList.remove('hidden');
    } else {
        indicador.className = "w-2 h-5 bg-indigo-600 rounded-full";
        titulo.innerText = "Cadastrar Novo Lead / Reunião";
        btnCancelar.classList.add('hidden');
        document.getElementById('editLeadId').value = "";
    }
}

// ===== CONSULTANT MANAGEMENT =====
document.getElementById('consultorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputNome = document.getElementById('newConsultantName');
    const novoNome = inputNome.value.trim();
    if(novoNome && !listaConsultores.includes(novoNome)) {
        listaConsultores.push(novoNome);
        atualizarInterfaceConsultores();
        inputNome.value = '';
        mostrarToast('Consultor adicionado com sucesso!', 'success');
    } else if(listaConsultores.includes(novoNome)) {
        mostrarToast('Este consultor já existe!', 'warning');
    }
});

// ===== EXPORT FUNCTIONS =====
function exportarCSV() {
    let csv = 'Cliente,Contato,Consultor,Data,Hora,Valor,Origem,Status,Probabilidade\n';
    
    databaseLeads.forEach(lead => {
        const dateObj = new Date(lead.dataReuniao);
        const data = dateObj.toLocaleDateString('pt-BR');
        const hora = dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        csv += `"${lead.cliente}","${lead.contato}","${lead.consultor}","${data}","${hora}",${lead.valor},"${lead.origem}","${lead.status}","${lead.probability}"\n`;
    });
    
    baixarArquivo(csv, 'crm-leads.csv', 'text/csv');
    mostrarToast('Arquivo CSV exportado com sucesso!', 'success');
}

function exportarJSON() {
    const json = JSON.stringify(databaseLeads, null, 2);
    baixarArquivo(json, 'crm-leads.json', 'application/json');
    mostrarToast('Arquivo JSON exportado com sucesso!', 'success');
}

function exportarPDF() {
    const element = document.getElementById('leadsTableBody');
    const opt = {
        margin: 10,
        filename: 'crm-leads.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save();
    mostrarToast('PDF exportado com sucesso!', 'success');
}

function importarDados() {
    document.getElementById('importFile').click();
}

document.getElementById('importFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const dados = JSON.parse(event.target.result);
            if (Array.isArray(dados)) {
                databaseLeads = dados;
                localStorage.setItem('crm_leads_offline_data', JSON.stringify(databaseLeads));
                renderizarTabelaLeads();
                mostrarToast('Dados importados com sucesso!', 'success');
            } else {
                mostrarToast('Formato de arquivo inválido!', 'error');
            }
        } catch (error) {
            mostrarToast('Erro ao importar arquivo!', 'error');
        }
    };
    reader.readAsText(file);
});

function baixarArquivo(conteudo, nomeArquivo, tipo) {
    const blob = new Blob([conteudo], { type: tipo });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// ===== REPORT FILTERS =====
function aplicarFiltrosRelatorio() {
    const consultorFilter = document.getElementById('filterConsultor').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const origemFilter = document.getElementById('filterOrigem').value;
    
    databaseLeadsFiltered = databaseLeads.filter(lead => {
        const matchConsultor = !consultorFilter || lead.consultor === consultorFilter;
        const matchStatus = !statusFilter || lead.status === statusFilter;
        const matchOrigem = !origemFilter || lead.origem === origemFilter;
        return matchConsultor && matchStatus && matchOrigem;
    });
    
    renderizarTabelaComFiltros();
    mostrarToast(`${databaseLeadsFiltered.length} registros encontrados!`, 'info');
}

function renderizarTabelaComFiltros() {
    const tableBody = document.getElementById('leadsTableBody');
    tableBody.innerHTML = '';
    
    (databaseLeadsFiltered.length > 0 ? databaseLeadsFiltered : databaseLeads).forEach(lead => {
        const numValor = parseFloat(lead.valor) || 0;
        const formattedValue = numValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const dateObj = new Date(lead.dataReuniao);
        const formattedDate = dateObj.toLocaleDateString('pt-BR') + ' - ' + dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

        const statusColor = {
            'Novo': 'bg-blue-100 text-blue-700',
            'Em Contato': 'bg-yellow-100 text-yellow-700',
            'Qualificado': 'bg-purple-100 text-purple-700',
            'Proposta': 'bg-indigo-100 text-indigo-700',
            'Fechado': 'bg-emerald-100 text-emerald-700',
            'Perdido': 'bg-red-100 text-red-700'
        };

        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50/50 transition";
        row.innerHTML = `
            <td class="p-4 pl-6">
                <div class="font-bold text-slate-900">${lead.cliente}</div>
                <div class="text-xs text-slate-400 font-medium mt-0.5">${lead.contato}</div>
            </td>
            <td class="p-4 font-semibold text-slate-600">${lead.consultor}</td>
            <td class="p-4 font-medium text-slate-500">${formattedDate}</td>
            <td class="p-4 font-bold text-slate-900">${formattedValue}</td>
            <td class="p-4"><span class="${statusColor[lead.status] || 'bg-slate-100 text-slate-700'} px-2.5 py-1 rounded-lg text-xs font-semibold">${lead.status}</span></td>
            <td class="p-4"><span class="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">${lead.origem}</span></td>
            <td class="p-4 text-center">
                <button onclick="abrirAgendaGoogleExterno('${lead.cliente}', '${lead.consultor}', '${lead.contato}', '${lead.valor}', '${lead.origem}', '${lead.dataReuniao}', '${lead.status}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 shadow transition cursor-pointer">
                    <i class="fa-solid fa-calendar-plus"></i> Sync
                </button>
            </td>
            <td class="p-4 text-right pr-6 space-x-1 whitespace-nowrap">
                <button onclick="prepararEdicao('${lead.id}')" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg text-xs font-bold transition hover:bg-indigo-100"><i class="fa-solid fa-pen"></i></button>
                <button onclick="removerLead('${lead.id}')" class="text-rose-600 hover:text-rose-900 bg-rose-50 p-2 rounded-lg text-xs font-bold transition hover:bg-rose-100"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ===== GLOBAL SEARCH =====
document.getElementById('globalSearch').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = databaseLeads.filter(lead => 
        lead.cliente.toLowerCase().includes(searchTerm) ||
        lead.contato.toLowerCase().includes(searchTerm) ||
        lead.consultor.toLowerCase().includes(searchTerm)
    );
    
    const tableBody = document.getElementById('leadsTableBody');
    tableBody.innerHTML = '';
    
    filtered.forEach(lead => {
        const numValor = parseFloat(lead.valor) || 0;
        const formattedValue = numValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const dateObj = new Date(lead.dataReuniao);
        const formattedDate = dateObj.toLocaleDateString('pt-BR') + ' - ' + dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

        const statusColor = {
            'Novo': 'bg-blue-100 text-blue-700',
            'Em Contato': 'bg-yellow-100 text-yellow-700',
            'Qualificado': 'bg-purple-100 text-purple-700',
            'Proposta': 'bg-indigo-100 text-indigo-700',
            'Fechado': 'bg-emerald-100 text-emerald-700',
            'Perdido': 'bg-red-100 text-red-700'
        };

        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50/50 transition";
        row.innerHTML = `
            <td class="p-4 pl-6">
                <div class="font-bold text-slate-900">${lead.cliente}</div>
                <div class="text-xs text-slate-400 font-medium mt-0.5">${lead.contato}</div>
            </td>
            <td class="p-4 font-semibold text-slate-600">${lead.consultor}</td>
            <td class="p-4 font-medium text-slate-500">${formattedDate}</td>
            <td class="p-4 font-bold text-slate-900">${formattedValue}</td>
            <td class="p-4"><span class="${statusColor[lead.status] || 'bg-slate-100 text-slate-700'} px-2.5 py-1 rounded-lg text-xs font-semibold">${lead.status}</span></td>
            <td class="p-4"><span class="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">${lead.origem}</span></td>
            <td class="p-4 text-center">
                <button onclick="abrirAgendaGoogleExterno('${lead.cliente}', '${lead.consultor}', '${lead.contato}', '${lead.valor}', '${lead.origem}', '${lead.dataReuniao}', '${lead.status}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 shadow transition cursor-pointer">
                    <i class="fa-solid fa-calendar-plus"></i> Sync
                </button>
            </td>
            <td class="p-4 text-right pr-6 space-x-1 whitespace-nowrap">
                <button onclick="prepararEdicao('${lead.id}')" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg text-xs font-bold transition hover:bg-indigo-100"><i class="fa-solid fa-pen"></i></button>
                <button onclick="removerLead('${lead.id}')" class="text-rose-600 hover:text-rose-900 bg-rose-50 p-2 rounded-lg text-xs font-bold transition hover:bg-rose-100"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
});

// ===== INITIALIZE =====
atualizarInterfaceConsultores();
