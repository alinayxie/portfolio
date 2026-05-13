// ── NAVBAR / DROPDOWN ──
const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(function(dropdown) {
  const toggle = dropdown.querySelector('.dropdown-toggle');

  toggle.addEventListener('click', function(e) {
    e.preventDefault();
    const isOpen = dropdown.classList.contains('open');
    dropdowns.forEach(function(d) { d.classList.remove('open'); });
    if (!isOpen) {
      dropdown.classList.add('open');
    }
  });
});

document.addEventListener('click', function(e) {
  if (!e.target.closest('.dropdown')) {
    dropdowns.forEach(function(d) { d.classList.remove('open'); });
  }
});

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', function() {
  navLinks.classList.toggle('open');
});

// ── CAROUSELS ──
document.querySelectorAll('.carousel').forEach(function(carousel) {
  var track = carousel.querySelector('.carousel-track');
  var imgs = track.querySelectorAll('img');
  var total = imgs.length;
  var current = 0;
  var autoplayTimer;

  var counterCurrent = carousel.querySelector('.current');
  var counterTotal = carousel.querySelector('.total');
  if (counterTotal) counterTotal.textContent = total;

  function goTo(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    current = index;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    if (counterCurrent) counterCurrent.textContent = current + 1;
  }

  function startAutoplay() {
    autoplayTimer = setInterval(function() {
      goTo(current + 1);
    }, 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  carousel.querySelector('.prev').addEventListener('click', function() {
    goTo(current - 1);
    resetAutoplay();
  });

  carousel.querySelector('.next').addEventListener('click', function() {
    goTo(current + 1);
    resetAutoplay();
  });

  // Touch/swipe support
  var startX = 0;
  track.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
      resetAutoplay();
    }
  }, { passive: true });

  startAutoplay();
});

// ── MASONRY AUTO-SCROLLING STRIP ──
var masonryCarousel = document.querySelector('.masonry-carousel');
if (masonryCarousel) {
  var masonryTrack = masonryCarousel.querySelector('.masonry-track');

  // Duplicate all images so the loop is seamless
  var originalImgs = Array.from(masonryTrack.querySelectorAll('img'));
  originalImgs.forEach(function(img) {
    var clone = img.cloneNode(true);
    masonryTrack.appendChild(clone);
  });

  var offset = 0;
  var speed = 0.6; // pixels per frame — increase to go faster

  function getSetWidth() {
    // width of just the original set (half the total since we duplicated)
    var total = 0;
    var allImgs = masonryTrack.querySelectorAll('img');
    var half = allImgs.length / 2;
    for (var i = 0; i < half; i++) {
      total += allImgs[i].offsetWidth + 10; // 10 = gap
    }
    return total;
  }

  function tick() {
    offset += speed;
    var setWidth = getSetWidth();
    // once we've scrolled a full set, reset silently to create infinite loop
    if (offset >= setWidth) {
      offset -= setWidth;
    }
    masonryTrack.style.transform = 'translateX(-' + offset + 'px)';
    requestAnimationFrame(tick);
  }

  // Wait for images to load so offsetWidth is correct
  var allImgs = masonryTrack.querySelectorAll('img');
  var loaded = 0;
  allImgs.forEach(function(img) {
    if (img.complete) {
      loaded++;
      if (loaded === allImgs.length) requestAnimationFrame(tick);
    } else {
      img.addEventListener('load', function() {
        loaded++;
        if (loaded === allImgs.length) requestAnimationFrame(tick);
      });
    }
  });
}

// ── PERSONAL WORK LIGHTBOX ──
var lightbox = document.getElementById('lightbox');
var lightboxBackdrop = document.getElementById('lightboxBackdrop');
var lightboxImg = document.getElementById('lightboxImg');
var lightboxClose = document.getElementById('lightboxClose');
var lightboxPrev = document.getElementById('lightboxPrev');
var lightboxNext = document.getElementById('lightboxNext');

if (lightbox) {
  // collect all gallery images in order
  var galleryItems = Array.from(document.querySelectorAll('.pw-item, #fa-grid [data-index]'));
  var galleryImgs = galleryItems.map(function(item) {
    var img = item.querySelector('img');
    return { src: img.src, alt: img.alt };
  });
  var lightboxCurrent = 0;

  function openLightbox(index) {
    lightboxCurrent = index;
    lightboxImg.src = galleryImgs[index].src;
    lightboxImg.alt = galleryImgs[index].alt;
    lightbox.classList.add('active');
    lightboxBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showPrev() {
    lightboxCurrent = (lightboxCurrent - 1 + galleryImgs.length) % galleryImgs.length;
    lightboxImg.src = galleryImgs[lightboxCurrent].src;
    lightboxImg.alt = galleryImgs[lightboxCurrent].alt;
  }

  function showNext() {
    lightboxCurrent = (lightboxCurrent + 1) % galleryImgs.length;
    lightboxImg.src = galleryImgs[lightboxCurrent].src;
    lightboxImg.alt = galleryImgs[lightboxCurrent].alt;
  }

  // open on image click
  galleryItems.forEach(function(item) {
    item.addEventListener('click', function() {
      openLightbox(parseInt(item.dataset.index));
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  // keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'Escape') closeLightbox();
  });

  // touch swipe in lightbox
  var lbStartX = 0;
  lightbox.addEventListener('touchstart', function(e) {
    lbStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function(e) {
    var diff = lbStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? showNext() : showPrev();
    }
  }, { passive: true });
}
// ── DISABLE RIGHT-CLICK AND DRAG ON IMAGES ──
document.querySelectorAll('img').forEach(function(img) {
  img.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
  img.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
});