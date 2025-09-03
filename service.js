// ==========================
// CONFIGURAÇÃO DO FIREBASE
// ==========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 troque pelos dados do seu projeto
const firebaseConfig = {
    apiKey: "AIzaSyBrqw6sH5YlKbEqwADHPeRd7lQd5mybtVI",
    authDomain: "eudoraceilandia-45aec.firebaseapp.com",
    projectId: "eudoraceilandia-45aec",
    storageBucket: "eudoraceilandia-45aec.firebasestorage.app",
    messagingSenderId: "206014909434",
    appId: "1:206014909434:web:e4f77a6b02ac1b1f52b243",
    measurementId: "G-XM1HKDJBE4"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================
// VARIÁVEIS GLOBAIS
// ==========================
let fornecedores = [];
let vendas = [];
let itensVendaAtual = [];

// ==========================
// LOGIN / LOGOUT
// ==========================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const senha = document.getElementById("loginPassword").value;

    try {
        await signInWithEmailAndPassword(auth, email, senha);
    } catch (err) {
        mostrarErroLogin("Usuário ou senha incorretos!");
    }
});

async function logout() {
    await signOut(auth);
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("loginScreen").classList.add("hidden");
        document.getElementById("mainSystem").classList.remove("hidden");
        showScreen("dashboard");
        carregarFornecedores();
        carregarVendas();
    } else {
        document.getElementById("loginScreen").classList.remove("hidden");
        document.getElementById("mainSystem").classList.add("hidden");
    }
});

// ==========================
// FORNECEDORES
// ==========================
const fornecedoresRef = collection(db, "fornecedores");

async function carregarFornecedores() {
    fornecedores = [];
    const snapshot = await getDocs(fornecedoresRef);
    snapshot.forEach((docSnap) => {
        fornecedores.push({ id: docSnap.id, ...docSnap.data() });
    });
    atualizarListaFornecedores();
}

document.getElementById("fornecedorForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nomeFornecedor").value.trim();
    const porcentagem = parseFloat(
        document.getElementById("porcentagemLucro").value
    );

    if (!nome || isNaN(porcentagem)) {
        mostrarAviso("Dados inválidos.", "erro");
        return;
    }

    try {
        await addDoc(fornecedoresRef, { nome, porcentagem });
        document.getElementById("fornecedorForm").reset();
        carregarFornecedores();
        mostrarAviso(`Fornecedor "${nome}" cadastrado com sucesso! 🎉`, "sucesso");
    } catch {
        mostrarAviso("Erro ao cadastrar fornecedor.", "erro");
    }
});

async function removerFornecedor(id) {
    await deleteDoc(doc(db, "fornecedores", id));
    carregarFornecedores();
}

// ==========================
// VENDAS
// ==========================
const vendasRef = collection(db, "vendas");

async function carregarVendas() {
    vendas = [];
    const snapshot = await getDocs(vendasRef);
    snapshot.forEach((docSnap) => {
        vendas.push({ id: docSnap.id, ...docSnap.data() });
    });
    atualizarDashboard();
}

async function finalizarVenda() {
    const data = document.getElementById("dataVenda").value;
    if (!data || itensVendaAtual.length === 0) {
        mostrarAviso("Preencha os itens e a data!", "erro");
        return;
    }

    const vendaId =
        Date.now() + "_" + Math.random().toString(36).substr(2, 9);

    try {
        for (const item of itensVendaAtual) {
            await addDoc(vendasRef, {
                vendaId,
                data,
                fornecedor: item.fornecedor,
                produto: item.produto,
                valor: item.valor
            });
        }
        itensVendaAtual = [];
        atualizarListaItens();
        carregarVendas();
        mostrarAviso("Venda finalizada com sucesso! 🎉", "sucesso");
    } catch {
        mostrarAviso("Erro ao finalizar venda.", "erro");
    }
}

// ==========================
// FUNÇÕES DE UI
// (mantidas do seu código antigo)
// ==========================

function showScreen(id) {
    document.querySelectorAll(".screen").forEach((el) => el.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

function mostrarAviso(msg, tipo) {
    alert(`[${tipo}] ${msg}`); // ajuste para seu front
}

function mostrarErroLogin(msg) {
    alert(msg);
}

function atualizarListaFornecedores() {
    // aqui você mantém a renderização que já fazia
    console.log("Fornecedores:", fornecedores);
}

function atualizarDashboard() {
    // aqui você mantém a lógica do dashboard
    console.log("Vendas:", vendas);
}

function atualizarListaItens() {
    // mantém sua lógica de renderização
    console.log("Itens venda atual:", itensVendaAtual);
}
