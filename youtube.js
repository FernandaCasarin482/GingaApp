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
  
  // Placeholder for others
  'coreografia': ''
};

var globalYTPlayer;
var currentPlayingLevelId = null;

function onYouTubeIframeAPIReady() {
  globalYTPlayer = new YT.Player('youtubePlayer', {
    height: '100%',
    width: '100%',
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
