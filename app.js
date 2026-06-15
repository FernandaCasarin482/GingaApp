/* ================================================================
   GINGA! – app.js
   Interações: ripple, navegação futura, acessibilidade por teclado
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSettingsModal();
  initRoleModal(); // Modal de escolha de papel (Dama/Cavalheiro/Casal)
  loadUserData(); // Carrega os dados salvos do usuário
  updateStreak(); // Atualiza e calcula a ofensiva de dias
  updateProfileStats(); // Atualiza contador de troféus e módulos no perfil
  initProgression(); // Initialize level progression
  initSuccessModal();
  initAchievementPopup(); // Popup de conquista desbloqueada
  renderConquistas(); // Renderiza conquistas no perfil e na tela de conquistas
  initGlossarioSearch(); // Ativa a busca de termos do glossário
  initRecompensaScreen(); // Textos dinâmicos de recompensa

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      btnLogout.innerHTML = '<span class="btn-label">SAINDO...</span>';
      if (window.supabaseAPI) {
        await window.supabaseAPI.signOut();
      }
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = 'login.html';
    });
  }
});
/* ================================================================
   MODAL DE CONFIGURAÇÕES (INJEÇÃO DINÂMICA)
   ================================================================ */

function initSettingsModal() {
  // 1. Criar o HTML do modal
  const modalHTML = `
    <div class="settings-modal-overlay" id="settingsModal">
      <div class="settings-modal-container">
        <button class="btn-close-settings" id="closeSettings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        
        <h2 class="font-bebas settings-title">CONFIGURAÇÕES</h2>
        
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-label-wrap">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              </div>
              <span class="setting-text">Efeitos de Som</span>
            </div>
            <label class="switch">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-label-wrap">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
              </div>
              <span class="setting-text">Música de Fundo</span>
            </div>
            <label class="switch">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-label-wrap">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
              <span class="setting-text">Notificações</span>
            </div>
            <label class="switch">
              <input type="checkbox">
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-label-wrap">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              </div>
              <span class="setting-text">Modo Escuro</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="darkModeToggle">
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item" style="border-bottom: none;">
            <div class="setting-label-wrap">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </div>
              <span class="setting-text">Idioma</span>
            </div>
            <span class="setting-text" style="color: #B58A55; font-size: 12px;">Português (BR)</span>
          </div>
        </div>
        
        <button class="btn-logout font-bebas-ui">SAIR DA CONTA</button>
      </div>
    </div>
  `;

  // 2. Inserir no body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('settingsModal');
  const btnClose = document.getElementById('closeSettings');
  const btnsOpen = document.querySelectorAll('.btn-settings');

  // 3. Eventos
  btnsOpen.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  });

  btnClose.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Dark Mode Toggle Logic
  const darkModeToggle = document.getElementById('darkModeToggle');
  const currentTheme = localStorage.getItem('ginga_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if(darkModeToggle) darkModeToggle.checked = true;
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  if(darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('ginga_theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('ginga_theme', 'light');
      }
    });
  }

  // Logout
  const btnLogout = modal.querySelector('.btn-logout');
  btnLogout.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

function initNavigation() {
  // Global Back Buttons (Consolidated)
  // Logic moved to bottom of initNavigation for consistency

  const btnPrimary = document.getElementById('btn-comecar');
  const btnSecondary = document.getElementById('btn-comunidade');

  /* ── Efeito ripple ao clicar ── */
  function addRipple(e, el) {
    const old = el.querySelector('.ripple');
    if (old) old.remove();

    const rect = el.getBoundingClientRect();

    // Suporte robusto para touch e mouse
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2.2;

    const span = document.createElement('span');
    span.className = 'ripple';
    Object.assign(span.style, {
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.28)',
      width: size + 'px',
      height: size + 'px',
      left: (cx - size / 2) + 'px',
      top: (cy - size / 2) + 'px',
      pointerEvents: 'none',
      animation: 'rippleAnim 0.6s ease-out forwards',
    });
    el.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  }

  /* ── Botão COMEÇAR AGORA ── */
  if (btnPrimary) {
    btnPrimary.addEventListener('mousedown', (e) => addRipple(e, btnPrimary));
    btnPrimary.addEventListener('touchstart', (e) => addRipple(e, btnPrimary), { passive: true });
  }

  /* ── Botão JÁ SOU DA COMUNIDADE ── */
  if (btnSecondary) {
    btnSecondary.addEventListener('mousedown', (e) => addRipple(e, btnSecondary));
    btnSecondary.addEventListener('touchstart', (e) => addRipple(e, btnSecondary), { passive: true });
  }

  /* ── Acessibilidade: Enter / Space ── */
  [btnPrimary, btnSecondary].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  /* ── Protótipo: Login com Supabase ── */
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const senha = document.getElementById('login-senha').value;
      const btn = formLogin.querySelector('button[type="submit"]');
      
      if (btn) btn.innerHTML = '<span class="btn-label">CARREGANDO...</span>';
      
      if (window.supabaseAPI) {
        const { data, error } = await window.supabaseAPI.signIn(email, senha);
        if (error) {
          alert('Erro ao fazer login: ' + error.message);
          if (btn) btn.innerHTML = '<span class="btn-label">ENTRAR</span>';
          return;
        }
        
        // Load progress from cloud to local storage after successful login
        const cloudData = await window.supabaseAPI.loadProgressFromCloud();
        if (cloudData) {
           if(cloudData.apelido) localStorage.setItem('ginga_apelido', cloudData.apelido);
           if(cloudData.personagem) localStorage.setItem('ginga_personagem', cloudData.personagem);
           if(cloudData.quadrilha_progress) localStorage.setItem('ginga_quadrilha_progress', cloudData.quadrilha_progress);
           if(cloudData.hiphop_progress) localStorage.setItem('ginga_hiphop_progress', cloudData.hiphop_progress);
           if(cloudData.gaucha_progress) localStorage.setItem('ginga_gaucha_progress', cloudData.gaucha_progress);
           if(cloudData.afro_progress) localStorage.setItem('ginga_afro_progress', cloudData.afro_progress);
           if(cloudData.achievements_unlocked) localStorage.setItem('ginga_achievements_unlocked', JSON.stringify(cloudData.achievements_unlocked));
        }
      }
      
      window.location.href = 'ritmos.html';
    });
  }

  /* ── Protótipo: Formulário de Criar Conta ── */
  const formCriarConta = document.getElementById('form-criar-conta');
  if (formCriarConta) {
    formCriarConta.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
      const nome = document.getElementById('nome').value;
      const confirmar = document.getElementById('confirmar').value;
      const btn = formCriarConta.querySelector('button[type="submit"]');
      
      if (senha !== confirmar) {
        alert('As senhas não coincidem!');
        return;
      }
      
      if (btn) btn.innerHTML = '<span class="btn-label">CARREGANDO...</span>';
      
      if (window.supabaseAPI) {
        const { data, error } = await window.supabaseAPI.signUp(email, senha, nome);
        if (error) {
          alert('Erro ao criar conta: ' + error.message);
          if (btn) btn.innerHTML = '<span class="btn-label">CRIAR MINHA CONTA</span>';
          return;
        }
        
        // Create initial cloud profile
        await window.supabaseAPI.saveProgressToCloud({
           apelido: nome,
           personagem: 'IMG/BOI DANÇANDO.png',
           quadrilha_progress: 1,
           hiphop_progress: 1,
           gaucha_progress: 1,
           afro_progress: 1,
           achievements_unlocked: []
        });
      }
      
      window.location.href = 'apelido.html';
    });
  }

  /* ── Protótipo: Apelido sem validação ── */
  const formApelido = document.getElementById('form-apelido');
  if (formApelido) {
    formApelido.addEventListener('submit', (e) => {
      e.preventDefault();

      // Salva o apelido no localStorage e na nuvem
      const inputApelido = document.getElementById('apelido-input');
      if (inputApelido && inputApelido.value.trim() !== "") {
        const apelidoValue = inputApelido.value.trim();
        localStorage.setItem('ginga_apelido', apelidoValue);
        if (window.supabaseAPI) window.supabaseAPI.saveProgressToCloud({ apelido: apelidoValue });
      }

      // Verifica se viemos da tela de perfil para redirecionar de volta
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('from') === 'perfil') {
        window.location.href = 'perfil.html';
      } else {
        window.location.href = 'ritmos.html';
      }
    });
  }

  /* ── Protótipo: Seleção de Ginga ── */
  const cards = document.querySelectorAll('.ginga-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove selected de todos
      cards.forEach(c => c.classList.remove('selected'));
      // Adiciona no clicado
      card.classList.add('selected');

      // Se quiser que o card selecionado centralize suavemente:
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  /* ── Protótipo: Avançar para Ritmos ── */
  const btnVamosNessa = document.querySelector('.btn-vamos-nessa');
  if (btnVamosNessa) {
    btnVamosNessa.addEventListener('click', (e) => {
      e.preventDefault();

      // Salva o personagem selecionado
      const selectedGingaCard = document.querySelector('.ginga-card.selected img');
      if (selectedGingaCard) {
        const src = selectedGingaCard.getAttribute('src');
        localStorage.setItem('ginga_personagem', src);
        if (window.supabaseAPI) window.supabaseAPI.saveProgressToCloud({ personagem: src });
      }

      // Verifica se viemos da tela de perfil para redirecionar corretamente
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('from') === 'perfil') {
        window.location.href = 'perfil.html';
      } else {
        window.location.href = 'ritmos.html';
      }
    });
  }

  /* ── Botão de Voltar Global ── */
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      // Prioridade: Se tiver classe específica para ritmos, vai pra ritmos
      if (btn.classList.contains('btn-back-to-ritmos')) {
        window.location.href = 'ritmos.html';
      } else {
        window.history.back();
      }
    });
  });

  /* ── Protótipo: Ritmos Animation e Navegação ── */
  const ritmoCards = document.querySelectorAll('.ritmo-card');
  ritmoCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      // Remove a classe caso o usuário clique muito rápido
      card.classList.remove('card-clicked');
      // Força um reflow para reiniciar a animação
      void card.offsetWidth;
      card.classList.add('card-clicked');

      setTimeout(() => {
        card.classList.remove('card-clicked');
        const href = card.getAttribute('href');
        if (href && href !== '#') {
          window.location.href = href;
        }
      }, 400); // 400ms is the animation duration
    });
  });

  /* ── Protótipo: Botão Continuar Jornada (Recompensa) ── */
  const btnContinuarJornada = document.querySelector('.btn-continuar-jornada');
  if (btnContinuarJornada) {
    btnContinuarJornada.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'trilha.html';
    });
  }

  /* ── Protótipo: Botão Continuar Final (Recompensa Final) ── */
  const btnContinuarFinal = document.querySelector('.btn-continuar-final');
  if (btnContinuarFinal) {
    btnContinuarFinal.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'ritmos.html';
    });
  }

  /* ── Protótipo: Tela de Dança (Modal de Saída) ── */
  const btnDancaBack = document.querySelector('.btn-danca-back');
  const exitModal = document.getElementById('exitModal');
  const btnModalNo = document.querySelector('.modal-btn-no');

  if (btnDancaBack && exitModal) {
    btnDancaBack.addEventListener('click', () => {
      exitModal.classList.add('active');
    });
  }

  if (btnModalNo && exitModal) {
    btnModalNo.addEventListener('click', () => {
      exitModal.classList.remove('active');
    });
  }

}

/* ================================================================
   CARREGAR DADOS DO USUÁRIO (APELIDO E PERSONAGEM)
   ================================================================ */

function loadUserData() {
  const apelido = localStorage.getItem('ginga_apelido');
  let personagem = localStorage.getItem('ginga_personagem');

  // Se não tem personagem salvo, usa o padrão do Boi
  if (!personagem) {
    personagem = 'IMG/BOI DANÇANDO.png';
  }

  // 1. Atualizar Apelido (Tela de Perfil)
  const profileName = document.querySelector('.profile-name');
  if (profileName && apelido) {
    profileName.textContent = apelido.toUpperCase();
  }

  // 2. Atualizar Personagem (Avatares e Perfil)
  const allChars = document.querySelectorAll('.user-avatar, .user-avatar-wrap img, .main-avatar-img, .ritmos-hero-img, .aprender-char-img, .sobre-char-img');
  
  allChars.forEach(img => {
    // Ignorar a nota musical que tem class user-avatar-wrap img mas não é avatar
    if (img.src.includes('NOTA%20MUSICAL')) return;

    img.src = personagem;
    
    // Evita FOUT (Flash of Unstyled Image) / flicker
    if (img.complete) {
      img.classList.add('avatar-loaded');
    } else {
      img.onload = () => img.classList.add('avatar-loaded');
    }
  });

  // 3. Atualizar Mensagem na tela Aprender
  const aprenderChatBubble = document.querySelector('.aprender-main .chat-bubble');
  if (aprenderChatBubble) {
    let charName = "Bumbá";
    const personUppercase = personagem.toUpperCase();
    if (personUppercase.includes('HIPHOP') || personUppercase.includes('HIP-HOP')) {
      charName = "Rima";
    } else if (personUppercase.includes('CAVALO') || personUppercase.includes('GAUCHA')) {
      charName = "Pingo";
    } else if (personUppercase.includes('AFRO')) {
      charName = "Batuque";
    }
    aprenderChatBubble.textContent = `Oi! Sou o ${charName}. Vamos descobrir as danças que contam a história do nosso Brasil?`;
  }
}

function updateProfileStats() {
  const rhythms = ['quadrilha', 'hiphop', 'gaucha', 'afro'];
  let totalTrophies = 0;
  let modulesCompleted = 0;

  rhythms.forEach(r => {
    const progress = parseInt(sessionStorage.getItem(`ginga_${r}_progress`)) || 1;
    // Nodes are 1-24. Milestones/Stars at 4, 8, 12, 16, 20. Trophy at 24.
    if (progress > 4) totalTrophies++;
    if (progress > 8) totalTrophies++;
    if (progress > 12) totalTrophies++;
    if (progress > 16) totalTrophies++;
    if (progress > 20) totalTrophies++;
    if (progress > 24) {
      totalTrophies++;
      modulesCompleted++;
    }
  });

  const trophiesCountEl = document.getElementById('profile-trophies-count');
  const trophiesBarEl = document.getElementById('profile-trophies-bar');
  if (trophiesCountEl) trophiesCountEl.innerHTML = `${totalTrophies} <small>DE 24</small>`;
  if (trophiesBarEl) trophiesBarEl.style.width = `${(totalTrophies / 24) * 100}%`;

  const modulesCountEl = document.getElementById('profile-modules-count');
  const modulesBarEl = document.getElementById('profile-modules-bar');
  if (modulesCountEl) modulesCountEl.innerHTML = `${modulesCompleted} <small>DE 4</small>`;
  if (modulesBarEl) modulesBarEl.style.width = `${(modulesCompleted / 4) * 100}%`;
}

function updateStreak() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalized to midnight

  const lastLoginStr = localStorage.getItem('ginga_last_login');
  let streak = parseInt(localStorage.getItem('ginga_streak')) || 0;

  if (lastLoginStr) {
    const lastLogin = new Date(lastLoginStr);
    lastLogin.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - lastLogin);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays === 1) {
      // Logged in on consecutive day
      streak++;
      localStorage.setItem('ginga_last_login', today.toISOString());
      localStorage.setItem('ginga_streak', streak);
    } else if (diffDays > 1) {
      // Missed a day or more, reset streak
      streak = 1;
      localStorage.setItem('ginga_last_login', today.toISOString());
      localStorage.setItem('ginga_streak', streak);
    }
    // If diffDays === 0, user logged in again on the same day. Do nothing.
  } else {
    // First time logging in ever
    streak = 1;
    localStorage.setItem('ginga_last_login', today.toISOString());
    localStorage.setItem('ginga_streak', streak);
  }

  // Update UI if on profile page
  const streakCountEl = document.getElementById('profile-streak-count');
  if (streakCountEl) {
    streakCountEl.textContent = `${streak} ${streak === 1 ? 'dia' : 'dias'}`;
  }
}

/* ================================================================
   SISTEMA DE PROGRESSÃO DA TRILHA
   ================================================================ */

function initProgression() {
  const trilhaContainer = document.querySelector('.nodes-list');
  // Se estamos na tela de trilha, renderizamos os nós dinamicamente
  if (trilhaContainer && window.location.pathname.includes('trilha')) {
    renderTrilha(trilhaContainer);
  }

  // Finaliza o nível ao sair da tela de dança (simulação do vídeo completo)
  // Em danca.html, o botão é um <a>. Em trilha.html, é um <button id="btnVideoYes">.
  // Só queremos completar o nível automaticamente na tela danca.html (onde não tem vídeo real).
  const btnModalYes = document.querySelector('.modal-btn-yes');
  if (btnModalYes && window.location.pathname.includes('danca.html')) {
    btnModalYes.addEventListener('click', () => {
      completeCurrentLevel();
    });

    // Popula o indicador de dificuldade na tela danca.html
    const dancaDiffEl = document.getElementById('dancaDiffIndicator');
    const currentLevel = parseInt(sessionStorage.getItem('ginga_current_playing_level')) || 1;
    const dancaPhase = (currentLevel - 1) % 4; // 0=fácil, 1=intermediário, 2=difícil
    const dNames = ['NÍVEL FÁCIL', 'NÍVEL INTERMEDIÁRIO', 'NÍVEL DIFÍCIL'];
    const dClasses = ['dot-easy', 'dot-medium', 'dot-hard'];
    if (dancaDiffEl && dancaPhase < 3) {
      const dotsH = dClasses.map((cls, i) => {
        const st = i === dancaPhase ? 'active' : 'inactive';
        return `<span class="difficulty-dot ${cls} ${st}"></span>`;
      }).join('');
      dancaDiffEl.innerHTML = `
        <div class="difficulty-dots">${dotsH}</div>
        <span class="difficulty-label">${dNames[dancaPhase]}</span>
      `;
    }
  }

  // Finaliza a recompensa e libera próximo nível ao clicar em Continuar Jornada
  const btnContinuarJornada = document.querySelector('.btn-continuar-jornada');
  if (btnContinuarJornada) {
    btnContinuarJornada.addEventListener('click', () => {
      completeCurrentLevel();
    });
  }

  // Lógica do Modal de Vídeo e Saída
  const closeVideo = document.getElementById('closeVideoModal');
  const videoExitModal = document.getElementById('videoExitModal');
  const btnVideoNo = document.getElementById('btnVideoNo');
  const btnVideoYes = document.getElementById('btnVideoYes');

  if (closeVideo && videoExitModal) {
    closeVideo.addEventListener('click', () => {
      try {
        if (globalYTPlayer && globalYTPlayer.pauseVideo) globalYTPlayer.pauseVideo();
      } catch (e) {
        console.log("Erro ao pausar video", e);
      }
      videoExitModal.classList.add('active');
    });
  }

  if (btnVideoNo && videoExitModal) {
    btnVideoNo.addEventListener('click', () => {
      videoExitModal.classList.remove('active');
      if (globalYTPlayer && globalYTPlayer.playVideo) globalYTPlayer.playVideo();
    });
  }

  if (btnVideoYes && videoExitModal) {
    btnVideoYes.addEventListener('click', () => {
      videoExitModal.classList.remove('active');
      const mainVideoModal = document.getElementById('videoModal');
      if (globalYTPlayer && globalYTPlayer.stopVideo) globalYTPlayer.stopVideo();
      if (mainVideoModal) mainVideoModal.classList.remove('active');
    });
  }
}

window.openVideoModal = function(levelId) {
  const modal = document.getElementById('videoModal');
  const playerDiv = document.getElementById('youtubePlayer');

  if (!modal || !playerDiv) return;

  currentPlayingLevelId = levelId;
  saveCurrentLevel(levelId);

  // ── Indicador de Dificuldade ──
  const videoContainer = modal.querySelector('.video-modal-container');
  let diffIndicator = videoContainer.querySelector('.difficulty-indicator');
  if (diffIndicator) diffIndicator.remove();

  const phase = (levelId - 1) % 4;
  const difficultyNames = ['NÍVEL FÁCIL', 'NÍVEL INTERMEDIÁRIO', 'NÍVEL DIFÍCIL'];
  const difficultyClasses = ['dot-easy', 'dot-medium', 'dot-hard'];
  if (phase < 3) {
    const activeName = difficultyNames[phase];
    const dotsHTML = difficultyClasses.map((cls, i) => {
      const stateClass = i === phase ? 'active' : 'inactive';
      return `<span class="difficulty-dot ${cls} ${stateClass}"></span>`;
    }).join('');

    diffIndicator = document.createElement('div');
    diffIndicator.className = 'difficulty-indicator';
    diffIndicator.innerHTML = `
      <div class="difficulty-dots">${dotsHTML}</div>
      <span class="difficulty-label">${activeName}</span>
    `;
    videoContainer.appendChild(diffIndicator);
  }

  // ── Determina o ID do YouTube ──
  const role = sessionStorage.getItem('ginga_dance_role') || 'cavalheiro';
  let seriesNum = Math.floor((levelId - 1) / 4) + 1;
  const letters = ['A', 'B', 'C'];
  const letter = letters[phase] || 'A';

  let videoId = '';
  if (levelId === 24) {
    videoId = YOUTUBE_MAP['coreografia'] || '';
  } else {
    const roleKey = role === 'casal' ? 'casal' : (role === 'dama' ? 'dama' : 'cavalheiro');
    const key = `${seriesNum}_${roleKey}_${letter}`;
    videoId = YOUTUBE_MAP[key] || '';
  }

  // Abre o modal
  modal.classList.add('active');

  if (!videoId) {
    playerDiv.innerHTML = `<div style="color:white;display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:12px;">
      <span style="font-size:48px;">🎬</span>
      <p style="font-family:sans-serif;text-align:center;padding:16px;">Vídeo ainda não disponível para esta fase.<br>Em breve!</p>
    </div>`;
    return;
  }

  // Carrega ou inicializa o player do YouTube
  if (globalYTPlayer && globalYTPlayer.loadVideoById) {
    globalYTPlayer.loadVideoById({ videoId: videoId, startSeconds: 0 });
  } else {
    // Player ainda não inicializado – cria agora
    globalYTPlayer = new YT.Player('youtubePlayer', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        'autoplay': 1,
        'controls': 1,
        'rel': 0,
        'modestbranding': 1,
        'playsinline': 1
      },
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  }
};

function renderTrilha(container) {
  // Define o ritmo atual baseado na URL
  let currentPath = window.location.pathname;
  let rhythm = 'quadrilha';
  if (currentPath.includes('hiphop')) rhythm = 'hiphop';
  else if (currentPath.includes('gaucha')) rhythm = 'gaucha';
  else if (currentPath.includes('afro')) rhythm = 'afro';
  
  sessionStorage.setItem('ginga_current_rhythm', rhythm);
  let progressKey = `ginga_${rhythm}_progress`;

  // Utilizando sessionStorage para não persistir o progresso ao fechar o app durante a fase de testes
  let progress = parseInt(sessionStorage.getItem(progressKey));
  if (isNaN(progress)) {
    progress = 1;
    sessionStorage.setItem(progressKey, 1);
  }

  const nodes = [
    { id: 1, type: 'regular', title: '', transform: 'translateX(25px)', marginTop: '0' },
    { id: 2, type: 'regular', title: '', transform: 'translateX(-35px)', marginTop: '60px' },
    { id: 3, type: 'regular', title: '', transform: 'translateX(15px)', marginTop: '60px' },
    { id: 4, type: 'milestone', title: 'O BAILÃO', transform: 'translateX(-15px)', marginTop: '70px', color: 'yellow', icon: 'estrela amarela.png', link: 'recompensa.html' },
    { id: 5, type: 'regular', title: '', transform: 'translateX(40px)', marginTop: '80px' },
    { id: 6, type: 'regular', title: '', transform: 'translateX(-40px)', marginTop: '80px' },
    { id: 7, type: 'regular', title: '', transform: 'translateX(25px)', marginTop: '80px' },
    { id: 8, type: 'milestone', title: 'DA ROÇA', transform: 'translateX(5px)', marginTop: '80px', color: 'orange', icon: 'estrela laranja.png', link: 'recompensa.html' },
    { id: 9, type: 'regular', title: '', transform: 'translateX(40px)', marginTop: '80px' },
    { id: 10, type: 'regular', title: '', transform: 'translateX(-35px)', marginTop: '80px' },
    { id: 11, type: 'regular', title: '', transform: 'translateX(30px)', marginTop: '80px' },
    { id: 12, type: 'milestone', title: 'ARRAIÁ', transform: 'translateX(-10px)', marginTop: '80px', color: 'red', icon: 'estrela vermelha.png', link: 'recompensa.html' },
    { id: 13, type: 'regular', title: '', transform: 'translateX(25px)', marginTop: '80px' },
    { id: 14, type: 'regular', title: '', transform: 'translateX(-25px)', marginTop: '80px' },
    { id: 15, type: 'regular', title: '', transform: 'translateX(35px)', marginTop: '80px' },
    { id: 16, type: 'milestone', title: 'FESTANÇA', transform: 'translateX(-15px)', marginTop: '80px', color: 'yellow', icon: 'estrela amarela.png', link: 'recompensa.html' },
    { id: 17, type: 'regular', title: '', transform: 'translateX(30px)', marginTop: '80px' },
    { id: 18, type: 'regular', title: '', transform: 'translateX(-30px)', marginTop: '80px' },
    { id: 19, type: 'regular', title: '', transform: 'translateX(20px)', marginTop: '80px' },
    { id: 20, type: 'milestone', title: 'QUADRILHÃO', transform: 'translateX(-5px)', marginTop: '80px', color: 'orange', icon: 'estrela laranja.png', link: 'recompensa.html' },
    { id: 21, type: 'regular', title: '', transform: 'translateX(35px)', marginTop: '80px' },
    { id: 22, type: 'regular', title: '', transform: 'translateX(-40px)', marginTop: '80px' },
    { id: 23, type: 'regular', title: '', transform: 'translateX(25px)', marginTop: '80px' },
    { id: 24, type: 'final', title: 'CONQUISTA FINAL', transform: 'translateX(0px)', marginTop: '80px', color: 'dark-red', icon: 'troféu.png', link: 'recompensa-final.html' }
  ];

  let html = '';

  nodes.forEach(node => {
    const isCompleted = node.id < progress;
    const isActive = node.id === progress;
    const isLocked = node.id > progress;

    let nodeHtml = '';
    const styleStr = `transform: ${node.transform}; margin-top: ${node.marginTop};`;

    let customStyle = '';
    let checkmarkColor = '#D38A4F';
    let currentActiveIcon = 'icone bandeira.png';
    let currentMilestoneIcon = node.icon;
    
    if (rhythm === 'quadrilha') {
      // Cores da quadrilha: amarelo → laranja → vermelho, ciclo de 3 fases (bandeirinhas juninas)
      let phaseColor = '';
      // Grupo 1 (1-4): Amarelo | Grupo 2 (5-8): Laranja | Grupo 3 (9-12): Vermelho
      // Grupo 4 (13-16): Amarelo | Grupo 5 (17-20): Laranja | Grupo 6 (21-24): Vermelho
      if (node.id <= 4 || (node.id > 12 && node.id <= 16)) {
        phaseColor = '#F0C030'; // Amarelo quadrilha
        currentActiveIcon = 'icone bandeira.png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela amarela.png';
      } else if (node.id <= 8 || (node.id > 16 && node.id <= 20)) {
        phaseColor = '#E88A4A'; // Laranja quadrilha
        currentActiveIcon = 'icone bandeira laranja.png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela laranja.png';
      } else {
        phaseColor = '#B52026'; // Vermelho quadrilha
        currentActiveIcon = 'icone bandeira vermelha.png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela vermelha.png';
        if (node.type === 'final') currentMilestoneIcon = 'troféu.png';
      }
      
      if (isCompleted) {
        customStyle = `border-color: ${phaseColor} !important; background-color: #FFF !important;`;
        checkmarkColor = phaseColor;
      } else if (isActive) {
        customStyle = `background-color: ${phaseColor} !important; border-color: #FFF !important; box-shadow: 0 4px 15px ${phaseColor}80 !important;`;
      }
      
      if (node.type === 'milestone' || node.type === 'final') {
        if (!isLocked) {
          customStyle = `background-color: ${phaseColor} !important; opacity: 1 !important;`;
        } else {
          customStyle = `background-color: ${phaseColor} !important; opacity: 0.6 !important;`; 
        }
      }
    } else if (rhythm === 'hiphop') {
      let phaseColor = '';
      if (node.id <= 4 || (node.id > 12 && node.id <= 16)) {
        phaseColor = '#007200';
        currentActiveIcon = 'bandeira verde hiphhop.png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela verde hiphop.png';
      } else if (node.id <= 8 || (node.id > 16 && node.id <= 20)) {
        phaseColor = '#FAA307';
        currentActiveIcon = 'bandeira amarela hiphop.png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela amarela hiphop.png';
      } else {
        phaseColor = '#9D0208';
        currentActiveIcon = 'bandeira hiphop.png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela hiphop.png';
        if (node.type === 'final') currentMilestoneIcon = 'troféu.png';
      }
      
      if (isCompleted) {
        customStyle = `border-color: ${phaseColor} !important; background-color: #FFF !important;`;
        checkmarkColor = phaseColor;
      } else if (isActive) {
        customStyle = `background-color: ${phaseColor} !important; border-color: #FFF !important; box-shadow: 0 4px 15px ${phaseColor}80 !important;`;
      }
      // Se isLocked, customStyle fica vazio para manter o padrão cinza do .node-locked
      
      if (node.type === 'milestone' || node.type === 'final') {
        if (!isLocked) {
          customStyle = `background-color: ${phaseColor} !important; opacity: 1 !important;`;
        } else {
          customStyle = `background-color: ${phaseColor} !important; opacity: 0.6 !important;`; 
        }
      }
    } else if (rhythm === 'gaucha') {
      let phaseColor = '';
      if (node.id <= 4 || (node.id > 12 && node.id <= 16)) {
        phaseColor = '#905225';
        currentActiveIcon = 'bandeira marrom gaucha .png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela marrom gaucha.png';
      } else if (node.id <= 8 || (node.id > 16 && node.id <= 20)) {
        phaseColor = '#F6A310';
        currentActiveIcon = 'bandeira amarela gaucha.png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela amarela gaucha.png';
      } else {
        phaseColor = '#4F772D';
        currentActiveIcon = 'bandeira verde gaúcha.png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela verde gaucha.png';
        if (node.type === 'final') currentMilestoneIcon = 'troféu.png';
      }
      
      if (isCompleted) {
        customStyle = `border-color: ${phaseColor} !important; background-color: #FFF !important;`;
        checkmarkColor = phaseColor;
      } else if (isActive) {
        customStyle = `background-color: ${phaseColor} !important; border-color: #FFF !important; box-shadow: 0 4px 15px ${phaseColor}80 !important;`;
      }
      
      if (node.type === 'milestone' || node.type === 'final') {
        if (!isLocked) {
          customStyle = `background-color: ${phaseColor} !important; opacity: 1 !important;`;
        } else {
          customStyle = `background-color: ${phaseColor} !important; opacity: 0.6 !important;`; 
        }
      }
    } else if (rhythm === 'afro') {
      let phaseColor = '';
      if (node.id <= 4 || (node.id > 12 && node.id <= 16)) {
        phaseColor = '#00A9A9';
        currentActiveIcon = 'baneira azul afro.png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela azul afro.png';
      } else if (node.id <= 8 || (node.id > 16 && node.id <= 20)) {
        phaseColor = '#F7C022';
        currentActiveIcon = 'bandeira amarela afro.png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela amarela afro.png';
      } else {
        phaseColor = '#9D0208';
        currentActiveIcon = 'bandeira vermelha afro.png';
        if (node.type === 'milestone') currentMilestoneIcon = 'estrela vermelha afro.png';
        if (node.type === 'final') currentMilestoneIcon = 'troféu.png';
      }
      
      if (isCompleted) {
        customStyle = `border-color: ${phaseColor} !important; background-color: #FFF !important;`;
        checkmarkColor = phaseColor;
      } else if (isActive) {
        customStyle = `background-color: ${phaseColor} !important; border-color: #FFF !important; box-shadow: 0 4px 15px ${phaseColor}80 !important;`;
      }
      
      if (node.type === 'milestone' || node.type === 'final') {
        if (!isLocked) {
          customStyle = `background-color: ${phaseColor} !important; opacity: 1 !important;`;
        } else {
          customStyle = `background-color: ${phaseColor} !important; opacity: 0.6 !important;`; 
        }
      }
    }

    if (node.type === 'regular') {
      if (isCompleted) {
        nodeHtml = `
          <div class="node-wrapper" style="${styleStr}">
            <a href="#" onclick="event.preventDefault(); openRoleModal(${node.id})" class="node node-completed shadow-pulse" style="text-decoration: none; display: flex; ${customStyle}">
              <svg viewBox="0 0 24 24" fill="none" stroke="${checkmarkColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </a>
            ${node.title ? `<div class="node-label label-white">${node.title}</div>` : ''}
          </div>
        `;
      } else if (isActive) {
        nodeHtml = `
          <div class="node-wrapper" style="${styleStr}">
            <a href="#" onclick="event.preventDefault(); openRoleModal(${node.id})" class="node node-active anim-pulse-fast" style="text-decoration: none; display: flex; ${customStyle}">
              <img src="IMG/${currentActiveIcon}" alt="Bandeira" class="node-img-icon" />
              <svg class="progress-ring" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#FFF" stroke-width="6" stroke-dasharray="200" stroke-dashoffset="200" />
              </svg>
            </a>
            ${node.title ? `<div class="node-label label-yellow">${node.title}</div>` : ''}
          </div>
        `;
      } else {
        nodeHtml = `
          <div class="node-wrapper" style="${styleStr}">
            <div class="node node-locked" style="${customStyle}">
              <img src="IMG/icone%20cadeado.png" alt="Cadeado" class="node-img-icon" />
            </div>
            ${node.title ? `<div class="node-label label-white" style="opacity:0.6;">${node.title}</div>` : ''}
          </div>
        `;
      }
    } else if (node.type === 'milestone' || node.type === 'final') {
      const isFinal = node.type === 'final';
      const nodeClass = isFinal ? 'node-final bg-dark-red shadow-pulse-large anim-pulse-slow' : `node-milestone bg-${node.color} anim-float-slow`;
      const labelClass = isFinal ? 'label-dark-brown' : `label-${node.color}`;
      const imgClass = isFinal ? 'node-img-icon-large' : 'node-img-icon';

      if (isLocked) {
        nodeHtml = `
          <div class="node-wrapper" style="${styleStr}">
            <div class="node ${isFinal ? 'node-final bg-dark-red' : `node-milestone bg-${node.color}`}" style="display: flex; cursor: not-allowed; ${customStyle}">
              <img src="IMG/${currentMilestoneIcon}" alt="${node.title}" class="${imgClass}" />
            </div>
            <div class="node-label ${labelClass}">${node.title}</div>
          </div>
        `;
      } else {
        if (isFinal) {
          nodeHtml = `
            <div class="node-wrapper" style="${styleStr}">
              <a href="#" class="node ${nodeClass}" style="text-decoration: none; display: flex; ${customStyle}" onclick="event.preventDefault(); openVideoModal(${node.id})">
                <img src="IMG/${currentMilestoneIcon}" alt="${node.title}" class="${imgClass}" />
              </a>
              <div class="node-label ${labelClass}">${node.title}</div>
            </div>
          `;
        } else {
          nodeHtml = `
            <div class="node-wrapper" style="${styleStr}">
              <a href="${node.link}" class="node ${nodeClass}" style="text-decoration: none; display: flex; ${customStyle}" onclick="saveCurrentLevel(${node.id})">
                <img src="IMG/${currentMilestoneIcon}" alt="${node.title}" class="${imgClass}" />
              </a>
              <div class="node-label ${labelClass}">${node.title}</div>
            </div>
          `;
        }
      }
    }

    html += nodeHtml;
  });

  container.innerHTML = html;
}

window.saveCurrentLevel = function (levelId) {
  sessionStorage.setItem('ginga_current_playing_level', levelId);
};

window.completeCurrentLevel = function () {
  const current = parseInt(sessionStorage.getItem('ginga_current_playing_level'));
  const rhythm = sessionStorage.getItem('ginga_current_rhythm') || 'quadrilha';
  const progressKey = `ginga_${rhythm}_progress`;
  const progress = parseInt(sessionStorage.getItem(progressKey)) || 1;

  if (current === progress) {
    sessionStorage.setItem(progressKey, progress + 1);
    if (window.supabaseAPI) {
      window.supabaseAPI.saveProgressToCloud({ [`${rhythm}_progress`]: progress + 1 });
    }
  }
};

/* ================================================================
   MODAL DE ESCOLHA DE PAPEL (DAMA / CAVALHEIRO / CASAL)
   ================================================================ */

function initRoleModal() {
  const roleModalHTML = `
    <div class="role-modal-overlay" id="roleModal">
      <div class="role-modal-container">
        <button class="role-modal-close" id="closeRoleModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        
        <div class="role-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C9.8 2 8 3.8 8 6s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"/><path d="M6 22l2-8 4 3 4-3 2 8"/><path d="M9 14l-3-2"/><path d="M15 14l3-2"/></svg>
        </div>
        
        <h2 class="font-bebas role-modal-title">COMO QUER DANÇAR?</h2>
        <p class="role-modal-subtitle">Escolha seu papel para esta aula</p>
        
        <div class="role-modal-buttons">
          <button class="btn-role btn-role-dama" data-role="dama">
            <div class="btn-role-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="3"/><path d="M12 7v3"/><path d="M7 21l5-11 5 11"/><path d="M9 11h6"/></svg>
            </div>
            <div class="btn-role-info">
              <span class="btn-role-label">DAMA</span>
              <span class="btn-role-desc">Aprenda os passos femininos</span>
            </div>
          </button>
          
          <button class="btn-role btn-role-cavalheiro" data-role="cavalheiro">
            <div class="btn-role-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="3"/><path d="M12 7v7"/><path d="M8 11h8"/><path d="M10 22l2-8 2 8"/></svg>
            </div>
            <div class="btn-role-info">
              <span class="btn-role-label">CAVALHEIRO</span>
              <span class="btn-role-desc">Aprenda os passos masculinos</span>
            </div>
          </button>
          
          <button class="btn-role btn-role-casal" data-role="casal">
            <div class="btn-role-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="4" r="2.5"/><path d="M8 7v3"/><path d="M5 19l3-9 3 9"/><circle cx="16" cy="4" r="2.5"/><path d="M16 7v5"/><path d="M13 22l3-10 3 10"/></svg>
            </div>
            <div class="btn-role-info">
              <span class="btn-role-label">CASAL</span>
              <span class="btn-role-desc">Veja a coreografia completa</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', roleModalHTML);

  const modal = document.getElementById('roleModal');
  const btnClose = document.getElementById('closeRoleModal');

  // Fechar modal
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  // Fechar ao clicar no overlay
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  // Clique nos botões de papel
  document.querySelectorAll('.btn-role').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      sessionStorage.setItem('ginga_dance_role', role);
      modal.classList.remove('active');

      const levelId = parseInt(modal.dataset.levelId);
      const rhythm = sessionStorage.getItem('ginga_current_rhythm') || 'quadrilha';

      // Para a trilha quadrilha que tem videoModal embutido
      if (rhythm === 'quadrilha' && document.getElementById('videoModal')) {
        openVideoModal(levelId);
      } else {
        // Para as outras trilhas que vão para danca.html
        saveCurrentLevel(levelId);
        window.location.href = 'danca.html';
      }
    });
  });
}

window.openRoleModal = function(levelId) {
  const currentPath = window.location.pathname;
  let rhythm = 'quadrilha';
  if (currentPath.includes('hiphop')) rhythm = 'hiphop';
  else if (currentPath.includes('gaucha')) rhythm = 'gaucha';
  else if (currentPath.includes('afro')) rhythm = 'afro';

  if (['hiphop', 'gaucha', 'afro'].includes(rhythm)) {
    let constModal = document.getElementById('constructionModal');
    if (!constModal) {
      const html = `
        <div class="role-modal-overlay" id="constructionModal" style="display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition: opacity 0.3s ease; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 9999;">
          <div class="role-modal-container" style="background: var(--bg-main, #FDFBF4); border-radius: 20px; padding: 30px; max-width: 90%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="background-color: var(--clr-red-light, #F6EDE8); color: var(--clr-red, #B52026); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto;">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h2 class="font-bebas" style="color: var(--clr-red, #B52026); font-size: 28px; margin-bottom: 15px; letter-spacing: 1px;">Em Breve!</h2>
            <p style="font-family: var(--font-ui, 'Montserrat', sans-serif); font-size: 14px; color: #4A4A4A; line-height: 1.5; margin-bottom: 25px; font-weight: 500;">
              Ops! Parece que o grupo ainda está se organizando.<br><br>
              Esta seção ainda não entrou em cena, mas chegará em uma futura atualização.<br><br>
              Que tal explorar outras partes do aplicativo enquanto isso?
            </p>
            <a href="ritmos.html" class="btn btn-primary" style="text-decoration: none; margin: 0 auto; display: inline-flex;">VOLTAR AOS RITMOS</a>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
      constModal = document.getElementById('constructionModal');
    }
    // Timeout para permitir que o DOM atualize antes da transição de opacidade
    setTimeout(() => {
      constModal.style.opacity = '1';
      constModal.style.pointerEvents = 'auto';
    }, 10);
    return;
  }

  const modal = document.getElementById('roleModal');
  if (!modal) return;
  modal.dataset.levelId = levelId;
  modal.classList.add('active');
};

function initSuccessModal() {
  const successModalHTML = `
    <div class="modal-overlay" id="successModal" style="z-index: 10000;">
      <div class="modal-content" style="text-align: center;">
        <div style="background-color: #fceceb; color: #D32F2F; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto;">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h2 class="font-bebas" style="margin-bottom: 10px;">Fase Concluída!</h2>
        <p style="margin-bottom: 20px;">Você completou o passo com sucesso. Continue assim!</p>
        <button class="btn btn-primary-red" id="btnSuccessClose" style="width: 100%;">CONTINUAR</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', successModalHTML);

  const modal = document.getElementById('successModal');
  const btnClose = document.getElementById('btnSuccessClose');

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
}

/* ================================================================
   SISTEMA DE CONQUISTAS
   ================================================================ */

const ACHIEVEMENTS = [
  {
    id: 'primeiro_passo',
    title: 'Primeiro Passo',
    description: 'Complete sua primeira dança',
    icon: '<svg viewBox="0 0 24 24" fill="white"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
    gradient: 'bg-gold-gradient'
  },
  {
    id: 'energia_pura',
    title: 'Energia Pura',
    description: 'Complete 5 danças',
    icon: '<svg viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9v8l10-12h-9l1-8z"/></svg>',
    gradient: 'bg-red-gradient'
  },
  {
    id: 'mestre_samba',
    title: 'Mestre do Samba',
    description: 'Complete 10 danças',
    icon: '<svg viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="0.5"><path d="M9 18a3 3 0 1 1-6 0c0-1.66 1.34-3 3-3s3 1.34 3 3z"/><path d="M21 6a3 3 0 1 1-6 0c0-1.66 1.34-3 3-3s3 1.34 3 3z"/><path d="M9 15V3h12v12" fill="none" stroke="white" stroke-width="2"/></svg>',
    gradient: 'bg-gold-gradient'
  },
  {
    id: 'gingado_ouro',
    title: 'Gingado de Ouro',
    description: 'Desbloqueie uma estrela',
    icon: '<svg viewBox="0 0 24 24" fill="white"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
    gradient: 'bg-red-gradient'
  },
  {
    id: 'ritmo_total',
    title: 'Ritmo Total',
    description: 'Complete 2 trilhas diferentes',
    icon: '<svg viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    gradient: 'bg-gold-gradient'
  },
  {
    id: 'lenda_pista',
    title: 'Lenda da Pista',
    description: 'Complete uma trilha inteira',
    icon: '<svg viewBox="0 0 24 24" fill="white"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34c0-.28-.11-.54-.3-.73L12 12.6l-1.7.93c-.19.19-.3.45-.3.73z" fill="none" stroke="white" stroke-width="2"/><circle cx="12" cy="8" r="3" fill="none" stroke="white" stroke-width="2"/></svg>',
    gradient: 'bg-red-gradient'
  },
  {
    id: 'rei_quadrilha',
    title: 'Rei da Quadrilha',
    description: 'Complete a Trilha Quadrilha',
    icon: '<svg viewBox="0 0 24 24" fill="white"><path d="M3 17l4-8 4 4 4-6 6 10H3z"/><path d="M12 2l1.5 3.5L17 7l-3.5 1.5L12 12l-1.5-3.5L7 7l3.5-1.5L12 2z"/></svg>',
    gradient: 'bg-gold-gradient'
  },
  {
    id: 'mestre_hiphop',
    title: 'Mestre do Hip Hop',
    description: 'Complete a Trilha Hip Hop',
    icon: '<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="5" r="3"/><path d="M12 8v4"/><path d="M8 12h8"/><path d="M7 22l5-10 5 10"/><path d="M4 15h4M16 15h4" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
    gradient: 'bg-green-gradient'
  },
  {
    id: 'gaucho_ouro',
    title: 'Gaúcho de Ouro',
    description: 'Complete a Trilha Gaúcha',
    icon: '<svg viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6l1.5 3 3.5.5-2.5 2.5.5 3.5L12 14l-3 1.5.5-3.5L7 9.5 10.5 9 12 6z" fill="none" stroke="#905225" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    gradient: 'bg-brown-gradient'
  },
  {
    id: 'ritmo_afro',
    title: 'Ritmo Afro',
    description: 'Complete a Trilha Afro',
    icon: '<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20" fill="#00A9A9"/><circle cx="12" cy="8" r="2" fill="none" stroke="#FFF" stroke-width="1.5"/><path d="M8 14c0 2.2 1.8 4 4 4s4-1.8 4-4" fill="none" stroke="#FFF" stroke-width="1.5" stroke-linecap="round"/></svg>',
    gradient: 'bg-teal-gradient'
  }
];

function getUnlockedAchievements() {
  try {
    return JSON.parse(localStorage.getItem('ginga_achievements') || '[]');
  } catch (e) {
    return [];
  }
}

function unlockAchievement(id) {
  const unlocked = getUnlockedAchievements();
  if (unlocked.includes(id)) return false; // já desbloqueada
  unlocked.push(id);
  localStorage.setItem('ginga_achievements', JSON.stringify(unlocked));
  if (window.supabaseAPI) {
    window.supabaseAPI.saveProgressToCloud({ achievements_unlocked: unlocked });
  }
  return true; // nova conquista!
}

function checkAchievements() {
  // Conta total de danças completadas em todas as trilhas
  let totalCompleted = 0;
  const rhythms = ['quadrilha', 'hiphop', 'gaucha', 'afro'];
  let trilhasComProgresso = 0;
  let trilhaCompleta = false;
  const trilhasCompletas = { quadrilha: false, hiphop: false, gaucha: false, afro: false };

  rhythms.forEach(r => {
    const progress = parseInt(sessionStorage.getItem(`ginga_${r}_progress`)) || 1;
    const completedInRhythm = progress - 1; // progress=1 means 0 completed
    totalCompleted += completedInRhythm;
    if (completedInRhythm >= 1) trilhasComProgresso++;
    if (progress > 24) {
      trilhaCompleta = true;
      trilhasCompletas[r] = true;
    }
  });

  const newlyUnlocked = [];

  // Primeiro Passo: completar 1 dança
  if (totalCompleted >= 1 && unlockAchievement('primeiro_passo')) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'primeiro_passo'));
  }

  // Energia Pura: completar 5 danças
  if (totalCompleted >= 5 && unlockAchievement('energia_pura')) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'energia_pura'));
  }

  // Mestre do Samba: completar 10 danças
  if (totalCompleted >= 10 && unlockAchievement('mestre_samba')) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'mestre_samba'));
  }

  // Gingado de Ouro: desbloquear uma estrela (progress >= 5 em qualquer ritmo, pois nó 4 é estrela)
  const hasReachedStar = rhythms.some(r => {
    const p = parseInt(sessionStorage.getItem(`ginga_${r}_progress`)) || 1;
    return p > 4;
  });
  if (hasReachedStar && unlockAchievement('gingado_ouro')) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'gingado_ouro'));
  }

  // Ritmo Total: progresso em 2+ trilhas
  if (trilhasComProgresso >= 2 && unlockAchievement('ritmo_total')) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'ritmo_total'));
  }

  // Lenda da Pista: completar uma trilha inteira
  if (trilhaCompleta && unlockAchievement('lenda_pista')) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'lenda_pista'));
  }

  // Conquistas específicas de cada trilha
  if (trilhasCompletas.quadrilha && unlockAchievement('rei_quadrilha')) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'rei_quadrilha'));
  }
  if (trilhasCompletas.hiphop && unlockAchievement('mestre_hiphop')) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'mestre_hiphop'));
  }
  if (trilhasCompletas.gaucha && unlockAchievement('gaucho_ouro')) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'gaucho_ouro'));
  }
  if (trilhasCompletas.afro && unlockAchievement('ritmo_afro')) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'ritmo_afro'));
  }

  // Mostrar popup para cada conquista nova (com delay entre elas)
  newlyUnlocked.forEach((achievement, index) => {
    setTimeout(() => {
      showAchievementPopup(achievement);
    }, index * 2500);
  });

  // Atualiza a grid de conquistas se estiver visível
  renderConquistas();
}

function showAchievementPopup(achievement) {
  const popup = document.getElementById('achievementPopup');
  if (!popup) return;

  const iconEl = popup.querySelector('.achievement-popup-icon');
  const titleEl = popup.querySelector('.achievement-popup-title');
  const descEl = popup.querySelector('.achievement-popup-desc');

  if (iconEl) {
    iconEl.className = 'achievement-popup-icon ' + achievement.gradient;
    iconEl.innerHTML = achievement.icon;
  }
  if (titleEl) titleEl.textContent = achievement.title;
  if (descEl) descEl.textContent = achievement.description;

  popup.classList.add('active');

  // Remove automaticamente após 3s
  setTimeout(() => {
    popup.classList.remove('active');
  }, 3000);
}

function initAchievementPopup() {
  const popupHTML = `
    <div class="achievement-popup" id="achievementPopup">
      <div class="achievement-popup-inner">
        <div class="achievement-popup-shimmer"></div>
        <div class="achievement-popup-icon bg-gold-gradient">
          <svg viewBox="0 0 24 24" fill="white"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>
        <div class="achievement-popup-text">
          <span class="achievement-popup-label font-bebas-ui">CONQUISTA DESBLOQUEADA!</span>
          <span class="achievement-popup-title font-bebas">Primeiro Passo</span>
          <span class="achievement-popup-desc">Complete sua primeira dança</span>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', popupHTML);
}

function renderConquistas() {
  const unlocked = getUnlockedAchievements();

  // Render no perfil (primeiros 4)
  const perfilGrid = document.getElementById('perfil-conquistas-grid');
  if (perfilGrid) {
    perfilGrid.innerHTML = ACHIEVEMENTS.slice(0, 4).map(a => renderConquistaCard(a, unlocked.includes(a.id))).join('');
  }

  // Render na tela de conquistas (todos)
  const fullGrid = document.getElementById('conquistas-full-grid');
  if (fullGrid) {
    fullGrid.innerHTML = ACHIEVEMENTS.map(a => renderConquistaCard(a, unlocked.includes(a.id))).join('');
  }

  // Atualiza o contador
  const countText = document.getElementById('conquistas-count-text');
  if (countText) {
    countText.textContent = `${unlocked.length} de ${ACHIEVEMENTS.length} desbloqueadas`;
  }
}

function renderConquistaCard(achievement, isUnlocked) {
  if (isUnlocked) {
    return `
      <div class="conquista-card conquista-unlocked">
        <div class="conquista-icon-wrap ${achievement.gradient}">
          ${achievement.icon}
        </div>
        <h4 class="font-bebas text-dark-red">${achievement.title}</h4>
        <p>${achievement.description}</p>
      </div>
    `;
  } else {
    return `
      <div class="conquista-card locked">
        <div class="conquista-icon-wrap bg-faded">
          <svg viewBox="0 0 24 24" fill="#A8958E"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <div class="lock-overlay"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/></svg></div>
        </div>
        <h4 class="font-bebas">${achievement.title}</h4>
        <p style="color: #C0B0A8;">${achievement.description}</p>
      </div>
    `;
  }
}

/* ================================================================
   GLOSSÁRIO - BUSCA DE TERMOS
   ================================================================ */
function initGlossarioSearch() {
  const searchInput = document.querySelector('.glossario-search-input');
  const searchBtn = document.querySelector('.search-btn');
  if (!searchInput) return;

  const filterTerms = () => {
    const filter = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.term-card, .featured-term-card');

    cards.forEach(card => {
      const title = card.querySelector('h2, h3').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();

      if (title.includes(filter) || desc.includes(filter)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  };

  searchInput.addEventListener('input', filterTerms);
  if (searchBtn) {
    searchBtn.addEventListener('click', filterTerms);
  }
}

/* ================================================================
   RECOMPENSA - TEXTOS DINÂMICOS
   ================================================================ */
function initRecompensaScreen() {
  const recompensaSubtitle = document.querySelector('.recompensa-screen .recompensa-subtitle');
  if (!recompensaSubtitle) return;

  const currentLevel = parseInt(sessionStorage.getItem('ginga_current_playing_level')) || 4;

  let text = 'Você completou um passo de dança<br>e está dominando a ginga!';
  
  if (currentLevel === 4) {
    text = 'Primeira fase concluída!<br>Você já pegou o ritmo, continue assim!';
  } else if (currentLevel === 8) {
    text = 'A base está sólida!<br>Seus passos estão cada vez melhores!';
  } else if (currentLevel === 12) {
    text = 'Metade do caminho!<br>Você está mostrando muita evolução!';
  } else if (currentLevel === 16) {
    text = 'Quase um profissional!<br>A ginga já faz parte de você!';
  } else if (currentLevel === 20) {
}

  recompensaSubtitle.innerHTML = text;
}
// YouTube Player API Integration
const YOUTUBE_MAP = {
  // Série 1
  '1_casal_A': 'PU2NMhEDI9Y',
  '1_casal_B': 'yX_ILrxL4Bc',
  '1_casal_C': 'PLSbGxcDfWQ',
  '1_cavalheiro_A': 'knmpDd2blEw',
  '1_cavalheiro_B': 'AhdAloTSg8k',
  '1_cavalheiro_C': 'NmBjckMicE0',
  '1_dama_A': '6DSadJuDPjA',
  '1_dama_B': 'FUbjyBN1WG8',
  '1_dama_C': 'HQHQTgcrXP4',

  // Série 2
  '2_casal_A': 'fhEGOxrZ7Vc',
  '2_casal_B': 'ahRosAWmvdk',
  '2_casal_C': 'kaJYT_V2Zo4',
  '2_cavalheiro_A': 'WWbqZlkTmjg',
  '2_cavalheiro_B': 'VyPlqm6q8K4',
  '2_cavalheiro_C': 'YQCnMYSBuF4',
  '2_dama_A': 'L3QmjFRjaNA',
  '2_dama_B': 'BsnKC7CT28c',
  '2_dama_C': 'P0geaqa5KyM',

  // Série 3
  '3_casal_A': '527L_rxFTvg',
  '3_casal_B': '6j7nA8kdTVo',
  '3_casal_C': 'bDgvumDB13A',
  '3_cavalheiro_A': 'hx2yhL7_ntI',
  '3_cavalheiro_B': '0y5zO_dh7aM',
  '3_cavalheiro_C': 'jTLSirghP5c',
  '3_dama_A': '95B9DWfOc1E',
  '3_dama_B': 'cILrNjbzPHc',
  '3_dama_C': '-F4UABUqU2M',

  // Série 4
  '4_casal_A': 'btwrf8Delyk',
  '4_casal_B': 'KN8at5yYKE8',
  '4_casal_C': 'cwkJUmddmvE',
  '4_cavalheiro_A': 'StFsDC7pres',
  '4_cavalheiro_B': 'hqIPP27Suzc',
  '4_cavalheiro_C': '6qCy0_x_5E0',
  '4_dama_A': 'BKa71ut4wco',
  '4_dama_B': 'Ll7SLe_B5bY',
  '4_dama_C': 'S8nTvDovhHI',

  // Série 5
  '5_casal_A': 'eSvInw7zMEs',
  '5_casal_B': '9mWE6mM_R2A',
  '5_casal_C': 'cxB4KwNJ0yw',
  '5_cavalheiro_A': 'sk2EQdb0wXo',
  '5_cavalheiro_B': 'RprVIUWVW1k',
  '5_cavalheiro_C': 'ugnd8l-q8fc',
  '5_dama_A': 'uB3v_e7hqYQ',
  '5_dama_B': 'HxKpomM5Y94',
  '5_dama_C': 'OGWmLhxTK2g',

  // Série 6
  '6_casal_A': 'PLblxuDNoco',
  '6_casal_B': 'xynaVXWofZI',
  '6_casal_C': 'XDTTzZShH8k',
  '6_cavalheiro_A': 'FuoUIsbuKk8',
  '6_cavalheiro_B': 'mxWKGCw_NT8',
  '6_cavalheiro_C': '-jdaBmcHGfA',
  '6_dama_A': 'RV3IBRcnrvg',
  '6_dama_B': 'GNGxxbNtUdY',
  '6_dama_C': 'T9M1rCVuvvM',

  // Coreografia Final
  'coreografia': '27BTXM4JM7A'
};

var ytAPIReady = false;
var globalYTPlayer = null;
var currentPlayingLevelId = null;

function onYouTubeIframeAPIReady() {
  ytAPIReady = true; // API pronta — o player será criado quando o modal abrir
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    if (currentPlayingLevelId) {
      completeCurrentLevel();
      const modal = document.getElementById('videoModal');
      if (modal) modal.classList.remove('active');
      const trilhaContainer = document.querySelector('.nodes-list');
      if (trilhaContainer) renderTrilha(trilhaContainer);

      checkAchievements();

      if (currentPlayingLevelId === 24) {
        window.location.href = 'recompensa-final.html';
        return;
      }

      const successModal = document.getElementById('successModal');
      if (successModal) {
        successModal.classList.add('active');
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FCA311', '#FF4B4B', '#FFFFFF']
          });
        }
      }
    }
  }
}
