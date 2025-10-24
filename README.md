# 💪 Reis Fit

**Reis Fit** é um aplicativo de treinos moderno e minimalista, desenvolvido em **React + Vite**, com design inspirado no app da Smart Fit.  
O objetivo é oferecer uma experiência simples e direta para acompanhar seus treinos, progresso semanal e streaks — tudo rodando 100% **offline**, graças ao suporte **PWA**.

🔗 **Acesse agora:** [https://pedroreeis.github.io/reis-fit/](https://pedroreeis.github.io/reis-fit/)

---

## 🧠 Funcionalidades

- 📅 **Controle semanal de treinos** — veja facilmente quais dias você treinou  
- 🔥 **Streak diário** — mantenha sua sequência de treinos e veja seu progresso  
- 🏋️ **Criação e histórico de treinos personalizados**  
- 💾 **Armazenamento local (LocalDB)** — sem necessidade de login ou servidor  
- 🧍 **Perfil pessoal** — nome, metas, e estatísticas  
- 🌙 **Modo PWA (Progressive Web App)** — instale na tela inicial e use offline  
- ⚡ **Frontend 100% estático** — hospedado via GitHub Pages, sem backend

---

## 🧩 Tecnologias

- ⚛️ **React** + **Vite**
- 🎨 **Tailwind CSS**
- 💾 **IndexedDB / LocalStorage**
- 📱 **PWA (vite-plugin-pwa)**
- 🚀 **Hospedagem:** GitHub Pages (`/docs` folder)

---

## 🛠️ Como rodar localmente

1. Clone o repositório:

   ```bash
   git clone https://github.com/pedroreeis/reis-fit.git
   ```
2. Entre na pasta do projeto:

   ```bash
   cd reis-fit
   ```
3. Instale as dependências:

   ```bash
   npm install
   ```
4. Rode o projeto em modo de desenvolvimento:

   ```bash
   npm run dev
   ```
5. Gere o build de produção:

   ```bash
   npm run build
   ```

---

## 🌍 Deploy via GitHub Pages

O projeto está configurado para publicar a build estática dentro da pasta `docs/`.

Para atualizar o site:

```bash
npm run build
rm -rf docs
cp -r dist docs
git add docs
git commit -m "deploy: nova versão do Reis Fit"
git push origin main
```

O GitHub Pages servirá automaticamente a pasta `docs/`.

---

## 📱 Instalação como App (PWA)

1. Acesse o site pelo navegador no celular
2. Clique em **“Adicionar à tela inicial”**
3. O Reis Fit funcionará como um aplicativo independente e offline

---

## 🧑‍💻 Sobre o projeto

O Reis Fit nasceu da ideia de criar um app de treino **do meu jeito**, sem depender de soluções prontas.
A interface é intuitiva, fluida e direta, focada em **simplicidade e consistência**.

Feito com 💛 por [Pedro Reis](https://github.com/pedroreeis)

---

## 📜 Licença

Este projeto é de código aberto e está disponível sob a licença **MIT**.
Sinta-se livre para usar, modificar e se inspirar para criar seu próprio app de treinos.

```
