// ===== Dados =====
let confirmados = JSON.parse(localStorage.getItem("confirmados")) || [];

// ===== Autenticação do aniversariante =====
const ANIVERSARIANTE_USUARIO = "carol";
const ANIVERSARIANTE_SENHA = "1234";
const AUTH_KEY = "isAniversarianteAutenticado";

function salvar() {
  localStorage.setItem("confirmados", JSON.stringify(confirmados));
}

function normalizarNome(nome) {
  return (nome || "").trim().replace(/\s+/g, " ");
}

function isAutenticado() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

function setAutenticado(valor) {
  sessionStorage.setItem(AUTH_KEY, valor ? "true" : "false");
}

function confirmar() {
  let input = document.getElementById("nome");
  let nome = normalizarNome(input.value);

  if (!nome) {
    showNotification("Por favor, digite seu nome.", "error");
    input.focus();
    return;
  }

  if (nome.length > 50) {
    showNotification("O nome está muito grande (máx. 50 caracteres).", "error");
    input.focus();
    return;
  }

  const limite = new Date("2026-07-04T23:59:00");
  const agora = new Date();

  if (agora > limite) {
    showNotification("Prazo de confirmação encerrado (até 04/07 23:59).", "error");
    return;
  }

  let dataHora = agora.toLocaleString();


  // Evita duplicados por nome (normalizado). Se já existir, atualiza a data e mantém no topo.
  let indexExistente = confirmados.findIndex((p) => normalizarNome(p.nome) === nome);
  if (indexExistente >= 0) {
    confirmados[indexExistente].nome = nome;
    confirmados[indexExistente].data = dataHora;
    const atualizada = confirmados.splice(indexExistente, 1)[0];
    confirmados.unshift(atualizada);
  } else {
    confirmados.unshift({ nome, data: dataHora });
  }

  salvar();
  atualizarLista();

  input.value = "";
  input.focus();
  showNotification(`${nome} está confirmado(a) ✅`, "success");
}

function atualizarLista() {
  let lista = document.getElementById("lista");
  let listaCount = document.getElementById("listaCount");
  if (!lista) return;

  lista.innerHTML = "";
  if (listaCount) listaCount.textContent = String(confirmados.length);

  confirmados.forEach((p, idx) => {
    let item = document.createElement("li");
    item.className = "lista__item";

    let meta = document.createElement("div");
    meta.className = "lista__meta";
    meta.innerHTML =
      `<div class="lista__nome">${escapeHtml(p.nome)}</div>` +
      `<div class="lista__data">confirmou em ${escapeHtml(p.data)} ✅</div>`;

    let actions = document.createElement("div");
    actions.className = "lista__actions";

    if (isAutenticado()) {
      let btnExcluir = document.createElement("button");
      btnExcluir.type = "button";
      btnExcluir.className = "btn btn--danger btn--small";
      btnExcluir.textContent = "Excluir";
      btnExcluir.onclick = () => excluirConfirmado(idx);
      actions.appendChild(btnExcluir);
    }

    item.appendChild(meta);
    item.appendChild(actions);
    lista.appendChild(item);
  });
}

function toggleLista() {
  const authArea = document.getElementById("authArea");
  const aba = document.getElementById("abaLista");
  const btnSair = document.getElementById("btnSair");

  if (!aba) return;

  if (!isAutenticado()) {
    if (authArea) authArea.classList.remove("hidden");
    if (aba) aba.classList.add("hidden");
    if (btnSair) btnSair.classList.add("hidden");
    return;
  }

  aba.classList.toggle("hidden");
  if (authArea) authArea.classList.add("hidden");
  if (btnSair) btnSair.classList.toggle("hidden", !isAutenticado());
}

function fecharAuth() {
  const authArea = document.getElementById("authArea");
  if (authArea) authArea.classList.add("hidden");

  const aba = document.getElementById("abaLista");
  if (aba) aba.classList.add("hidden");

  const msg = document.getElementById("authMsg");
  if (msg) msg.textContent = "";
}

function loginAniversariante() {
  const loginInput = document.getElementById("login");
  const senhaInput = document.getElementById("senha");
  const authArea = document.getElementById("authArea");
  const authMsg = document.getElementById("authMsg");
  const btnSair = document.getElementById("btnSair");
  const aba = document.getElementById("abaLista");

  const usuario = (loginInput?.value || "").trim();
  const senha = (senhaInput?.value || "").trim();

  if (!usuario || !senha) {
    if (authMsg) authMsg.textContent = "Preencha usuário e senha.";
    return;
  }

  if (usuario === ANIVERSARIANTE_USUARIO && senha === ANIVERSARIANTE_SENHA) {
    setAutenticado(true);

    if (authArea) authArea.classList.add("hidden");
    if (authMsg) authMsg.textContent = "Acesso liberado ✅";

    // Apenas exibe a lista, sem modificá-la
    if (btnSair) btnSair.classList.remove("hidden"); // Mostra o botão de sair
    if (aba) aba.classList.remove("hidden"); // Mostra a área da lista
    atualizarLista(); // Atualiza a exibição da lista com todos os confirmados
    return;
  }

  setAutenticado(false);
  if (authMsg) authMsg.textContent = "Usuário ou senha incorretos.";
}

function sairAniversariante() {
  setAutenticado(false);

  const authArea = document.getElementById("authArea");
  const aba = document.getElementById("abaLista");
  const btnSair = document.getElementById("btnSair");

  if (authArea) authArea.classList.add("hidden");
  if (aba) aba.classList.add("hidden");
  if (btnSair) btnSair.classList.add("hidden");

  atualizarLista();
}

function excluirConfirmado(index) {
  if (!isAutenticado()) return;

  const p = confirmados[index];
  if (!p) return;

  showConfirmationDialog(`Deseja realmente excluir "${p.nome}" da lista?`, () => {
    confirmados.splice(index, 1);
    salvar();
    atualizarLista();
    showNotification(`"${p.nome}" foi excluído(a).`, "info");
  });
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showNotification(message, type = "info") {
  const container = document.body;
  const notification = document.createElement("div");
  notification.textContent = message;

  const styles = {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 20px",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
    zIndex: "2000",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    opacity: "0",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
  };

  const typeColors = {
    success: "#28a745",
    error: "#dc3545",
    info: "#17a2b8",
  };

  styles.backgroundColor = typeColors[type] || typeColors.info;

  Object.assign(notification.style, styles);

  container.appendChild(notification);

  // Força o navegador a aplicar o estado inicial antes de animar
  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0)";
  }, 10);

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";
    notification.addEventListener("transitionend", () => notification.remove());
  }, 3500);
}

function showConfirmationDialog(message, onConfirm) {
  const overlay = document.createElement("div");
  overlay.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 3000;">
      <div style="background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); text-align: center; max-width: 320px;">
        <p style="margin: 0 0 20px; font-size: 16px; color: #333;">${escapeHtml(message)}</p>
        <div style="display: flex; justify-content: center; gap: 12px;">
          <button id="confirm-dialog-cancel" class="btn btn--small">Cancelar</button>
          <button id="confirm-dialog-ok" class="btn btn--danger btn--small">Confirmar</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const btnOk = document.getElementById("confirm-dialog-ok");
  const btnCancel = document.getElementById("confirm-dialog-cancel");

  btnOk.onclick = () => {
    onConfirm();
    overlay.remove();
  };

  btnCancel.onclick = () => {
    overlay.remove();
  };

  btnCancel.focus();
}

// Carrega ao abrir a página
(function init() {
  atualizarLista();

  const btnSair = document.getElementById("btnSair");
  if (btnSair) {
    btnSair.classList.toggle("hidden", !isAutenticado());
  }
})();
