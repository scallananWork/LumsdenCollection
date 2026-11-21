(() => {
  const grid = document.getElementById('collectionGrid');
  const viewer = document.getElementById('artworkViewer');
  const viewerImage = document.getElementById('viewerImage');
  if (!viewer) return;

  const closeButton = document.getElementById('viewerClose');
  const previousButton = document.getElementById('viewerPrevious');
  const nextButton = document.getElementById('viewerNext');
  const zoomButton = document.getElementById('viewerZoom');
  const counter = document.getElementById('viewerCounter');
  const caption = document.getElementById('viewerCaption');
  const stage = viewer.querySelector('.viewer-stage');
  let visibleWorks = [];
  let activeIndex = 0;
  let previousFocus = null;
  let touchStartX = 0;

  const allWorks = grid ? Array.from(grid.querySelectorAll('.collection-work')) : [];

  function refreshWorks() {
    visibleWorks = allWorks.filter(work => !work.hidden);
  }

  function showWork(index) {
    if (!visibleWorks.length) return;
    activeIndex = (index + visibleWorks.length) % visibleWorks.length;
    const work = visibleWorks[activeIndex];
    const image = work.querySelector('img');
    const isRotated = Boolean(work.querySelector('.rotated-artwork'));
    viewerImage.classList.remove('is-zoomed', 'is-rotated');
    viewerImage.src = image.currentSrc || image.src;
    viewerImage.alt = image.alt;
    if (isRotated) viewerImage.classList.add('is-rotated');
    counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(visibleWorks.length).padStart(2, '0')}`;
    caption.textContent = work.dataset.title || 'From the collection';
    zoomButton.textContent = 'Zoom in +';
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  }

  function openAt(work) {
    refreshWorks();
    const index = visibleWorks.indexOf(work);
    if (index < 0) return;
    previousFocus = document.activeElement;
    showWork(index);
    if (!viewer.open) viewer.showModal();
    closeButton.focus();
  }

  function closeViewer() {
    if (viewer.open) viewer.close();
  }

  function move(delta) {
    showWork(activeIndex + delta);
  }

  if (grid) {
    allWorks.forEach(work => {
      const trigger = work.querySelector('.artwork-trigger');
      trigger.addEventListener('click', () => openAt(work));
      trigger.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openAt(work);
        }
      });
    });

    const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
    const count = document.getElementById('galleryCount');
    function applyFilter(category) {
      allWorks.forEach(work => {
        work.hidden = category !== 'all' && work.dataset.category !== category;
      });
      filterButtons.forEach(button => {
        const selected = button.dataset.filter === category;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      refreshWorks();
      if (count) count.textContent = `${visibleWorks.length} ${visibleWorks.length === 1 ? 'work' : 'works'}`;
    }
    filterButtons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
    const requestedCategory = new URLSearchParams(window.location.search).get('category');
    if (requestedCategory && filterButtons.some(button => button.dataset.filter === requestedCategory)) {
      applyFilter(requestedCategory);
    } else {
      applyFilter('all');
    }
  }

  closeButton.addEventListener('click', closeViewer);
  previousButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
  zoomButton.addEventListener('click', () => {
    const zoomed = viewerImage.classList.toggle('is-zoomed');
    zoomButton.textContent = zoomed ? 'Zoom out −' : 'Zoom in +';
  });
  viewerImage.addEventListener('click', () => zoomButton.click());
  viewer.addEventListener('click', event => {
    if (event.target === viewer) closeViewer();
  });
  viewer.addEventListener('close', () => {
    viewerImage.src = '';
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  });
  document.addEventListener('keydown', event => {
    if (!viewer.open) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  });
  stage.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    const distance = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(distance) > 65) move(distance < 0 ? 1 : -1);
  }, { passive: true });

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-header nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.textContent = open ? 'Close' : 'Menu';
    });
  }
})();
