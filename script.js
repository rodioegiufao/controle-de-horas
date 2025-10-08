// Dados de exemplo
let employees = [
    {
        id: 1,
        name: "João Silva",
        position: "Desenvolvedor",
        department: "TI",
        email: "joao@empresa.com",
        status: "active",
        startTime: "08:00",
        currentActivity: "Desenvolvimento do sistema de controle"
    },
    {
        id: 2,
        name: "Maria Santos",
        position: "Analista de Vendas",
        department: "Vendas",
        email: "maria@empresa.com",
        status: "break",
        startTime: "09:00",
        currentActivity: "Reunião com cliente"
    },
    {
        id: 3,
        name: "Pedro Oliveira",
        position: "Designer",
        department: "Marketing",
        email: "pedro@empresa.com",
        status: "inactive",
        startTime: "",
        currentActivity: ""
    }
];

// Usuários válidos para login
const validUsers = [
    { email: "admin@empresa.com", password: "123456", name: "Administrador" },
    { email: "joao@empresa.com", password: "123456", name: "João Silva" },
    { email: "maria@empresa.com", password: "123456", name: "Maria Santos" }
];

// Elementos do DOM
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');

const employeeTableBody = document.getElementById('employee-table-body');
const activeEmployeesElement = document.getElementById('active-employees');
const workingNowElement = document.getElementById('working-now');
const onBreakElement = document.getElementById('on-break');
const hoursTodayElement = document.getElementById('hours-today');
const addEmployeeBtn = document.getElementById('add-employee-btn');
const startWorkBtn = document.getElementById('start-work-btn');
const startBreakBtn = document.getElementById('start-break-btn');
const endWorkBtn = document.getElementById('end-work-btn');
const employeeModal = document.getElementById('employee-modal');
const activityModal = document.getElementById('activity-modal');
const employeeForm = document.getElementById('employee-form');
const activityForm = document.getElementById('activity-form');
const closeModalButtons = document.querySelectorAll('.close-modal');
const cancelEmployeeBtn = document.getElementById('cancel-employee');
const cancelActivityBtn = document.getElementById('cancel-activity');
const activityModalTitle = document.getElementById('activity-modal-title');

// Usuário logado
let currentUser = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se há um usuário logado (em uma implementação real, isso viria de uma sessão/token)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    }
    
    // Adicionar event listeners
    initializeEventListeners();
});

// Inicializar todos os event listeners
function initializeEventListeners() {
    // Login
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Modal de funcionário
    addEmployeeBtn.addEventListener('click', () => employeeModal.style.display = 'flex');
    
    // Fechar modais
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    cancelEmployeeBtn.addEventListener('click', () => employeeModal.style.display = 'none');
    cancelActivityBtn.addEventListener('click', () => activityModal.style.display = 'none');
    
    // Formulários
    employeeForm.addEventListener('submit', handleEmployeeFormSubmit);
    
    // Controles de trabalho
    startWorkBtn.addEventListener('click', () => openActivityModal('Iniciar Trabalho', handleStartWork));
    startBreakBtn.addEventListener('click', () => openActivityModal('Iniciar Pausa', handleStartBreak));
    endWorkBtn.addEventListener('click', handleEndWork);
}

// Manipulador de login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Verificar credenciais
    const user = validUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainApp();
    } else {
        alert('E-mail ou senha incorretos!');
    }
}

// Manipulador de logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginScreen();
}

// Manipulador do formulário de funcionário
function handleEmployeeFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('employee-name').value;
    const position = document.getElementById('employee-position').value;
    const department = document.getElementById('employee-department').value;
    const email = document.getElementById('employee-email').value;
    
    const newEmployee = {
        id: employees.length > 0 ? Math.max(...employees.map(emp => emp.id)) + 1 : 1,
        name,
        position,
        department,
        email,
        status: 'inactive',
        startTime: '',
        currentActivity: ''
    };
    
    employees.push(newEmployee);
    renderEmployeeTable();
    updateDashboard();
    employeeModal.style.display = 'none';
    employeeForm.reset();
}

// Manipulador de início de trabalho
function handleStartWork(e) {
    e.preventDefault();
    
    const activity = document.getElementById('activity-description').value;
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Encontrar o funcionário atual (baseado no usuário logado)
    const currentEmployee = employees.find(emp => emp.email === currentUser.email);
    
    if (currentEmployee) {
        currentEmployee.status = 'active';
        currentEmployee.startTime = timeString;
        currentEmployee.currentActivity = activity;
    }
    
    renderEmployeeTable();
    updateDashboard();
    activityModal.style.display = 'none';
    activityForm.reset();
}

// Manipulador de início de pausa
function handleStartBreak(e) {
    e.preventDefault();
    
    const activity = document.getElementById('activity-description').value;
    
    // Encontrar o funcionário atual (baseado no usuário logado)
    const currentEmployee = employees.find(emp => emp.email === currentUser.email);
    
    if (currentEmployee && currentEmployee.status === 'active') {
        currentEmployee.status = 'break';
        currentEmployee.currentActivity = activity;
    }
    
    renderEmployeeTable();
    updateDashboard();
    activityModal.style.display = 'none';
    activityForm.reset();
}

// Manipulador de fim de trabalho
function handleEndWork() {
    // Encontrar o funcionário atual (baseado no usuário logado)
    const currentEmployee = employees.find(emp => emp.email === currentUser.email);
    
    if (currentEmployee && (currentEmployee.status === 'active' || currentEmployee.status === 'break')) {
        currentEmployee.status = 'inactive';
        currentEmployee.currentActivity = '';
    }
    
    renderEmployeeTable();
    updateDashboard();
}

// Mostrar tela principal
function showMainApp() {
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
    
    // Atualizar informações do usuário
    userName.textContent = currentUser.name;
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    
    renderEmployeeTable();
    updateDashboard();
}

// Mostrar tela de login
function showLoginScreen() {
    loginScreen.style.display = 'flex';
    mainApp.style.display = 'none';
    loginForm.reset();
}

// Renderizar tabela de funcionários
function renderEmployeeTable() {
    employeeTableBody.innerHTML = '';
    
    employees.forEach(employee => {
        const row = document.createElement('tr');
        
        let statusClass = '';
        let statusText = '';
        
        switch(employee.status) {
            case 'active':
                statusClass = 'status-active';
                statusText = 'Trabalhando';
                break;
            case 'break':
                statusClass = 'status-break';
                statusText = 'Em Pausa';
                break;
            case 'inactive':
                statusClass = 'status-inactive';
                statusText = 'Fora do Trabalho';
                break;
        }
        
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.position}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>${employee.startTime || '-'}</td>
            <td>${employee.currentActivity || '-'}</td>
            <td>
                <button class="btn" onclick="editEmployee(${employee.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteEmployee(${employee.id})">Excluir</button>
            </td>
        `;
        
        employeeTableBody.appendChild(row);
    });
}

// Atualizar dashboard
function updateDashboard() {
    const activeCount = employees.filter(emp => emp.status === 'active' || emp.status === 'break').length;
    const workingCount = employees.filter(emp => emp.status === 'active').length;
    const breakCount = employees.filter(emp => emp.status === 'break').length;
    
    // Calcular horas trabalhadas (simulação)
    const totalHours = employees.reduce((total, emp) => {
        if (emp.startTime) {
            const start = new Date(`2000-01-01T${emp.startTime}`);
            const now = new Date();
            const diffMs = now - start;
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            return total + (diffHrs > 0 ? diffHrs : 0);
        }
        return total;
    }, 0);
    
    activeEmployeesElement.textContent = activeCount;
    workingNowElement.textContent = workingCount;
    onBreakElement.textContent = breakCount;
    hoursTodayElement.textContent = `${totalHours}h`;
}

// Abrir modal de atividade
function openActivityModal(title, submitHandler) {
    activityModalTitle.textContent = title;
    activityModal.style.display = 'flex';
    
    activityForm.onsubmit = submitHandler;
}

// Fechar todos os modais
function closeModals() {
    employeeModal.style.display = 'none';
    activityModal.style.display = 'none';
}

// Editar funcionário
function editEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
        document.getElementById('employee-name').value = employee.name;
        document.getElementById('employee-position').value = employee.position;
        document.getElementById('employee-department').value = employee.department;
        document.getElementById('employee-email').value = employee.email;
        
        employeeModal.style.display = 'flex';
        
        // Alterar comportamento do formulário para edição
        employeeForm.onsubmit = function(e) {
            e.preventDefault();
            
            employee.name = document.getElementById('employee-name').value;
            employee.position = document.getElementById('employee-position').value;
            employee.department = document.getElementById('employee-department').value;
            employee.email = document.getElementById('employee-email').value;
            
            renderEmployeeTable();
            updateDashboard();
            employeeModal.style.display = 'none';
            employeeForm.reset();
            
            // Restaurar comportamento padrão do formulário
            employeeForm.onsubmit = handleEmployeeFormSubmit;
        };
    }
}

// Excluir funcionário
function deleteEmployee(id) {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
        employees = employees.filter(emp => emp.id !== id);
        renderEmployeeTable();
        updateDashboard();
    }
}

// Atualizar dashboard a cada minuto
setInterval(updateDashboard, 60000);