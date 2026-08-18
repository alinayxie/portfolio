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

  var originalImgs = Array.from(masonryTrack.querySelectorAll('img'));
  originalImgs.forEach(function(img) {
    var clone = img.cloneNode(true);
    masonryTrack.appendChild(clone);
  });

  var offset = 0;
  var speed = 0.6;

  function getSetWidth() {
    var total = 0;
    var allImgs = masonryTrack.querySelectorAll('img');
    var half = allImgs.length / 2;
    for (var i = 0; i < half; i++) {
      total += allImgs[i].offsetWidth + 10;
    }
    return total;
  }

  function tick() {
    offset += speed;
    var setWidth = getSetWidth();
    if (offset >= setWidth) {
      offset -= setWidth;
    }
    masonryTrack.style.transform = 'translateX(-' + offset + 'px)';
    requestAnimationFrame(tick);
  }

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
  var galleryItems = Array.from(document.querySelectorAll('.pw-item, #fa-grid [data-index], .pg-item'));
  var seenIndex = {};
  var galleryImgs = [];
  galleryItems.forEach(function(item) {
    var idx = item.dataset.index;
    var key = idx !== undefined ? idx : String(galleryImgs.length);
    if (seenIndex[key] !== undefined) return;
    seenIndex[key] = galleryImgs.length;
    var img = item.querySelector('img');
    galleryImgs.push({ src: img.src, alt: img.alt });
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

  galleryItems.forEach(function(item) {
    item.addEventListener('click', function() {
      if (window.__pgWasDragging && window.__pgWasDragging()) return;
      var idx = item.dataset.index;
      var mapped = idx !== undefined ? seenIndex[idx] : galleryItems.indexOf(item);
      openLightbox(mapped);
    });
  });

  // Lets other views (e.g. the filtered playground grids) swap in
  // their own image set and open the lightbox at a given index.
  window.__openLightboxWith = function (imgs, index) {
    galleryImgs = imgs;
    openLightbox(index);
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'Escape') closeLightbox();
  });

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

// ── SCROLL REVEAL ──
(function () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  var revealSelectors = [
    '.page-hero-text',
    '.client-logo',
    '.overview',
    '.subsection-title',
    '.carousel-row',
    '.carousel-image-row',
    '.mail-thumbnails-row',
    '.thumbnail-stack',
    '.dm-section-title',
    '.dm-section-sub',
  ];

  revealSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  });

  var groupSelectors = [
    '.carousel-row',
    '.gif-row',
    '.dm-gif-row',
    '.dm-webart-row',
    '.fine-art-col',
    '.pw-row',
  ];

  groupSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.remove('reveal');
      el.classList.add('reveal-group');
      observer.observe(el);
    });
  });
}());

// ── DISABLE RIGHT-CLICK AND DRAG ON IMAGES ──
document.querySelectorAll('img').forEach(function(img) {
  img.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
  img.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
});
// ── HERO BOUNCY LETTER ANIMATION ──
(function () {
  var letters = Array.from(document.querySelectorAll('.hl'));
  if (!letters.length) return;

  // Also split the subtitle into letter spans
  var subEl = document.getElementById('heroSub');
  var subLetters = [];
  if (subEl) {
    var text = subEl.textContent;
    subEl.innerHTML = '';
    text.split('').forEach(function (ch) {
      if (ch === ' ') {
        var sp = document.createElement('span');
        sp.style.display = 'inline-block';
        sp.style.width = '0.3em';
        subEl.appendChild(sp);
      } else {
        var span = document.createElement('span');
        span.className = 'hl-sub';
        span.textContent = ch;
        subEl.appendChild(span);
        subLetters.push(span);
      }
    });
  }

  var state = letters.map(function (el, i) {
    return {
      el: el,
      y: 0, vy: 0,
      x: 0, vx: 0,
      rot: 0, vrot: 0,
      scale: 1, vscale: 0,
      born: false,
      entryDelay: 200 + i * 120,
      isSub: false,
    };
  });

  // Subtitle letter states — smaller motion, later entry
  var subState = subLetters.map(function (el, i) {
    return {
      el: el,
      y: 0, vy: 0,
      x: 0, vx: 0,
      rot: 0, vrot: 0,
      scale: 1, vscale: 0,
      born: true, // sub letters start visible
      isSub: true,
      opacity: 1,
    };
  });

  var startTime = null;
  var mouse = { x: -9999, y: -9999 };
  var scattered = false;

  var STIFFNESS = 0.07;
  var DAMPING   = 0.82;
  var ROT_STIFF = 0.08;
  var ROT_DAMP  = 0.80;
  var SCL_STIFF = 0.09;
  var SCL_DAMP  = 0.81;

  var WAVE_AMP   = 5;
  var WAVE_SPEED = 0.0005;
  var WAVE_PHASE = 0.5;

  function tickLetter(s, i, now, elapsed) {
    if (elapsed < s.entryDelay) {
      s.el.style.opacity = '0';
      s.el.style.transform = 'translateY(-80px) rotate(-12deg) scale(0.6)';
      return;
    }
    if (!s.born) {
      s.born = true;
      s.y = -80; s.vy = 1.5 + Math.random() * 2;
      s.rot = (Math.random() - 0.5) * 35;
      s.vrot = (Math.random() - 0.5) * 4;
      s.scale = 0.6; s.vscale = 0.025;
      s.x = 0; s.vx = 0;
    }

    if (scattered) {
      s.x  += s.vx; s.vx *= 0.992;
      s.y  += s.vy; s.vy *= 0.992;
      s.rot += s.vrot; s.vrot *= 0.992;
      s.scale += s.vscale; s.vscale *= 0.992;
      s.scale = Math.max(0.01, s.scale);
      var op = Math.max(0, Math.min(1, s.scale * 2.2));
      s.el.style.opacity = op.toFixed(3);
    } else {
      var waveTarget = WAVE_AMP * Math.sin(now * WAVE_SPEED + i * WAVE_PHASE);
      s.vx = ((s.vx || 0) + -0.12 * s.x) * 0.80;
      s.x += s.vx;
      if (Math.abs(s.x) < 0.1) s.x = 0;
      s.vy = (s.vy + -STIFFNESS * (s.y - waveTarget)) * DAMPING;
      s.y += s.vy;
      s.vrot = (s.vrot + -ROT_STIFF * s.rot) * ROT_DAMP;
      s.rot += s.vrot;
      s.vscale = (s.vscale + -SCL_STIFF * (s.scale - 1)) * SCL_DAMP;
      s.scale += s.vscale;

      // Mouse proximity — bouncy repulsion
      var rect = s.el.getBoundingClientRect();
      var cx = rect.left + rect.width  / 2;
      var cy = rect.top  + rect.height / 2;
      var dx = cx - mouse.x;
      var dy = cy - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90 && dist > 0) {
        var force = (1 - dist / 90) * 6;
        s.vy   -= (dy / dist) * force * 0.3;
        s.vx   -= (dx / dist) * force * 0.2;
        s.vrot += (dx / dist) * force * 0.4;
        s.vscale += (1 - dist / 90) * 0.02;
      }

      s.el.style.opacity = '1';
    }

    s.el.style.transform =
      'translateX(' + (s.x || 0).toFixed(2) + 'px)' +
      ' translateY(' + s.y.toFixed(2) + 'px)' +
      ' rotate(' + s.rot.toFixed(2) + 'deg)' +
      ' scale(' + s.scale.toFixed(3) + ')';
  }

  function tickSubLetter(s, i, now) {
    if (scattered) {
      s.x  += s.vx; s.vx *= 0.992;
      s.y  += s.vy; s.vy *= 0.992;
      s.rot += s.vrot; s.vrot *= 0.992;
      s.scale += s.vscale; s.vscale *= 0.992;
      s.scale = Math.max(0.01, s.scale);
      var op = Math.max(0, Math.min(1, s.scale * 2.2));
      s.el.style.opacity = op.toFixed(3);
    } else {
      // Gentle wave, smaller amplitude
      var waveTarget = 3 * Math.sin(now * WAVE_SPEED * 0.8 + i * 0.4 + 1.5);
      s.vx = ((s.vx || 0) + -0.10 * s.x) * 0.82;
      s.x += s.vx;
      s.vy = (s.vy + -STIFFNESS * (s.y - waveTarget)) * DAMPING;
      s.y += s.vy;
      s.vrot = (s.vrot + -ROT_STIFF * s.rot) * ROT_DAMP;
      s.rot += s.vrot;
      s.vscale = (s.vscale + -SCL_STIFF * (s.scale - 1)) * SCL_DAMP;
      s.scale += s.vscale;
      s.el.style.opacity = '1';
    }

    s.el.style.transform =
      'translateX(' + (s.x || 0).toFixed(2) + 'px)' +
      ' translateY(' + s.y.toFixed(2) + 'px)' +
      ' rotate(' + s.rot.toFixed(2) + 'deg)' +
      ' scale(' + s.scale.toFixed(3) + ')';
  }

  // Hero art images — floating wave + scatter
  var artLeft  = document.querySelector('.hero-art-left');
  var artRight = document.querySelector('.hero-art-right');
  var artState = [artLeft, artRight].filter(Boolean).map(function (el, i) {
    return {
      el: el,
      y: 0, vy: 0,
      x: 0, vx: 0,
      rot: i === 0 ? -4 : 4,   // preserve their natural tilt offset
      baseRot: i === 0 ? -4 : 4,
      vrot: 0,
      scale: 1, vscale: 0,
      phaseOffset: i === 0 ? 0 : Math.PI, // opposite phase for a see-saw feel
    };
  });

  function tickArt(s, i, now) {
    if (scattered) {
      s.x  += s.vx; s.vx *= 0.992;
      s.y  += s.vy; s.vy *= 0.992;
      s.rot += s.vrot; s.vrot *= 0.992;
      s.scale += s.vscale; s.vscale *= 0.992;
      s.scale = Math.max(0.01, s.scale);
      var op = Math.max(0, Math.min(1, s.scale * 2.2));
      s.el.style.opacity = op.toFixed(3);
    } else {
      // Float up/down with a slow wave, slightly out of phase with each other
      var waveTarget = 8 * Math.sin(now * WAVE_SPEED * 0.7 + s.phaseOffset);
      s.vy = (s.vy + -STIFFNESS * (s.y - waveTarget)) * DAMPING;
      s.y += s.vy;

      // Gentle rock back toward base rotation
      var rotTarget = s.baseRot + 2 * Math.sin(now * WAVE_SPEED * 0.5 + s.phaseOffset + 1);
      s.vrot = (s.vrot + -0.06 * (s.rot - rotTarget)) * 0.88;
      s.rot += s.vrot;

      // Spring x back to 0
      s.vx = (s.vx + -0.10 * s.x) * 0.85;
      s.x += s.vx;

      // Spring scale back to 1
      s.vscale = (s.vscale + -SCL_STIFF * (s.scale - 1)) * SCL_DAMP;
      s.scale += s.vscale;

      s.el.style.opacity = '1';
    }

    s.el.style.transform =
      'translateX(' + s.x.toFixed(2) + 'px)' +
      ' translateY(' + s.y.toFixed(2) + 'px)' +
      ' rotate(' + s.rot.toFixed(2) + 'deg)' +
      ' scale(' + s.scale.toFixed(3) + ')';
  }

  function tick(now) {
    if (!startTime) startTime = now;
    var elapsed = now - startTime;
    state.forEach(function (s, i) { tickLetter(s, i, now, elapsed); });
    subState.forEach(function (s, i) { tickSubLetter(s, i, now); });
    artState.forEach(function (s, i) { tickArt(s, i, now); });
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  var hero = document.getElementById('homeHero');

  function triggerScatter() {
    // Main letters
    state.forEach(function (s) {
      if (!s.born) return;
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 3.5;
      s.vy = Math.sin(angle) * speed - 0.8;
      s.vrot = (Math.random() - 0.5) * 8;
      s.vscale = -(0.008 + Math.random() * 0.012);
      s.x = s.x || 0;
      s.vx = Math.cos(angle) * speed * 1.1;
    });
    // Subtitle letters
    subState.forEach(function (s) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 1.5 + Math.random() * 2.5;
      s.vy = Math.sin(angle) * speed - 0.6;
      s.vrot = (Math.random() - 0.5) * 6;
      s.vscale = -(0.006 + Math.random() * 0.01);
      s.x = s.x || 0;
      s.vx = Math.cos(angle) * speed * 1.0;
    });
    // Art images — drift outward to their respective sides
    artState.forEach(function (s, i) {
      var dir = i === 0 ? -1 : 1; // left image goes left, right goes right
      var speed = 1.5 + Math.random() * 2;
      s.vx = dir * speed * 1.8;
      s.vy = -(0.5 + Math.random() * 1.5);
      s.vrot = dir * (1 + Math.random() * 3);
      s.vscale = -(0.006 + Math.random() * 0.008);
    });
  }

  function triggerReassemble() {
    state.forEach(function (s) {
      s.x = s.x || 0; s.vx = s.vx || 0;
      s.vy    += (0 - s.y)    * 0.03;
      s.vrot  += (0 - s.rot)  * 0.03;
      s.vscale += (1 - s.scale) * 0.03;
    });
    subState.forEach(function (s) {
      s.x = s.x || 0; s.vx = s.vx || 0;
      s.vy    += (0 - s.y)    * 0.03;
      s.vrot  += (0 - s.rot)  * 0.03;
      s.vscale += (1 - s.scale) * 0.03;
    });
    artState.forEach(function (s) {
      s.vx    += (0 - s.x)           * 0.02;
      s.vy    += (0 - s.y)           * 0.02;
      s.vrot  += (s.baseRot - s.rot) * 0.02;
      s.vscale += (1 - s.scale)      * 0.02;
    });
  }

  function checkScatter() {
    if (!hero) return;
    var heroRect = hero.getBoundingClientRect();
    var scrolledPast = -heroRect.top;
    var triggerPoint = window.innerHeight * 0.1;

    if (scrolledPast > triggerPoint && !scattered) {
      scattered = true;
      triggerScatter();
    } else if (scrolledPast < triggerPoint * 0.6 && scattered) {
      scattered = false;
      triggerReassemble();
    }
  }

  window.addEventListener('scroll', checkScatter, { passive: true });

  if (hero) {
    hero.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY;
    });
    hero.addEventListener('mouseleave', function () {
      mouse.x = -9999; mouse.y = -9999;
    });
    hero.addEventListener('touchmove', function (e) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }, { passive: true });
    hero.addEventListener('touchend', function () {
      mouse.x = -9999; mouse.y = -9999;
    });
  }
}());

// ── HOME: PAGE-SCROLL DRIVEN STRIP ──
(function () {
  var outer       = document.getElementById('homeLayoutOuter');
  var track       = document.getElementById('homeStripTrack');
  var thumbs      = document.querySelectorAll('.home-thumb');
  var dots        = document.querySelectorAll('.dot');
  var hero        = document.getElementById('homeHero');
  var projectInfo = document.getElementById('homeProjectInfo');
  var infoTitle   = document.getElementById('infoTitle');
  var infoCategory= document.getElementById('infoCategory');
  var infoDesc    = document.getElementById('infoDesc');
  var infoCta     = document.getElementById('infoCta');
  var textPanel   = document.getElementById('homeTextPanel');
  var bgLayer     = document.getElementById('homeBgLayer');

  if (!outer || !track || !thumbs.length) return;

  // Colors: index 0 = hero, 1 = Sports Excitement, 2 = Haddee, 3 = Web Art, 4 = Playground
  var bgColors = [
    '#f9f9f7',  // hero — warm off-white (also used while on Sports Excitement)
    '#f9f9f7',  // thumb 0 (Sports Excitement) — same as hero, no change yet
    '#e8e4f0',  // thumb 1 (Haddee) — soft lavender
    '#e4ede8',  // thumb 2 (Recycling Mirage) — sage green
    '#f0e8e4',  // thumb 2 (Creative coding) — dusty rose
    '#f1e5ee',  // thumb 3 (Playground) — light pink
  ];

  function setBgColor(dotIdx) {
    if (!bgLayer) return;
    var color = bgColors[Math.min(dotIdx, bgColors.length - 1)] || bgColors[bgColors.length - 1];
    bgLayer.style.backgroundColor = color;
  }

  var n           = thumbs.length;
  var cardH       = 0;
  var trackPad    = 0;  // top/bottom padding on the track
  var stripH      = 0;
  var currentIdx  = 0;
  var targetY     = 0;
  var currentY    = 0;
  var hasEntered  = false; // true once user has scrolled into the outer

  // ── Size the outer wrapper so page has enough room to scroll ──
  function measure() {
    var thumbEl = thumbs[0];
    var style   = window.getComputedStyle(thumbEl);
    var mt      = parseFloat(style.marginTop)    || 14;
    var mb      = parseFloat(style.marginBottom) || 14;
    cardH    = thumbEl.offsetHeight + mt + mb;
    trackPad = Math.max(0, (window.innerHeight - thumbEl.offsetHeight) / 2);
    stripH   = cardH * n + trackPad * 2;
    outer.style.height = stripH + 'px';
  }

  // ── Map page scroll position inside the outer to a strip offset ──
  function getTargetY() {
    var outerTop = outer.getBoundingClientRect().top + window.scrollY;
    var scrolled = Math.max(0, window.scrollY - outerTop);
    return -scrolled;
  }

  // ── Which thumb index is currently centered ──
  function getActiveThumb(y) {
    // Account for trackPad: first card center is at trackPad + cardH/2
    var scrolled = -y; // how far the track has moved up
    var idx = Math.round((scrolled - trackPad) / cardH);
    return Math.max(0, Math.min(n - 1, idx));
  }

  // ── Lerp animation loop ──
  function animate() {
    targetY  = getTargetY();
    currentY += (targetY - currentY) * 0.1;

    var rounded = Math.round(currentY);
    track.style.transform = 'translateY(' + rounded + 'px)';

    var outerTop = outer.getBoundingClientRect().top + window.scrollY;
    var scrolledIntoOuter = window.scrollY - outerTop;

    // Only start tracking thumbs once user has scrolled past the trackPad
    // (i.e. the first card is actually starting to center)
    if (scrolledIntoOuter > trackPad * 0.5) {
      hasEntered = true;
    }

    if (hasEntered) {
      var thumbIdx = getActiveThumb(currentY);
      var dotIdx   = thumbIdx + 1;
      if (dotIdx !== currentIdx) markActive(dotIdx, thumbs[thumbIdx]);
    }

    requestAnimationFrame(animate);
  }

  // ── Update dots and text panel ──
  function updateDots(idx) {
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
  }

  function getThumbContent(thumb) {
    var titleEl    = thumb.querySelector('.thumb-title');
    var categoryEl = thumb.querySelector('.thumb-category');
    var descEl     = thumb.querySelector('.thumb-desc');
    var ctaEl      = thumb.querySelector('.thumb-cta');
    return {
      title:    titleEl    ? titleEl.innerHTML        : thumb.dataset.title,
      category: categoryEl ? categoryEl.textContent   : thumb.dataset.category,
      desc:     descEl     ? descEl.textContent        : thumb.dataset.desc,
      cta:      ctaEl      ? ctaEl.textContent         : thumb.dataset.cta,
      href:     ctaEl      ? ctaEl.getAttribute('href'): thumb.dataset.href
    };
  }

  function updateTextPanel(thumb, thumbIdx) {
    if (!projectInfo) return;
    var content = getThumbContent(thumb);
    projectInfo.classList.add('updating');
    setTimeout(function () {
      infoTitle.innerHTML   = content.title;
      infoCategory.textContent = content.category;
      infoDesc.textContent  = content.desc;
      infoCta.textContent   = content.cta;
      infoCta.href          = content.href;
      projectInfo.classList.remove('updating');
    }, 200);
  }

  function markActive(dotIdx, thumb) {
    if (dotIdx === currentIdx) return;
    currentIdx = dotIdx;
    updateDots(dotIdx);
    setBgColor(dotIdx);
    thumbs.forEach(function (t, i) {
      t.classList.toggle('is-active', i === dotIdx - 1);
    });
    if (thumb) updateTextPanel(thumb, dotIdx - 1);
  }

  // Exposed for the hero scroll-jack module: force the dot nav / bg color
  // back to the hero state when the pinned intro is showing again.
  window.homeStripShowHero = function () {
    hasEntered = false;
    currentIdx = 0;
    updateDots(0);
    setBgColor(0);
    thumbs.forEach(function (t) { t.classList.remove('is-active'); });
  };

  // ── Hero visibility → dot 0 ──
  if (hero) {
    var heroObs = new IntersectionObserver(function (entries) {
      if (entries[0].intersectionRatio >= 0.4 && currentIdx !== 0) {
        hasEntered = false;
        currentIdx = 0;
        updateDots(0);
        setBgColor(0);
      }
    }, { threshold: 0.4 });
    heroObs.observe(hero);
  }

  // ── Dot clicks ──
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      if (dot.dataset.target === 'hero') {
        if (window.heroIntroReset) window.heroIntroReset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Release the pinned hero first, in case it's still mid-intro,
        // so the page is actually free to scroll to the target.
        if (window.heroIntroSkip) window.heroIntroSkip();
        var thumbIdx = parseInt(dot.dataset.target);
        // Scroll page to position where that card will be centered
        var outerTop = outer.getBoundingClientRect().top + window.scrollY;
        var dest     = outerTop + thumbIdx * cardH + cardH / 2 - window.innerHeight / 2;
        window.scrollTo({ top: Math.max(outerTop, dest), behavior: 'smooth' });
      }
    });
  });

  // ── Scroll hint arrow → jump to first thumbnail ──
  var scrollHint = document.querySelector('.slide-scroll-hint');
  if (scrollHint) {
    scrollHint.style.cursor = 'pointer';
    scrollHint.addEventListener('click', function () {
      var outerTop = outer.getBoundingClientRect().top + window.scrollY;
      var dest = outerTop + cardH / 2 - window.innerHeight / 2;
      window.scrollTo({ top: Math.max(outerTop, dest), behavior: 'smooth' });
    });
  }

  // ── Click inactive thumb → scroll it into center ──
  thumbs.forEach(function (thumb, thumbIdx) {
    thumb.addEventListener('click', function (e) {
      // On mobile the scroll-driven layout is inactive — let links work normally
      if (window.innerWidth <= 860) return;
      window.location.href = thumb.dataset.href;
    });
  });

  // ── Keyboard ──
  document.addEventListener('keydown', function (e) {
    var outerTop = outer.getBoundingClientRect().top + window.scrollY;
    var inView   = window.scrollY >= outerTop - window.innerHeight &&
                   window.scrollY <= outerTop + outer.offsetHeight;
    if (!inView) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      var next = Math.min(currentIdx, n - 1);
      var dest = outerTop + next * cardH + cardH / 2 - window.innerHeight / 2;
      window.scrollTo({ top: Math.max(outerTop, dest), behavior: 'smooth' });
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      var prev = currentIdx - 2;
      if (prev < 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        var destUp = outerTop + prev * cardH + cardH / 2 - window.innerHeight / 2;
        window.scrollTo({ top: Math.max(outerTop, destUp), behavior: 'smooth' });
      }
    }
  });

  // ── Init ──
  function init() {
    measure();
    // Start with hero dot active, but pre-load Sports Excitement text
    // so when user scrolls in it's already correct (no flash to Haddee)
    currentIdx = 0;
    thumbs[0].classList.add('is-active');
    // Pre-populate text panel silently (no fade animation on load)
    var initialContent = getThumbContent(thumbs[0]);
    infoTitle.innerHTML      = initialContent.title;
    infoCategory.textContent = initialContent.category;
    infoDesc.textContent     = initialContent.desc;
    infoCta.textContent      = initialContent.cta;
    infoCta.href             = initialContent.href;
    updateDots(0);
    setBgColor(0);
    animate();
  }

  window.addEventListener('resize', function () {
    measure();
  });

  init();
}());
// ── PROJECT PAGE (proj-*): hscroll drag, arrows, scroll reveal ──
(function () {
  if (!document.querySelector('.proj-hscroll')) return;

  // Drag-to-scroll
  document.querySelectorAll('.proj-hscroll').forEach(function(el) {
    var isDown = false, startX, scrollLeft;
    el.addEventListener('mousedown', function(e) { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; });
    el.addEventListener('mouseleave', function() { isDown = false; });
    el.addEventListener('mouseup', function() { isDown = false; });
    el.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      e.preventDefault();
      el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX);
    });
  });

  // Arrow buttons
  document.querySelectorAll('.proj-hscroll-wrap').forEach(function(wrap) {
    var strip = wrap.querySelector('.proj-hscroll');
    var prev = wrap.querySelector('.proj-hscroll-prev');
    var next = wrap.querySelector('.proj-hscroll-next');
    if (prev) prev.addEventListener('click', function() { strip.scrollBy({ left: -300, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function() { strip.scrollBy({ left: 300, behavior: 'smooth' }); });
  });

  // Scroll-triggered reveal
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('proj-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.proj-section-inner').forEach(function(el) {
    el.classList.add('proj-hidden');
    observer.observe(el);
  });

  document.querySelectorAll('.proj-hscroll, .proj-colors').forEach(function(el) {
    observer.observe(el);
  });
}());
// ── PROJECT INDEX SIDEBAR: highlight current section ──
(function () {
  var indexLinks = document.querySelectorAll('.proj-index a');
  if (!indexLinks.length) return;

  var sections = [];
  indexLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if (section) sections.push(section);
  });
  if (!sections.length) return;

  function setActive(id) {
    indexLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(function (section) { observer.observe(section); });
}());
// ── BACK LINK: track left edge of content ──
(function () {
  var backLink = document.querySelector('.proj-back-link');
  if (!backLink) return;

  function update() {
    var inner = document.querySelector('.proj-hero') || document.querySelector('.proj-section-inner');
    if (!inner) return;
    var contentLeft = inner.getBoundingClientRect().left;
    var linkWidth = backLink.offsetWidth;
    var gap = 24;
    var left = Math.max(16, contentLeft - linkWidth - gap);
    document.documentElement.style.setProperty('--back-link-left', left + 'px');
  }

  update();
  window.addEventListener('resize', update);
  window.addEventListener('scroll', update);
}());
// ── WEB ART: folder-tab switcher ──
(function () {
  var tabs = document.querySelectorAll('.webart-tab');
  if (!tabs.length) return;

  var panels = document.querySelectorAll('.webart-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-target');

      tabs.forEach(function (t) {
        var isActive = t === tab;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      panels.forEach(function (panel) {
        panel.classList.toggle('active', panel.getAttribute('data-panel') === target);
      });
    });
  });
}());
// ── PLAYGROUND: shared image data ──
var PG_IMAGE_SOURCES = [
  'images/playground/fineArt/fineArt1.png',
  'images/playground/fineArt/fineArt2.png',
  'images/playground/fineArt/fineArt3.png',
  'images/playground/graphicDesign/graphicDesign1.jpg',
  'images/playground/fineArt/fineArt12.jpg',
  'images/playground/graphicDesign/graphicDesign4.png',
  'images/playground/fineArt/fineArt13.jpeg',
  'images/playground/graphicDesign/graphicDesign3.png',
  'images/playground/fineArt/fineArt4.png',
  'images/playground/fineArt/fineArt5.png',
  'images/playground/fineArt/fineArt6.png',
  'images/playground/fineArt/fineArt7.png',
  'images/playground/graphicDesign/graphicDesign2.jpg',
  'images/playground/graphicDesign/graphicDesign5.jpg',
  'images/playground/fineArt/fineArt8.png',
  'images/playground/fineArt/fineArt9.png',
  'images/playground/fineArt/fineArt10.png',
  'images/playground/fineArt/fineArt11.png',
  'images/playground/graphicDesign/graphicDesign6.png',
  'images/playground/graphicDesign/graphicDesign7.png',
  'images/playground/graphicDesign/graphicDesign8.jpg'
];

// ── PLAYGROUND: infinite drag-to-pan gallery ──
(function () {
  var canvas = document.getElementById('pgCanvas');
  var world = document.getElementById('pgWorld');
  if (!canvas || !world) return;

  var IMAGE_SOURCES = PG_IMAGE_SOURCES;

  // Deterministic pseudo-random generator so the scattered layout
  // is stable across reloads instead of reshuffling every visit.
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rand = mulberry32(20260704);

  var isSmallScreen = window.innerWidth <= 700;
  var TILE_W = isSmallScreen ? 1300 : 2200;
  var TILE_H = isSmallScreen ? 1000 : 1500;
  var COLS = isSmallScreen ? 5 : 6;
  var ROWS = isSmallScreen ? 5 : 4;
  var CELL_W = TILE_W / COLS;
  var CELL_H = TILE_H / ROWS;

  var cells = [];
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      cells.push({ r: r, c: c });
    }
  }
  // Shuffle deterministically so images don't land in reading order
  for (var i = cells.length - 1; i > 0; i--) {
    var j = Math.floor(rand() * (i + 1));
    var tmp = cells[i]; cells[i] = cells[j]; cells[j] = tmp;
  }

  var layout = IMAGE_SOURCES.map(function (src, idx) {
    var cell = cells[idx % cells.length];
    var scale = 0.75 + rand() * 0.55; // 0.75x – 1.3x, keeps each image's own ratio
    var jitterX = (rand() - 0.5) * (CELL_W * 0.4);
    var jitterY = (rand() - 0.5) * (CELL_H * 0.4);
    var rotation = (rand() - 0.5) * 16; // roughly -8deg to 8deg
    return {
      src: src,
      x: cell.c * CELL_W + CELL_W / 2 + jitterX,
      y: cell.r * CELL_H + CELL_H / 2 + jitterY,
      scale: scale,
      rotation: rotation
    };
  });

  // Render a 3x3 grid of tiles so panning in any direction always
  // reveals a seamless neighboring copy instead of empty space.
  var OFFSETS = [-1, 0, 1];
  var fragment = document.createDocumentFragment();

  OFFSETS.forEach(function (oy) {
    OFFSETS.forEach(function (ox) {
      layout.forEach(function (item, idx) {
        var el = document.createElement('div');
        el.className = 'pg-item';
        el.dataset.index = idx;

        var px = item.x + ox * TILE_W;
        var py = item.y + oy * TILE_H;
        el.style.setProperty('--px', px + 'px');
        el.style.setProperty('--py', py + 'px');
        el.style.setProperty('--s', item.scale.toFixed(2));
        el.style.transform = 'translate(' + px + 'px, ' + py + 'px) rotate(' + item.rotation.toFixed(2) + 'deg) scale(' + item.scale.toFixed(2) + ')';

        var img = document.createElement('img');
        img.src = item.src;
        img.alt = 'Playground piece ' + (idx + 1);
        img.draggable = false;
        el.appendChild(img);

        fragment.appendChild(el);
      });
    });
  });

  world.appendChild(fragment);

  // ── Preload every image before revealing the canvas, so it doesn't
  //    pop in piece by piece while images finish loading. ──
  var loadingEl = document.getElementById('pgLoading');
  var MAX_WAIT = 4000; // don't block forever if one image is slow/broken

  function revealCanvas() {
    canvas.classList.add('pg-canvas-ready');
    if (loadingEl) loadingEl.classList.add('pg-loading-hidden');
  }

  (function preload() {
    var remaining = IMAGE_SOURCES.length;
    var done = false;

    function checkDone() {
      remaining--;
      if (remaining <= 0 && !done) {
        done = true;
        revealCanvas();
      }
    }

    IMAGE_SOURCES.forEach(function (src) {
      var img = new Image();
      img.onload = checkDone;
      img.onerror = checkDone;
      img.src = src;
    });

    setTimeout(function () {
      if (!done) {
        done = true;
        revealCanvas();
      }
    }, MAX_WAIT);
  }());

  // ── Pan the canvas as the cursor moves, with seamless wraparound ──
  var panX = -TILE_W / 2;
  var panY = -TILE_H / 2;
  var totalMove = 0;
  var hint = document.getElementById('pgHint');
  var coordX = document.getElementById('pgCoordX');
  var coordY = document.getElementById('pgCoordY');
  var hasHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function pad4(n) {
    var s = String(Math.abs(Math.round(n)));
    while (s.length < 4) s = '0' + s;
    return (n < 0 ? '-' : '') + s;
  }

  var targetPanX = null;
  var targetPanY = null;

  function applyTransform() {
    // Wrap the pan value so it stays bounded — seamless because the
    // 3x3 tiles repeat identically in every direction. Keep the
    // eased target in sync so it doesn't jump when this happens.
    if (panX > TILE_W / 2) { panX -= TILE_W; if (targetPanX !== null) targetPanX -= TILE_W; }
    if (panX < -TILE_W * 1.5) { panX += TILE_W; if (targetPanX !== null) targetPanX += TILE_W; }
    if (panY > TILE_H / 2) { panY -= TILE_H; if (targetPanY !== null) targetPanY -= TILE_H; }
    if (panY < -TILE_H * 1.5) { panY += TILE_H; if (targetPanY !== null) targetPanY += TILE_H; }

    world.style.transform = 'translate3d(' + panX + 'px, ' + panY + 'px, 0)';
  }

  function updateCoords(x, y) {
    if (coordX) coordX.textContent = pad4(x);
    if (coordY) coordY.textContent = pad4(y);
  }

  if (hasHover) {
    // Desktop: the canvas follows cursor motion, but eased rather
    // than snapped — it trails slightly behind for a heavier, more
    // fluid feel, and settles to a stop once the cursor stops.
    if (hint) hint.textContent = 'move/drag to explore';

    var lastX = null;
    var lastY = null;
    var SENSITIVITY = 1.2;
    var EASE = 0.04;

    targetPanX = panX;
    targetPanY = panY;

    canvas.addEventListener('mousedown', function () {
      totalMove = 0;
    });

    canvas.addEventListener('mousemove', function (e) {
      updateCoords(e.clientX, e.clientY);

      if (lastX === null) {
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      var dx = (e.clientX - lastX) * SENSITIVITY;
      var dy = (e.clientY - lastY) * SENSITIVITY;
      lastX = e.clientX;
      lastY = e.clientY;

      targetPanX += dx;
      targetPanY += dy;
      totalMove += Math.abs(dx) + Math.abs(dy);
    });

    canvas.addEventListener('mouseleave', function () {
      lastX = null;
      lastY = null;
    });

    (function easeLoop() {
      panX += (targetPanX - panX) * EASE;
      panY += (targetPanY - panY) * EASE;
      applyTransform();
      requestAnimationFrame(easeLoop);
    }());
  } else {
    // Touch devices: no hover, so fall back to drag-to-pan with momentum.
    var dragging = false;
    var lastX = 0, lastY = 0, lastT = 0;
    var velX = 0, velY = 0;
    var rafId = null;

    function stopInertia() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function inertiaStep() {
      velX *= 0.94;
      velY *= 0.94;
      panX += velX;
      panY += velY;
      applyTransform();
      if (Math.abs(velX) > 0.05 || Math.abs(velY) > 0.05) {
        rafId = requestAnimationFrame(inertiaStep);
      } else {
        rafId = null;
      }
    }

    function pointerDown(e) {
      stopInertia();
      dragging = true;
      totalMove = 0;
      var point = e.touches ? e.touches[0] : e;
      lastX = point.clientX;
      lastY = point.clientY;
      lastT = performance.now();
      velX = 0;
      velY = 0;
    }

    function pointerMove(e) {
      if (!dragging) return;
      var point = e.touches ? e.touches[0] : e;
      updateCoords(point.clientX, point.clientY);

      var dx = point.clientX - lastX;
      var dy = point.clientY - lastY;
      var now = performance.now();
      var dt = Math.max(now - lastT, 1);

      panX += dx;
      panY += dy;
      totalMove += Math.abs(dx) + Math.abs(dy);

      velX = dx / dt * 16;
      velY = dy / dt * 16;

      lastX = point.clientX;
      lastY = point.clientY;
      lastT = now;

      applyTransform();
    }

    function pointerUp() {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(velX) > 0.5 || Math.abs(velY) > 0.5) {
        rafId = requestAnimationFrame(inertiaStep);
      }
    }

    canvas.addEventListener('touchstart', pointerDown, { passive: true });
    canvas.addEventListener('touchmove', pointerMove, { passive: true });
    canvas.addEventListener('touchend', pointerUp);
  }

  applyTransform();

  // Lets the shared lightbox click handler ignore clicks that were
  // actually part of panning rather than a genuine tap.
  window.__pgWasDragging = function () {
    return totalMove > 6;
  };
}());
// ── PLAYGROUND: bubble nav + filtered grid views ──
(function () {
  var bubbles = document.querySelectorAll('.pg-bubble-tab');
  if (!bubbles.length) return;

  var canvas = document.getElementById('pgCanvas');
  var graphicView = document.getElementById('pgGraphicView');
  var fineArtView = document.getElementById('pgFineArtView');
  var body = document.body;

  var graphicGrid = document.getElementById('pgGraphicGrid');
  var fineArtGrid = document.getElementById('pgFineArtGrid');

  function findSrc(folder, num) {
    var match = null;
    PG_IMAGE_SOURCES.forEach(function (src) {
      if (src.indexOf('/' + folder + '/') !== -1 && src.indexOf(folder + num + '.') !== -1) {
        match = src;
      }
    });
    return match;
  }

  var FINE_ART_COLUMNS = [
    [1, 2, 3, 6],
    [4, 5, 12, 7],
    [8, 9, 13, 11, 10]
  ].map(function (nums) {
    return nums.map(function (n) { return findSrc('fineArt', n); });
  });

  var GRAPHIC_DESIGN_COLUMNS = [
    [1, 8, 2],
    [3, 4, 5],
    [7, 6]
  ].map(function (nums) {
    return nums.map(function (n) { return findSrc('graphicDesign', n); });
  });

  function getColumnCount() {
    return window.innerWidth <= 700 ? 2 : 3;
  }

  // Splits a flat, ordered list into N columns as evenly as possible
  // (round-robin), used whenever the column count doesn't match the
  // hand-picked 3-column grouping above.
  function distributeEvenly(flat, n) {
    var cols = [];
    for (var i = 0; i < n; i++) cols.push([]);
    flat.forEach(function (src, i) {
      cols[i % n].push(src);
    });
    return cols;
  }

  function buildGrid(container, threeColumnGrouping) {
    if (!container) return;

    var n = getColumnCount();
    if (container.dataset.builtCols === String(n)) return; // already correct
    container.dataset.builtCols = String(n);
    container.innerHTML = '';

    // Flatten the hand-picked 3-column order first — this stays the
    // single source of truth for reading/lightbox order regardless
    // of how many visual columns are shown.
    var flat = [];
    threeColumnGrouping.forEach(function (col) {
      col.forEach(function (src) { flat.push(src); });
    });

    var columns = n === 3 ? threeColumnGrouping : distributeEvenly(flat, n);

    var galleryImgs = flat.map(function (src, i) {
      return { src: src, alt: 'Playground piece ' + (i + 1) };
    });
    // Map each src to its position in the flattened reading order,
    // so the lightbox sequence stays consistent no matter which
    // column layout is currently displayed.
    var indexBySrc = {};
    flat.forEach(function (src, i) { indexBySrc[src] = i; });

    columns.forEach(function (col) {
      var colEl = document.createElement('div');
      colEl.className = 'fine-art-col';
      container.appendChild(colEl);

      col.forEach(function (src) {
        var idx = indexBySrc[src];
        var item = document.createElement('div');
        item.className = 'pw-item';
        item.dataset.index = idx;

        var img = document.createElement('img');
        img.src = src;
        img.alt = 'Playground piece ' + (idx + 1);
        img.loading = 'lazy';

        item.appendChild(img);
        colEl.appendChild(item);

        item.addEventListener('click', function () {
          if (window.__openLightboxWith) window.__openLightboxWith(galleryImgs, idx);
        });
      });
    });
  }

  function showView(name) {
    bubbles.forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === name);
    });

    var isGrid = name !== 'playground';
    body.classList.toggle('pg-grid-mode', isGrid);

    if (canvas) canvas.style.visibility = isGrid ? 'hidden' : 'visible';
    if (graphicView) graphicView.classList.toggle('active', name === 'graphic');
    if (fineArtView) fineArtView.classList.toggle('active', name === 'fineart');

    if (name === 'graphic') buildGrid(graphicGrid, GRAPHIC_DESIGN_COLUMNS);
    if (name === 'fineart') buildGrid(fineArtGrid, FINE_ART_COLUMNS);
  }

  // Rebuild the active grid if the window crosses the 2/3-column
  // breakpoint while open, so resizing stays evenly distributed.
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (graphicView && graphicView.classList.contains('active')) {
        buildGrid(graphicGrid, GRAPHIC_DESIGN_COLUMNS);
      }
      if (fineArtView && fineArtView.classList.contains('active')) {
        buildGrid(fineArtGrid, FINE_ART_COLUMNS);
      }
    }, 200);
  });

  bubbles.forEach(function (b) {
    b.addEventListener('click', function () {
      showView(b.dataset.view);
    });
  });
}());
// ══════════════════════════════════════════════
// GAME MODE — walk a character around a glowing
// starfield of "portals," one per home page project.
// Hold inside a portal to warp to that project's page.
// Collect signal shards along the way for a bit of a
// goal, with sound and a parallax starfield to make it
// feel more like an actual mini-game.
// Only runs on the home page, where these elements exist.
// ══════════════════════════════════════════════
(function () {
  var toggleBtn = document.getElementById('gameModeBtn');
  var overlay = document.getElementById('gameOverlay');
  var world = document.getElementById('gameWorld');
  var exitBtn = document.getElementById('gameExitBtn');
  var muteBtn = document.getElementById('gameMuteBtn');
  var muteIcon = document.getElementById('gameMuteIcon');
  var characterEl = document.getElementById('gameCharacter');
  var flashEl = document.getElementById('gamePortalFlash');
  var controls = document.getElementById('gameControls');
  var hudLabel = document.getElementById('gameHudLabel');
  var toast = document.getElementById('gameToast');
  var starsNear = overlay ? overlay.querySelector('.game-stars') : null;
  var starsFar = overlay ? overlay.querySelector('.game-stars-2') : null;
  if (!toggleBtn || !overlay || !world || !characterEl) return;

  // Each portal/shard is colored from this list, cycling if
  // there are more projects than colors.
  var PORTAL_COLORS = ['#009fd4', '#d38900', '#1ec857', '#ff4fd8', '#a98bff'];

  // Build the portal list straight from the homepage thumbnails, so
  // game mode always matches whatever projects are on the page. Prefer
  // the thumbnail's actual link (the real navigation target) over its
  // data-href, in case the two ever disagree.
  var projects = [];
  document.querySelectorAll('.home-thumb').forEach(function (el, i) {
    var img = el.querySelector('img');
    var titleEl = el.querySelector('.thumb-title');
    var link = el.querySelector('a');
    projects.push({
      href: (link && link.getAttribute('href')) || el.getAttribute('data-href') || '#',
      title: titleEl ? titleEl.textContent : 'Project',
      img: img ? img.getAttribute('src') : '',
      color: PORTAL_COLORS[i % PORTAL_COLORS.length]
    });
  });

  // Keep portals clear of the HUD (top) and D-pad (bottom), as
  // percentages of the play area.
  var PLAY_MIN_X = 14, PLAY_MAX_X = 86;
  var PLAY_MIN_Y = 24, PLAY_MAX_Y = 78;

  var portalNodes = [];
  var shardNodes = [];
  var SHARD_COUNT = 8;
  var shardsCollected = 0;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  // ── SOUND (small synthesized blips — no audio files needed) ──
  var audioCtx = null;
  var isMuted = false; // always starts unmuted; toggle only affects the current visit

  function updateMuteBtn() {
    if (muteIcon) muteIcon.src = isMuted ? 'images/game/mute.png' : 'images/game/notMute.png';
  }
  updateMuteBtn();

  function ensureAudio() {
    if (audioCtx) return;
    var AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioCtor) audioCtx = new AudioCtor();
  }

  function tone(freq, dur, type, delay, peak) {
    if (isMuted || !audioCtx) return;
    var t0 = audioCtx.currentTime + (delay || 0);
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peak || 0.14, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  function playOpenSound() { tone(440, 0.1, 'sine', 0, 0.08); tone(660, 0.12, 'sine', 0.05, 0.08); }
  function playCollectSound() { tone(880, 0.12, 'triangle', 0, 0.12); tone(1320, 0.14, 'triangle', 0.06, 0.1); }
  function playChargeStartSound() { tone(240, 0.08, 'square', 0, 0.05); }
  function playEnterSound() {
    if (isMuted || !audioCtx) return;
    var t0 = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t0);
    osc.frequency.exponentialRampToValueAtTime(1200, t0 + 0.7);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(0.12, t0 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.75);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.8);
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', function () {
      isMuted = !isMuted;
      updateMuteBtn();
    });
  }

  // ── TOAST ──
  var toastTimer = null;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }

  // ── PORTALS: laid out evenly around a circle, each drifting on its
  // own slow independent wave so the layout feels alive ──
  function layoutPortals() {
    world.querySelectorAll('.game-portal').forEach(function (n) { n.remove(); });
    portalNodes = [];

    var count = projects.length;
    if (!count) return;

    var centerX = (PLAY_MIN_X + PLAY_MAX_X) / 2;
    var centerY = (PLAY_MIN_Y + PLAY_MAX_Y) / 2;
    var radiusX = (PLAY_MAX_X - PLAY_MIN_X) / 2;
    var radiusY = (PLAY_MAX_Y - PLAY_MIN_Y) / 2;

    projects.forEach(function (project, i) {
      var angle = -Math.PI / 2 + (i * (2 * Math.PI / count));
      var x = centerX + Math.cos(angle) * radiusX;
      var y = centerY + Math.sin(angle) * radiusY;

      var node = document.createElement('div');
      node.className = 'game-portal';
      node.style.left = x + '%';
      node.style.top = y + '%';
      node.style.setProperty('--portal-color', project.color);
      node.innerHTML =
        '<div class="game-portal-backing"></div>' +
        '<div class="game-portal-charge"></div>' +
        '<div class="game-portal-ring"></div>' +
        '<div class="game-portal-ring game-portal-ring-2"></div>' +
        '<div class="game-portal-thumb"><img src="' + project.img + '" alt=""></div>' +
        '<div class="game-portal-label">' + project.title + '</div>';
      world.appendChild(node);

      portalNodes.push({
        el: node,
        href: project.href,
        color: project.color,
        baseXPct: x,
        baseYPct: y,
        driftAmpX: 22 + Math.random() * 16,
        driftAmpY: 22 + Math.random() * 16,
        driftSpeedX: 0.35 + Math.random() * 0.3,
        driftSpeedY: 0.35 + Math.random() * 0.3,
        driftPhaseX: Math.random() * Math.PI * 2,
        driftPhaseY: Math.random() * Math.PI * 2
      });
    });
  }

  // Nudges every portal along its drift wave. Positions are written in
  // px (not %) so they line up exactly with the px math collision
  // detection uses.
  function driftPortals(nowSeconds) {
    var minX = worldSize.width * (PLAY_MIN_X / 100);
    var maxX = worldSize.width * (PLAY_MAX_X / 100);
    var minY = worldSize.height * (PLAY_MIN_Y / 100);
    var maxY = worldSize.height * (PLAY_MAX_Y / 100);

    portalNodes.forEach(function (p) {
      if (p.el.classList.contains('is-active')) return;
      var baseX = worldSize.width * (p.baseXPct / 100);
      var baseY = worldSize.height * (p.baseYPct / 100);
      var x = baseX + Math.sin(nowSeconds * p.driftSpeedX + p.driftPhaseX) * p.driftAmpX;
      var y = baseY + Math.cos(nowSeconds * p.driftSpeedY + p.driftPhaseY) * p.driftAmpY;
      p.el.style.left = clamp(x, minX, maxX) + 'px';
      p.el.style.top = clamp(y, minY, maxY) + 'px';
    });
  }

  // ── COLLECTIBLE SIGNAL SHARDS ──
  function placeShards() {
    world.querySelectorAll('.game-shard').forEach(function (n) { n.remove(); });
    shardNodes = [];
    shardsCollected = 0;
    updateHudLabel();

    var placed = [];
    for (var i = 0; i < SHARD_COUNT; i++) {
      var x, y, tooClose, attempts = 0;
      do {
        x = PLAY_MIN_X + Math.random() * (PLAY_MAX_X - PLAY_MIN_X);
        y = PLAY_MIN_Y + Math.random() * (PLAY_MAX_Y - PLAY_MIN_Y);
        tooClose = false;
        // Keep clear of the character's starting point (center) and of
        // every portal's base position, so shards don't spawn on top of
        // something else and are actually visible to walk toward.
        if (distance(x, y, 50, 50) < 14) tooClose = true;
        portalNodes.forEach(function (p) {
          if (distance(x, y, p.baseXPct, p.baseYPct) < 14) tooClose = true;
        });
        placed.forEach(function (pos) {
          if (distance(x, y, pos.x, pos.y) < 10) tooClose = true;
        });
        attempts++;
      } while (tooClose && attempts < 30);

      placed.push({ x: x, y: y });

      var node = document.createElement('div');
      node.className = 'game-shard';
      node.style.left = x + '%';
      node.style.top = y + '%';
      node.style.animationDelay = (Math.random() * 1.5) + 's';
      world.appendChild(node);
      shardNodes.push({ el: node, collected: false });
    }
  }

  function updateHudLabel() {
    if (!hudLabel) return;
    hudLabel.textContent = 'SIGNALS ' + shardsCollected + ' / ' + SHARD_COUNT;
  }

  function updateShardCollisions() {
    for (var i = 0; i < shardNodes.length; i++) {
      var shard = shardNodes[i];
      if (shard.collected) continue;
      var sx = shard.el.offsetLeft, sy = shard.el.offsetTop;
      if (distance(charX, charY, sx, sy) < 26) {
        shard.collected = true;
        shard.el.classList.add('is-collected');
        (function (el) { setTimeout(function () { el.remove(); }, 420); })(shard.el);
        shardsCollected++;
        updateHudLabel();
        playCollectSound();
        if (shardsCollected === SHARD_COUNT) {
          showToast('ALL SIGNALS RECOVERED ⚡');
        }
      }
    }
  }

  // ── CHARACTER TRAIL ──
  var lastTrailTime = 0;
  function spawnTrailDot() {
    var dot = document.createElement('div');
    dot.className = 'game-trail-dot';
    dot.style.left = charX + 'px';
    dot.style.top = charY + 'px';
    world.insertBefore(dot, characterEl);
    setTimeout(function () { dot.remove(); }, 520);
  }

  // ── CHARACTER MOVEMENT ──
  var worldSize = { width: 0, height: 0 };
  var charX = 0, charY = 0; // character's center, in px relative to game-world
  var CHAR_SPEED = 260;     // px per second
  // Read from the actual rendered element rather than hardcoding a
  // pixel value, so shrinking the character in a mobile media query
  // can't drift out of sync with the movement/collision math.
  var CHAR_RADIUS = 39;

  var keysDown = { up: false, down: false, left: false, right: false };
  var rafId = null;
  var lastFrame = 0;
  var isTransitioning = false;

  // Portal charge-to-enter: standing inside a portal briefly "charges"
  // it (shown as a filling ring) rather than warping the instant you
  // touch it, so entering feels like a deliberate action.
  var chargingPortal = null;
  var chargeStartMs = 0;
  var CHARGE_MS = 550;

  function measureWorld() {
    var rect = world.getBoundingClientRect();
    worldSize.width = rect.width;
    worldSize.height = rect.height;
    // characterEl.offsetWidth reflects whatever size the current
    // breakpoint's CSS gives it, so this stays correct at any screen size.
    if (characterEl.offsetWidth) CHAR_RADIUS = characterEl.offsetWidth / 2;
  }

  function resetCharacter() {
    measureWorld();
    charX = worldSize.width / 2;
    charY = worldSize.height / 2;
    renderCharacter();
  }

  function renderCharacter() {
    characterEl.style.left = (charX - CHAR_RADIUS) + 'px';
    characterEl.style.top = (charY - CHAR_RADIUS) + 'px';
  }

  function updateParallax() {
    if (!starsNear && !starsFar) return;
    var offX = -(charX - worldSize.width / 2) * 0.05;
    var offY = -(charY - worldSize.height / 2) * 0.05;
    if (starsFar) starsFar.style.transform = 'translate(' + (offX * 0.6) + 'px,' + (offY * 0.6) + 'px)';
    if (starsNear) starsNear.style.transform = 'translate(' + offX + 'px,' + offY + 'px)';
  }

  function clearCharge() {
    if (chargingPortal) {
      chargingPortal.el.classList.remove('is-charging');
      chargingPortal.el.style.setProperty('--charge', 0);
    }
    chargingPortal = null;
  }

  function updatePortalProximity(nowMs) {
    var nearest = null;
    var nearestDist = Infinity;

    for (var i = 0; i < portalNodes.length; i++) {
      var portal = portalNodes[i];
      if (portal.el.classList.contains('is-active')) continue;
      var px = portal.el.offsetLeft, py = portal.el.offsetTop;
      var hitRadius = (portal.el.offsetWidth * 0.4) + (CHAR_RADIUS * 0.6);
      var dist = distance(charX, charY, px, py);
      if (dist < hitRadius && dist < nearestDist) {
        nearest = portal;
        nearestDist = dist;
      }
    }

    if (nearest) {
      if (chargingPortal !== nearest) {
        clearCharge();
        chargingPortal = nearest;
        chargeStartMs = nowMs;
        nearest.el.classList.add('is-charging');
        playChargeStartSound();
      }
      var progress = clamp((nowMs - chargeStartMs) / CHARGE_MS, 0, 1);
      nearest.el.style.setProperty('--charge', progress);
      if (progress >= 1) enterPortal(nearest);
    } else if (chargingPortal) {
      clearCharge();
    }
  }

  function step(now) {
    if (!lastFrame) lastFrame = now;
    // Cap the delta so a tab-switch pause doesn't fling the character.
    var dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    if (!isTransitioning) {
      driftPortals(now / 1000);

      var dx = (keysDown.right ? 1 : 0) - (keysDown.left ? 1 : 0);
      var dy = (keysDown.down ? 1 : 0) - (keysDown.up ? 1 : 0);

      if (dx || dy) {
        // Normalize so diagonal movement isn't faster than straight movement.
        var len = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / len) * CHAR_SPEED * dt;
        dy = (dy / len) * CHAR_SPEED * dt;

        var minX = worldSize.width * (PLAY_MIN_X / 100);
        var maxX = worldSize.width * (PLAY_MAX_X / 100);
        var minY = worldSize.height * (PLAY_MIN_Y / 100);
        var maxY = worldSize.height * (PLAY_MAX_Y / 100);

        charX = clamp(charX + dx, minX, maxX);
        charY = clamp(charY + dy, minY, maxY);

        characterEl.classList.add('is-moving');
        if (dx < 0) characterEl.classList.add('face-left');
        else if (dx > 0) characterEl.classList.remove('face-left');

        renderCharacter();

        if (now - lastTrailTime > 80) {
          spawnTrailDot();
          lastTrailTime = now;
        }
      } else {
        characterEl.classList.remove('is-moving');
      }

      updateParallax();
      updateShardCollisions();
      updatePortalProximity(now);
    }

    rafId = requestAnimationFrame(step);
  }

  function enterPortal(portal) {
    if (isTransitioning) return;
    isTransitioning = true;

    portal.el.classList.remove('is-charging');
    portal.el.classList.add('is-active');
    characterEl.classList.add('is-warping');
    playEnterSound();

    flashEl.style.setProperty('--flash-x', portal.el.style.left);
    flashEl.style.setProperty('--flash-y', portal.el.style.top);
    flashEl.style.setProperty('--portal-color', portal.color);
    flashEl.classList.add('is-flashing');

    setTimeout(function () {
      window.location.href = portal.href;
    }, 780);
  }

  // ── INPUT: KEYBOARD ──
  var KEY_MAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right'
  };

  function onKeyDown(e) {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeGameMode();
      return;
    }
    var dir = KEY_MAP[e.key];
    if (dir) {
      keysDown[dir] = true;
      e.preventDefault();
    }
  }

  function onKeyUp(e) {
    var dir = KEY_MAP[e.key];
    if (dir) keysDown[dir] = false;
  }

  // ── INPUT: ON-SCREEN ARROW PAD ──
  // A single tap/click moves a fixed step (this is what a keyboard
  // Enter/Space press or a screen reader's "activate" gesture actually
  // fires — neither produces a mousedown/touchstart, so without this
  // the pad would be completely unusable without a mouse or finger).
  // Holding it down (real touch or mouse) still moves continuously via
  // the main loop, same as before.
  var STEP_PX = 46;

  function stepInDirection(dir) {
    var minX = worldSize.width * (PLAY_MIN_X / 100);
    var maxX = worldSize.width * (PLAY_MAX_X / 100);
    var minY = worldSize.height * (PLAY_MIN_Y / 100);
    var maxY = worldSize.height * (PLAY_MAX_Y / 100);

    if (dir === 'up') charY = clamp(charY - STEP_PX, minY, maxY);
    else if (dir === 'down') charY = clamp(charY + STEP_PX, minY, maxY);
    else if (dir === 'left') charX = clamp(charX - STEP_PX, minX, maxX);
    else if (dir === 'right') charX = clamp(charX + STEP_PX, minX, maxX);

    renderCharacter();
  }

  function bindPadButton(btn) {
    var dir = btn.dataset.dir;

    function press(e) {
      e.preventDefault(); // also suppresses the synthetic click a real touch would otherwise fire
      keysDown[dir] = true;
      btn.classList.add('is-pressed');
      btn.setAttribute('aria-pressed', 'true');
    }
    function release() {
      keysDown[dir] = false;
      btn.classList.remove('is-pressed');
      btn.setAttribute('aria-pressed', 'false');
    }

    btn.addEventListener('mousedown', press);
    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('mouseup', release);
    btn.addEventListener('mouseleave', release);
    btn.addEventListener('touchend', release);
    btn.addEventListener('touchcancel', release);
    // Fires for keyboard activation and screen readers; harmless no-op
    // extra nudge for a quick real click, since press() already
    // suppressed the touch case above.
    btn.addEventListener('click', function () { stepInDirection(dir); });
  }

  if (controls) {
    controls.querySelectorAll('.game-pad-btn').forEach(bindPadButton);
  }

  // Safety net: if a press event's matching release never arrives —
  // the tab loses focus, an app switch interrupts a touch, etc. — the
  // character could otherwise get stuck moving indefinitely.
  function releaseAllDirections() {
    keysDown = { up: false, down: false, left: false, right: false };
    if (controls) {
      controls.querySelectorAll('.game-pad-btn').forEach(function (b) {
        b.classList.remove('is-pressed');
        b.setAttribute('aria-pressed', 'false');
      });
    }
  }
  window.addEventListener('blur', releaseAllDirections);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) releaseAllDirections();
  });

  // ── OPEN / CLOSE ──
  function openGameMode() {
    ensureAudio();
    playOpenSound();

    // Anchor the portal-opening transition on the button that was clicked.
    var btnRect = toggleBtn.getBoundingClientRect();
    overlay.style.setProperty('--origin-x', (btnRect.left + btnRect.width / 2) + 'px');
    overlay.style.setProperty('--origin-y', (btnRect.top + btnRect.height / 2) + 'px');

    layoutPortals();
    isTransitioning = false;
    keysDown = { up: false, down: false, left: false, right: false };
    flashEl.classList.remove('is-flashing');
    characterEl.classList.remove('is-warping', 'is-moving', 'face-left');
    clearCharge();
    if (toast) toast.classList.remove('is-visible');

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('game-mode-active');

    requestAnimationFrame(function () {
      resetCharacter();
      placeShards();
      lastFrame = 0;
      lastTrailTime = 0;
      if (!rafId) rafId = requestAnimationFrame(step);
    });
  }

  function closeGameMode() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('game-mode-active');
    keysDown = { up: false, down: false, left: false, right: false };
    clearCharge();
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  toggleBtn.addEventListener('click', openGameMode);
  if (exitBtn) exitBtn.addEventListener('click', closeGameMode);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  window.addEventListener('resize', function () {
    if (!overlay.classList.contains('is-open')) return;
    var oldW = worldSize.width, oldH = worldSize.height;
    measureWorld();
    // Keep the character's relative position stable across a resize.
    if (oldW && oldH) {
      charX = charX * (worldSize.width / oldW);
      charY = charY * (worldSize.height / oldH);
      renderCharacter();
    }
    layoutPortals();
    placeShards();
  });
})();

// ── HERO SVG (heroHome.svg / homeHeroVertical.svg): pinned scroll-jack — expands + dissolves into the project content ──
(function () {
  var hero = document.getElementById('homeHero');
  if (!hero) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  // Ask the DOM which composition CSS is actually showing, rather than
  // duplicating the breakpoint's pixel value here — CSS's media query is
  // the single source of truth, so this can't drift out of sync with it
  // (which is exactly what happened when that breakpoint got retuned and
  // this hardcoded number didn't follow).
  var horizEl = document.querySelector('.hero-svg-horizontal');
  var vertEl  = document.querySelector('.hero-svg-vertical');
  var isNarrow = !!(vertEl && getComputedStyle(vertEl).display !== 'none');
  var heroSvg = isNarrow ? vertEl : horizEl;
  if (!heroSvg) return;

  var MAX_SCALE  = 2.6;  // how large the artwork grows by the end
  var MAX_BLUR   = 10;   // px, dissolve blur that kicks in near the end
  var START_Y    = 36;   // px, hero sits lower than center at rest
  var MAX_LIFT   = 70;   // px, total upward travel from START_Y by the end
  var MAX_ROTATE = 1.6;  // deg, subtle organic twist
  var DISTANCE   = 800;  // px of accumulated scroll delta to play through fully

  var target = 0;    // 0..1 — where the input wants the sequence to be
  var shown  = 0;     // 0..1 — smoothed value actually rendered each frame
  var locked = true;  // true while we're intercepting scroll to drive the hero
  var rafId  = null;

  // Every layer in the hero breaks off and flies apart independently as
  // it expands — nothing just rides along with the uniform scale. delay/span stagger each layer within the overall 0..1 progress; damp
  // gives each one its own lag/weight (lower = heavier/slower to catch
  // up, higher = lighter/snappier); arc bows the path into a swoop
  // instead of a straight line (sign flips the curve direction).
  var BREAK_LAYERS_HORIZONTAL = [
    { id: 'grainLeft',           dx: -180, dy:   80, rot: -12,  scaleToX: 1.05, scaleToY: 1.05, arc:  40,  delay: 0.00, span: 0.9,  damp: 0.07  },
    { id: 'grainRight',          dx:  180, dy:  -80, rot:  12,  scaleToX: 1.05, scaleToY: 1.05, arc: -40,  delay: 0.02, span: 0.9,  damp: 0.075 },
    { id: 'greenRectangle',      dx: -260, dy: -130, rot: -34,  scaleToX: 1.22, scaleToY: 1.14, arc:  90,  delay: 0.02, span: 0.85, damp: 0.09  },
    { id: 'pinkRectangle',       dx:  280, dy:  180, rot:  30,  scaleToX: 1.22, scaleToY: 1.14, arc: -90,  delay: 0.03, span: 0.85, damp: 0.095 },
    { id: 'blueRectangleLeft',   dx: -320, dy:  150, rot:  26,  scaleToX: 1.08, scaleToY: 1.18, arc: -70,  delay: 0.05, span: 0.85, damp: 0.1   },
    { id: 'blueRectangleRight',  dx:  300, dy: -160, rot: -24,  scaleToX: 1.08, scaleToY: 1.16, arc:  80,  delay: 0.08, span: 0.85, damp: 0.1   },
    { id: 'alina',               dx: -220, dy:  140, rot:  -8,  scaleToX: 1.1,  scaleToY: 1.1,  arc:  50,  delay: 0.07, span: 0.85, damp: 0.08  },
    { id: 'xie',                 dx:  220, dy:  160, rot:   8,  scaleToX: 1.1,  scaleToY: 1.1,  arc: -50,  delay: 0.1,  span: 0.85, damp: 0.085 },
    { id: 'heroArtLeft',         dx: -240, dy:   60, rot: -10,  scaleToX: 1.12, scaleToY: 1.12, arc:  70,  delay: 0.12, span: 0.8,  damp: 0.09  },
    { id: 'blueLongRectangle',   dx:    0, dy:  240, rot:  40,  scaleToX: 1.3,  scaleToY: 1.08, arc:  60,  delay: 0.14, span: 0.8,  damp: 0.085 },
    { id: 'heroArtRight',        dx:  240, dy:  -60, rot:  10,  scaleToX: 1.12, scaleToY: 1.12, arc: -70,  delay: 0.15, span: 0.8,  damp: 0.095 },
    { id: 'subText',             dx:  200, dy:  200, rot:   6,  scaleToX: 1.05, scaleToY: 1.05, arc: -60,  delay: 0.15, span: 0.8,  damp: 0.1   },
    { id: 'checkered',           dx: -160, dy:  260, rot: -55,  scaleToX: 1.15, scaleToY: 1.25, arc: -110, delay: 0.17, span: 0.75, damp: 0.11  },
    { id: 'greenStar',           dx:  190, dy: -230, rot:  160, scaleToX: 1.35, scaleToY: 1.25, arc:  130, delay: 0.2,  span: 0.7,  damp: 0.16  },
    { id: 'blueStar',            dx:  250, dy:  -70, rot: -190, scaleToX: 1.25, scaleToY: 1.35, arc: -150, delay: 0.24, span: 0.7,  damp: 0.17  },
    { id: 'whileStar',           dx:  120, dy: -290, rot:  240, scaleToX: 1.4,  scaleToY: 1.3,  arc:  170, delay: 0.28, span: 0.7,  damp: 0.18  }
  ];

  // Same system, ported to homeHeroVertical.svg's own elements — dx/dy
  // point outward from that composition's own center instead of reusing
  // the horizontal layout's directions.
  var BREAK_LAYERS_VERTICAL = [
    { id: 'grainLeftV',          dx: -150, dy:   60, rot: -10,  scaleToX: 1.05, scaleToY: 1.05, arc:  35,  delay: 0.00, span: 0.9,  damp: 0.07  },
    { id: 'grainRightV',         dx:  150, dy:  -60, rot:  10,  scaleToX: 1.05, scaleToY: 1.05, arc: -35,  delay: 0.02, span: 0.9,  damp: 0.075 },
    { id: 'greenRectangleV',     dx: -180, dy: -215, rot: -30,  scaleToX: 1.2,  scaleToY: 1.15, arc:  80,  delay: 0.00, span: 0.85, damp: 0.09  },
    { id: 'pinkRectangleV',      dx:  250, dy:  120, rot:  25,  scaleToX: 1.2,  scaleToY: 1.14, arc: -75,  delay: 0.03, span: 0.85, damp: 0.095 },
    { id: 'blackRectangleLeft',  dx: -210, dy:  180, rot:  24,  scaleToX: 1.1,  scaleToY: 1.18, arc: -70,  delay: 0.05, span: 0.85, damp: 0.1   },
    { id: 'blackRectangleRight', dx:  145, dy: -235, rot: -22,  scaleToX: 1.1,  scaleToY: 1.16, arc:  65,  delay: 0.08, span: 0.85, damp: 0.1   },
    { id: 'alinaV',              dx: -190, dy: -205, rot:  -8,  scaleToX: 1.1,  scaleToY: 1.1,  arc:  50,  delay: 0.07, span: 0.85, damp: 0.08  },
    { id: 'xieV',                dx:  210, dy:  130, rot:   8,  scaleToX: 1.1,  scaleToY: 1.1,  arc: -55,  delay: 0.1,  span: 0.85, damp: 0.085 },
    { id: 'heroArtLeftV',        dx: -200, dy:   50, rot:  -9,  scaleToX: 1.12, scaleToY: 1.12, arc:  60,  delay: 0.12, span: 0.8,  damp: 0.09  },
    { id: 'blackLongRectangle',  dx:  140, dy:  240, rot:  35,  scaleToX: 1.25, scaleToY: 1.08, arc:  55,  delay: 0.14, span: 0.8,  damp: 0.085 },
    { id: 'heroArtRightV',       dx:  200, dy:  -50, rot:   9,  scaleToX: 1.12, scaleToY: 1.12, arc: -60,  delay: 0.15, span: 0.8,  damp: 0.095 },
    { id: 'graphicWeb',          dx:  150, dy:  235, rot:   6,  scaleToX: 1.05, scaleToY: 1.05, arc: -50,  delay: 0.15, span: 0.8,  damp: 0.1   },
    { id: 'designer',            dx:  165, dy:  230, rot:   7,  scaleToX: 1.05, scaleToY: 1.05, arc: -55,  delay: 0.18, span: 0.8,  damp: 0.105 },
    { id: 'blackCheckered',      dx: -115, dy: -250, rot: -45,  scaleToX: 1.15, scaleToY: 1.22, arc: -90,  delay: 0.17, span: 0.75, damp: 0.11  },
    { id: 'greenStarV',          dx:  170, dy:  190, rot:  170, scaleToX: 1.3,  scaleToY: 1.25, arc:  110, delay: 0.2,  span: 0.7,  damp: 0.16  },
    { id: 'blueStarV',           dx:  190, dy:  230, rot: -195, scaleToX: 1.25, scaleToY: 1.32, arc: -130, delay: 0.24, span: 0.7,  damp: 0.17  },
    { id: 'whileStarV',          dx:  150, dy:  200, rot:  230, scaleToX: 1.35, scaleToY: 1.28, arc:  140, delay: 0.28, span: 0.7,  damp: 0.18  }
  ];

  var BREAK_LAYERS = isNarrow ? BREAK_LAYERS_VERTICAL : BREAK_LAYERS_HORIZONTAL;
  var breakEls = BREAK_LAYERS.map(function (layer) {
    var len = Math.sqrt(layer.dx * layer.dx + layer.dy * layer.dy) || 1;
    return {
      el: document.getElementById(layer.id),
      cfg: layer,
      cur: 0,
      perpX: -layer.dy / len, // unit vector perpendicular to the flight
      perpY:  layer.dx / len  // path, used to bow it into a swoop
    };
  }).filter(function (l) { return !!l.el; });

  // Give the entrance animations (slide-in / twist-in) time to finish
  // before handing these layers over to scroll-driven break-apart motion,
  // so there's no visual pop mid-entrance.
  var breakAwayReady = false;
  setTimeout(function () {
    breakAwayReady = true;
    heroSvg.classList.add('hero-break');
    requestRender();
  }, 3000);

  // Gentle spring overshoot — shapes ease past their resting offset by a
  // touch before settling, instead of stopping dead.
  function easeOutBack(t) {
    var c1 = 1.12, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function updateBreakLayers(p) {
    if (!breakAwayReady) return true;
    var settled = true;
    breakEls.forEach(function (l) {
      var localTarget = clamp((p - l.cfg.delay) / l.cfg.span, 0, 1);
      var targetEased = easeOutBack(localTarget);
      l.cur += (targetEased - l.cur) * l.cfg.damp;
      if (Math.abs(targetEased - l.cur) < 0.0008) l.cur = targetEased;
      else settled = false;

      var e = l.cur;
      var t = clamp(e, 0, 1);
      // Bow the straight-line offset into a swoop: the bulge peaks at the
      // midpoint of the flight and returns to zero by the end, so the
      // shape still lands exactly on dx/dy but arrives via a curve.
      var arc = Math.sin(t * Math.PI) * l.cfg.arc;
      var bx = e * l.cfg.dx + arc * l.perpX;
      var by = e * l.cfg.dy + arc * l.perpY;

      l.el.style.setProperty('--bx', bx.toFixed(1) + 'px');
      l.el.style.setProperty('--by', by.toFixed(1) + 'px');
      l.el.style.setProperty('--brot', (e * l.cfg.rot).toFixed(1) + 'deg');
      l.el.style.setProperty('--bscaleX', (1 + e * (l.cfg.scaleToX - 1)).toFixed(3));
      l.el.style.setProperty('--bscaleY', (1 + e * (l.cfg.scaleToY - 1)).toFixed(3));
    });
    return settled;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lockScroll()   { document.documentElement.classList.add('hero-scroll-locked'); }
  function unlockScroll() { document.documentElement.classList.remove('hero-scroll-locked'); }

  function render() {
    rafId = null;
    shown += (target - shown) * 0.15;
    if (Math.abs(target - shown) < 0.0006) shown = target;

    var p = shown;
    // Opacity holds through the first third (so the expand motion reads
    // clearly) then eases out over the rest of the sequence.
    var eased = p < 0.32 ? 1 : 1 - Math.pow((p - 0.32) / 0.68, 1.35);
    var opacity = clamp(eased, 0, 1);
    var scale = 1 + p * (MAX_SCALE - 1);
    var blur  = p > 0.55 ? ((p - 0.55) / 0.45) * MAX_BLUR : 0;
    var posY  = START_Y - p * MAX_LIFT;
    var rotate = p * MAX_ROTATE;

    heroSvg.style.transform = 'translateY(' + posY.toFixed(2) + 'px) scale(' + scale.toFixed(4) + ') rotate(' + rotate.toFixed(3) + 'deg)';
    heroSvg.style.filter = blur > 0.05 ? 'blur(' + blur.toFixed(2) + 'px)' : '';
    hero.style.opacity = opacity.toFixed(4);
    var layersSettled = updateBreakLayers(p);

    if (p >= 0.999 && locked) {
      // Fully expanded and dissolved — hand scrolling back to the page.
      locked = false;
      unlockScroll();
    }
    if (p <= 0.001 && locked && window.homeStripShowHero) {
      // Fully reversed back to the intro — make sure the dot nav agrees.
      window.homeStripShowHero();
    }

    // Keep animating while the master value is catching up, or while any
    // break-apart layer is still settling into place (their own lag can
    // outlast the master's).
    if (shown !== target || !layersSettled) rafId = requestAnimationFrame(render);
  }

  function requestRender() { if (!rafId) rafId = requestAnimationFrame(render); }
  function setTarget(next) { target = clamp(next, 0, 1); requestRender(); }

  function onWheel(e) {
    if (locked) {
      e.preventDefault();
      setTarget(target + e.deltaY / DISTANCE);
    } else if (window.scrollY <= 0 && e.deltaY < 0) {
      // Scrolled back to the very top — recapture and reverse the intro.
      e.preventDefault();
      locked = true;
      lockScroll();
      setTarget(target + e.deltaY / DISTANCE);
    }
  }

  var touchY = 0;
  function onTouchStart(e) { touchY = e.touches[0].clientY; }
  function onTouchMove(e) {
    var y = e.touches[0].clientY;
    var delta = touchY - y; // finger moving up == scrolling down
    if (locked) {
      e.preventDefault();
      setTarget(target + delta / DISTANCE);
      touchY = y;
    } else if (window.scrollY <= 0 && delta < 0) {
      e.preventDefault();
      locked = true;
      lockScroll();
      setTarget(target + delta / DISTANCE);
      touchY = y;
    }
  }

  var FORWARD_KEYS  = { ArrowDown: 1, PageDown: 1, ' ': 1, Spacebar: 1 };
  var BACKWARD_KEYS = { ArrowUp: 1, PageUp: 1 };
  function onKeydown(e) {
    if (locked && FORWARD_KEYS[e.key]) {
      e.preventDefault();
      setTarget(target + 0.16);
    } else if (locked && BACKWARD_KEYS[e.key]) {
      e.preventDefault();
      setTarget(target - 0.16);
    } else if (!locked && window.scrollY <= 0 && BACKWARD_KEYS[e.key]) {
      e.preventDefault();
      locked = true;
      lockScroll();
      setTarget(target - 0.16);
    }
  }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('keydown', onKeydown);

  // Let other homepage scripts (dot nav) jump the intro forward/back
  // instantly when they jump the page around programmatically.
  window.heroIntroSkip = function () {
    if (!locked) return;
    locked = false;
    target = 1;
    shown = 1;
    unlockScroll();
    render();
  };
  window.heroIntroReset = function () {
    locked = true;
    target = 0;
    shown = 0;
    lockScroll();
    render();
  };

  // Arriving via an anchor straight to the project content — e.g. the
  // project pages' "back to projects" link, index.html#homeScrollStrip —
  // should land there directly instead of showing the pinned hero intro.
  // Our own scroll lock (below) would otherwise block the browser's
  // native scroll-to-anchor before it gets a chance to run, so detect
  // this case up front and skip the intro instead of locking.
  var jumpHash = window.location.hash.slice(1);
  var jumpTarget = jumpHash && jumpHash !== hero.id ? document.getElementById(jumpHash) : null;

  hero.classList.add('hero-pin-mode');
  if (jumpTarget) {
    locked = false;
    target = 1;
    shown = 1;
    render();
    jumpTarget.scrollIntoView();
  } else {
    lockScroll();
    requestRender();
  }
})();