const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-links');

toggle?.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.querySelector('.sr-only').textContent = isOpen ? 'Cerrar menú' : 'Abrir menú';
});

menu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Abrir menú';
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.classList.contains('open')) {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }
});

const whatsappBase = 'https://wa.me/56933551041';
const formatPrice = (value) => `$${Number(value).toLocaleString('es-CL')}`;

document.querySelectorAll('.dough-picker').forEach((picker) => {
  const card = picker.closest('.dish-card');
  const options = [...picker.querySelectorAll('.dough-option')];
  const price = card.querySelector('.product-price');
  const total = picker.querySelector('.mixed-total');
  const order = card.querySelector('.dough-order');

  const updateOrder = () => {
    const selected = picker.querySelector('.dough-option.selected');
    const dough = selected.dataset.dough;
    const amount = Number(selected.dataset.price);
    price.textContent = formatPrice(amount);
    total.textContent = dough === 'Mixta' ? `Total con masa mixta: ${formatPrice(amount)}` : '';
    const message = `Hola, quiero pedir 1 ${picker.dataset.product}.\n\nMasa: ${dough}\nPrecio: ${formatPrice(amount)}\n\n¿Me pueden confirmar el horario de entrega o retiro?`;
    order.href = `${whatsappBase}?text=${encodeURIComponent(message)}`;
  };

  options.forEach((option) => {
    option.addEventListener('click', () => {
      options.forEach((item) => {
        const selected = item === option;
        item.classList.toggle('selected', selected);
        item.setAttribute('aria-checked', String(selected));
      });
      updateOrder();
    });
  });

  updateOrder();
});

const carousel = document.querySelector('.food-carousel');
if (carousel) {
  const slides = [...carousel.querySelectorAll('.carousel-slide')];
  const dots = carousel.querySelector('.carousel-dots');
  const previous = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let timer;
  let touchStart = 0;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `carousel-dot${index === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Mostrar imagen ${index + 1}`);
    dot.addEventListener('click', () => {
      showSlide(index);
      pauseCarousel();
    });
    dots.appendChild(dot);
  });

  const dotButtons = [...dots.querySelectorAll('.carousel-dot')];
  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
      dotButtons[slideIndex].classList.toggle('active', active);
    });
  };
  const startCarousel = () => {
    if (!reducedMotion) timer = window.setInterval(() => showSlide(current + 1), 4500);
  };
  const pauseCarousel = () => window.clearInterval(timer);

  previous.addEventListener('click', () => { showSlide(current - 1); pauseCarousel(); });
  next.addEventListener('click', () => { showSlide(current + 1); pauseCarousel(); });
  carousel.addEventListener('mouseenter', pauseCarousel);
  carousel.addEventListener('focusin', pauseCarousel);
  carousel.addEventListener('touchstart', (event) => { touchStart = event.changedTouches[0].clientX; pauseCarousel(); }, { passive: true });
  carousel.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 45) showSlide(current + (distance < 0 ? 1 : -1));
  }, { passive: true });
  startCarousel();
}

const bowlBuilder = document.querySelector('.bowl-builder');
if (bowlBuilder) {
  const proteins = [...bowlBuilder.querySelectorAll('.protein-field .choice-button')];
  const mayos = [...bowlBuilder.querySelectorAll('.mayo-option')];
  const counter = bowlBuilder.querySelector('.mayo-count');
  const error = bowlBuilder.querySelector('.bowl-error');
  const order = bowlBuilder.querySelector('.bowl-order');
  const updateBowlOrder = () => {
    const protein = bowlBuilder.querySelector('.protein-field .choice-button.selected');
    const selectedMayos = mayos.filter((item) => item.classList.contains('selected'));
    if (!protein || selectedMayos.length !== 2) {
      order.href = whatsappBase;
      return;
    }
    const mayoNames = selectedMayos.map((item) => item.dataset.value);
    const message = `Hola, quiero pedir 1 Bowl de ensalada.\n\nProteína: ${protein.dataset.value}\nMayonesas: ${mayoNames[0]} y ${mayoNames[1]}\nPrecio: $5.500\n\n¿Me pueden confirmar el horario de entrega o retiro?`;
    order.href = `${whatsappBase}?text=${encodeURIComponent(message)}`;
  };

  proteins.forEach((option) => {
    option.addEventListener('click', () => {
      proteins.forEach((item) => {
        const selected = item === option;
        item.classList.toggle('selected', selected);
        item.setAttribute('aria-checked', String(selected));
      });
      error.textContent = '';
      updateBowlOrder();
    });
  });

  mayos.forEach((option) => {
    option.addEventListener('click', () => {
      const isSelected = option.classList.contains('selected');
      const selectedCount = mayos.filter((item) => item.classList.contains('selected')).length;
      if (!isSelected && selectedCount >= 2) {
        error.textContent = 'Ya elegiste 2 mayonesas. Desmarca una para cambiarla.';
        return;
      }
      option.classList.toggle('selected', !isSelected);
      option.setAttribute('aria-pressed', String(!isSelected));
      const count = mayos.filter((item) => item.classList.contains('selected')).length;
      counter.textContent = `${count} de 2 seleccionadas`;
      error.textContent = '';
      updateBowlOrder();
    });
  });

  order.addEventListener('click', (event) => {
    const protein = bowlBuilder.querySelector('.protein-field .choice-button.selected');
    const selectedMayos = mayos.filter((item) => item.classList.contains('selected'));
    if (!protein) {
      event.preventDefault();
      error.textContent = 'Selecciona una proteína para continuar.';
      return;
    }
    if (selectedMayos.length !== 2) {
      event.preventDefault();
      error.textContent = 'Selecciona 2 mayonesas de la casa para continuar.';
      return;
    }
    error.textContent = '';
  });
  updateBowlOrder();
}
