/**
 * Flashpop Client Runtime
 * Lightweight, customizable toast notifications by Shyam Patidar
 */
(function(window) {
  'use strict';

  let container = null;

  function ensureContainer() {
    if (!container || !document.body.contains(container)) {
      container = document.createElement('div');
      container.className = 'easy-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  const icons = {
    success: '<i class="fa-solid fa-circle-check"></i>',
    error: '<i class="fa-solid fa-triangle-exclamation"></i>',
    warning: '<i class="fa-solid fa-circle-exclamation"></i>',
    info: '<i class="fa-solid fa-circle-info"></i>'
  };

  const flashpop = {
    show({ type = 'success', title = '', message = '', duration = 4000 }) {
      const parent = ensureContainer();

      const toast = document.createElement('div');
      toast.className = `easy-toast-item easy-toast--${type}`;

      const iconHtml = icons[type] || icons.info;
      const displayTitle = title || (type.charAt(0).toUpperCase() + type.slice(1));

      toast.innerHTML = `
        <div class="easy-toast-content">
          <div class="easy-toast-icon">${iconHtml}</div>
          <div class="easy-toast-text">
            <div class="easy-toast-title">${displayTitle}</div>
            <div class="easy-toast-message">${message}</div>
          </div>
          <button type="button" class="easy-toast-close" aria-label="Close">&times;</button>
        </div>
        <div class="easy-toast-progress-track">
          <div class="easy-toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
        </div>
      `;

      function dismiss() {
        if (toast.classList.contains('easy-toast-exit')) return;
        toast.classList.add('easy-toast-exit');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 280);
      }

      const closeBtn = toast.querySelector('.easy-toast-close');
      closeBtn.addEventListener('click', dismiss);

      let timer = setTimeout(dismiss, duration);

      toast.addEventListener('mouseenter', () => {
        clearTimeout(timer);
        const bar = toast.querySelector('.easy-toast-progress-bar');
        if (bar) bar.style.animationPlayState = 'paused';
      });

      toast.addEventListener('mouseleave', () => {
        const bar = toast.querySelector('.easy-toast-progress-bar');
        if (bar) bar.style.animationPlayState = 'running';
        timer = setTimeout(dismiss, 1800);
      });

      parent.appendChild(toast);
      return toast;
    },

    success(message, title = 'Success') {
      return this.show({ type: 'success', title, message });
    },

    error(message, title = 'Error') {
      return this.show({ type: 'error', title, message });
    },

    warning(message, title = 'Notice') {
      return this.show({ type: 'warning', title, message });
    },

    info(message, title = 'Information') {
      return this.show({ type: 'info', title, message });
    }
  };

  window.flashpop = flashpop;
})(window);
