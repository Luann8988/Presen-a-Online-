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
    alert("Digite seu nome!");
    input.focus();
    return;
  }

  if (nome.length > 50) {
    alert("Seu nome está muito grande (máx. 50 caracteres)." );
    input.focus();
    return;
  }

  const limite = new Date("2026-07-04T23:59:00");
  const agora = new Date();

  if (agora > limite) {
    alert("Prazo de confirmação encerrado (até 04/07 23:59)." );
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
  alert(`${nome} está confirmado(a) ✅`);
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

    if (btnSair) btnSair.classList.remove("hidden");

    if (aba) {
      aba.classList.remove("hidden");
      atualizarLista();
    }
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

  const ok = confirm(`Excluir ${p.nome} da lista?`);
  if (!ok) return;

  confirmados.splice(index, 1);
  salvar();
  atualizarLista();
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// Carrega ao abrir a página
(function init() {
  atualizarLista();

  const btnSair = document.getElementById("btnSair");
  if (btnSair) {
    btnSair.classList.toggle("hidden", !isAutenticado());
  }
})();

