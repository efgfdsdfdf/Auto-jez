// script.js - V2 Ultra Premium

// Initialize Lucide Icons
lucide.createIcons();

// Mock Data
const defaultCars = [{
  id: "1",
  make: "Toyota",
  model: "Land Cruiser 300",
  category: "SUVs",
  condition: "Brand New",
  price: "115,000,000",
  media: ["https://images.unsplash.com/photo-1596700721200-a19db6dfa202?q=80&w=1000&auto=format&fit=crop"],
  image: "https://images.unsplash.com/photo-1596700721200-a19db6dfa202?q=80&w=1000&auto=format&fit=crop",
  specs: ["3.5L V6 Twin-Turbo", "4WD", "Premium Interior"]
}, {
  id: "2",
  make: "Toyota",
  model: "Camry SE",
  category: "Sedans",
  condition: "Foreign Used",
  price: "45,000,000",
  media: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?q=80&w=1000&auto=format&fit=crop"],
  image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?q=80&w=1000&auto=format&fit=crop",
  specs: ["2.5L 4-Cyl", "FWD", "Sport Styling"]
}, {
  id: "3",
  make: "Toyota",
  model: "Hilux Invincible",
  category: "Pickups",
  condition: "Brand New",
  price: "60,000,000",
  media: ["https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=1000&auto=format&fit=crop"],
  image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=1000&auto=format&fit=crop",
  specs: ["2.8L Diesel", "Heavy Duty", "4x4"]
}, {
  id: "4",
  make: "Toyota Genuine",
  model: "Brake Pads (Set)",
  category: "Spare Parts",
  condition: "Brand New",
  price: "150,000",
  media: ["https://images.unsplash.com/photo-1600705608677-48f8045610ec?q=80&w=1000&auto=format&fit=crop"],
  image: "https://images.unsplash.com/photo-1600705608677-48f8045610ec?q=80&w=1000&auto=format&fit=crop",
  specs: ["OEM Part", "High Durability", "Fits Camry & Corolla"]
}, {
  id: "5",
  make: "Toyota",
  model: "Prado TXL",
  category: "SUVs",
  condition: "Locally Used",
  price: "85,000,000",
  media: ["https://images.unsplash.com/photo-1582236592237-7756fbc8a230?q=80&w=1000&auto=format&fit=crop"],
  image: "https://images.unsplash.com/photo-1582236592237-7756fbc8a230?q=80&w=1000&auto=format&fit=crop",
  specs: ["2.7L Petrol", "7 Seater", "Sunroof"]
}, {
  id: "6",
  make: "Toyota",
  model: "V6 Engine Block",
  category: "Spare Parts",
  condition: "Foreign Used",
  price: "3,500,000",
  media: ["https://images.unsplash.com/photo-1580274455050-25816912386e?q=80&w=1000&auto=format&fit=crop"],
  image: "https://images.unsplash.com/photo-1580274455050-25816912386e?q=80&w=1000&auto=format&fit=crop",
  specs: ["Complete Assembly", "Low Mileage", "Tested & Working"]
}];
const WHATSAPP_NUMBER = "2348032654858";
let inventory = [];
let cart = [];
let currentFilter = 'all';

// DOM Elements
const carGrid = document.getElementById('car-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');

// --- Custom Cursor Logic ---
const cursor = document.querySelector('.custom-cursor');
const cursorFollower = document.querySelector('.custom-cursor-follower');
if (cursor && cursorFollower && window.matchMedia("(pointer: fine)").matches) {
  let xTo = gsap.quickTo(cursorFollower, "x", {
    duration: 0.1,
    ease: "power2.out"
  });
  let yTo = gsap.quickTo(cursorFollower, "y", {
    duration: 0.1,
    ease: "power2.out"
  });
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    xTo(e.clientX);
    yTo(e.clientY);
  });
}
function initMagneticCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  const magnetics = document.querySelectorAll('.magnetic, .magnetic-btn, button, a');
  magnetics.forEach(elem => {
    elem.removeEventListener('mouseenter', onMouseEnterMagnetic);
    elem.removeEventListener('mouseleave', onMouseLeaveMagnetic);
    elem.addEventListener('mouseenter', onMouseEnterMagnetic);
    elem.addEventListener('mouseleave', onMouseLeaveMagnetic);
  });
}
function onMouseEnterMagnetic() {
  if (cursor) cursor.classList.add('active');
  if (cursorFollower) cursorFollower.classList.add('active');
}
function onMouseLeaveMagnetic() {
  if (cursor) cursor.classList.remove('active');
  if (cursorFollower) cursorFollower.classList.remove('active');
}

// --- GSAP Animations ---
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Initial Load Animation
  const tl = gsap.timeline();
  tl.fromTo('.navbar', {
    y: -100,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power3.out"
  }).fromTo('.gs-up', {
    y: 50,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.2,
    ease: "power3.out"
  }, "-=0.5").fromTo('.gs-fade', {
    opacity: 0
  }, {
    opacity: 1,
    duration: 1.5,
    ease: "power2.out"
  }, "-=1");

  // Scroll Reveal
  gsap.utils.toArray('.gs-reveal').forEach(function (elem) {
    ScrollTrigger.create({
      trigger: elem,
      start: "top 80%",
      onEnter: function () {
        gsap.fromTo(elem, {
          y: 50,
          opacity: 0
        }, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          overwrite: "auto"
        });
      }
    });
  });
}

// --- 3D Tilt Effect ---
function applyTiltEffect() {
  const cards = document.querySelectorAll('.car-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -10; // max 10 deg
      const rotateY = (x - centerX) / centerX * 10;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
      card.style.transition = "transform 0.5s ease";
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = "none";
    });
  });
}

// --- Core Logic ---
function init() {
  loadInventory().then(() => {
    loadCart();
    renderCars();
    setupEventListeners();

    // UI Enhancements
    setTimeout(() => {
      initMagneticCursor();
      initAnimations();
    }, 100);
  });
}
function loadInventory() {
  return fetch('/api/inventory').then(res => res.json()).then(data => {
    inventory = data;
    if (inventory.length === 0) {
      inventory = defaultCars;
    }
  }).catch(e => {
    console.error("Failed to load inventory from API:", e);
    inventory = defaultCars;
  });
}
function loadCart() {
  const stored = localStorage.getItem('autojez_cart');
  if (stored) cart = JSON.parse(stored);
  updateCartUI();
}
function saveCart() {
  localStorage.setItem('autojez_cart', JSON.stringify(cart));
}
function renderCars() {
  carGrid.innerHTML = '';
  let filteredCars = inventory;
  if (currentFilter === 'Cars') {
    filteredCars = inventory.filter(car => car.category !== 'Spare Parts');
  } else if (currentFilter !== 'all') {
    filteredCars = inventory.filter(car => car.category === currentFilter);
  }
  if (filteredCars.length === 0) {
    carGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No masterpieces found in this category.</p>';
    return;
  }
  filteredCars.forEach((car, index) => {
    const specsHtml = car.specs ? car.specs.slice(0, 2).map(s => `<span class="car-spec-item">${s.trim()}</span>`).join('') : '';
    const thumb = car.media && car.media.length > 0 ? car.media[0] : car.image;
    const card = document.createElement('div');
    card.className = 'car-card magnetic';
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.onclick = () => window.openDetails(car.id);
    const conditionBadgeHtml = car.condition ? `<span class="car-badge condition-badge" style="background: rgba(212,175,55,0.2); border-color: var(--accent-primary); color: #fff;">${car.condition}</span>` : '';
    card.innerHTML = `
            <div class="car-card-inner">
                <div class="car-img-wrapper">
                    <span class="car-badge">${car.category}</span>
                    ${conditionBadgeHtml}
                    <img src="${thumb}" alt="${car.make} ${car.model}" class="car-img" onerror="this.src='https://via.placeholder.com/600x400?text=Image+Not+Found'">
                </div>
                <div class="car-details">
                    <h3 class="car-title">${car.make} <br><strong>${car.model}</strong></h3>
                    <div class="car-specs-list">
                        ${specsHtml}
                    </div>
                    <div class="car-price-row">
                        <span class="car-price">₦${car.price}</span>
                        <button class="btn btn-secondary magnetic-btn" onclick="event.stopPropagation(); openDetails('${car.id}')">
                            Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    carGrid.appendChild(card);
  });

  // Animate cars in
  gsap.to('.car-card', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
    onComplete: () => {
      applyTiltEffect();
      initMagneticCursor(); // Re-init for new elements
    }
  });
}

// Cart functionality
window.addToCart = function (carId) {
  const car = inventory.find(c => c.id === carId);
  if (car && !cart.find(c => c.id === carId)) {
    cart.push(car);
    saveCart();
    updateCartUI();
    openCart();
  }
};
window.removeFromCart = function (carId) {
  cart = cart.filter(c => c.id !== carId);
  saveCart();
  updateCartUI();
};
function updateCartUI() {
  cartCount.innerText = cart.length;
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart">Your garage is empty.</div>';
    cartTotalPrice.innerText = '₦0';
    return;
  }
  cartItemsContainer.innerHTML = '';
  let total = 0;
  cart.forEach(car => {
    const priceNum = parseInt(car.price.replace(/,/g, '')) || 0;
    total += priceNum;
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
            <img src="${car.image}" alt="${car.make}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-title">${car.make} ${car.model}</div>
                <div class="cart-item-price">₦${car.price}</div>
            </div>
            <button class="remove-item btn-icon magnetic" onclick="removeFromCart('${car.id}')">
                <i data-lucide="trash-2"></i>
            </button>
        `;
    cartItemsContainer.appendChild(item);
  });
  lucide.createIcons();
  initMagneticCursor();
  cartTotalPrice.innerText = '₦' + total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function openCart() {
  cartSidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
}
function closeCart() {
  cartSidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
}
function handleCheckout() {
  if (cart.length === 0) return;
  let message = "Greetings Auto Jez. I wish to acquire the following masterpieces from your collection:\n\n";
  cart.forEach((car, index) => {
    message += `${index + 1}. ${car.make} ${car.model} (₦${car.price})\n`;
  });
  message += `\nTotal Estimated Value: ${cartTotalPrice.innerText}\n`;
  message += "I await your response to proceed with the transaction.";
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
}

// Details Modal & Carousel
let currentCarouselIndex = 0;
let currentCarouselMedia = [];
window.openDetails = function (carId) {
  const car = inventory.find(c => c.id === carId);
  if (!car) return;
  document.getElementById('details-title').innerText = `${car.make} ${car.model}`;
  document.getElementById('details-price').innerText = `₦${car.price}`;

  // Badges
  document.getElementById('details-badges').innerHTML = `
        <span class="car-badge" style="position:relative; top:0; left:0;">${car.category}</span>
        ${car.condition ? `<span class="car-badge" style="position:relative; top:0; left:0; background: rgba(212,175,55,0.2); border-color: var(--accent-primary); color:#fff;">${car.condition}</span>` : ''}
    `;

  // Specs & Description
  document.getElementById('details-specs').innerHTML = car.specs ? car.specs.map(s => `<span class="car-spec-item">${s.trim()}</span>`).join('') : '';
  document.getElementById('details-desc').innerHTML = car.specs ? car.specs.join('. ') + '.' : 'A masterpiece ready for the roads.';

  // Carousel Setup
  currentCarouselMedia = car.media && car.media.length > 0 ? car.media : [car.image];
  currentCarouselIndex = 0;
  renderCarousel();

  // Actions
  document.getElementById('details-acquire-btn').onclick = () => {
    addToCart(car.id);
    closeDetails();
  };
  document.getElementById('details-modal').classList.add('active');
  sidebarOverlay.classList.add('active');
};
window.closeDetails = function () {
  document.getElementById('details-modal').classList.remove('active');
  sidebarOverlay.classList.remove('active');
};
function renderCarousel() {
  const carousel = document.getElementById('details-carousel');
  // Clear old media but keep buttons and dots
  const oldMedia = carousel.querySelectorAll('.carousel-media');
  oldMedia.forEach(m => m.remove());
  const dotsContainer = document.getElementById('carousel-dots');
  dotsContainer.innerHTML = '';
  currentCarouselMedia.forEach((url, i) => {
    let mediaEl;
    if (url.toLowerCase().endsWith('.mp4')) {
      mediaEl = document.createElement('video');
      mediaEl.src = url;
      mediaEl.controls = true;
      mediaEl.autoplay = i === 0;
      mediaEl.muted = true;
      mediaEl.loop = true;
    } else {
      mediaEl = document.createElement('img');
      mediaEl.src = url;
    }
    mediaEl.className = `carousel-media ${i === 0 ? 'active' : ''}`;
    carousel.insertBefore(mediaEl, carousel.querySelector('.carousel-btn'));
    const dot = document.createElement('div');
    dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
    dot.onclick = () => goToCarouselIndex(i);
    dotsContainer.appendChild(dot);
  });
  document.getElementById('carousel-prev').style.display = currentCarouselMedia.length > 1 ? 'flex' : 'none';
  document.getElementById('carousel-next').style.display = currentCarouselMedia.length > 1 ? 'flex' : 'none';
}
function goToCarouselIndex(index) {
  if (index < 0) index = currentCarouselMedia.length - 1;
  if (index >= currentCarouselMedia.length) index = 0;
  const mediaEls = document.querySelectorAll('.carousel-media');
  const dotEls = document.querySelectorAll('.carousel-dot');
  mediaEls[currentCarouselIndex].classList.remove('active');
  dotEls[currentCarouselIndex].classList.remove('active');
  if (mediaEls[currentCarouselIndex].tagName === 'VIDEO') mediaEls[currentCarouselIndex].pause();
  currentCarouselIndex = index;
  mediaEls[currentCarouselIndex].classList.add('active');
  dotEls[currentCarouselIndex].classList.add('active');
  if (mediaEls[currentCarouselIndex].tagName === 'VIDEO') mediaEls[currentCarouselIndex].play();
}
function setupEventListeners() {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter');
      renderCars();
    });
  });
  cartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  sidebarOverlay.addEventListener('click', () => {
    closeCart();
    closeDetails();
  });
  checkoutBtn.addEventListener('click', handleCheckout);

  // Details Modal
  document.getElementById('close-details').addEventListener('click', closeDetails);
  document.getElementById('carousel-prev').addEventListener('click', () => goToCarouselIndex(currentCarouselIndex - 1));
  document.getElementById('carousel-next').addEventListener('click', () => goToCarouselIndex(currentCarouselIndex + 1));

  // Secret Admin Access (5 clicks on footer copyright)
  let secretClickCount = 0;
  let secretClickTimer;
  const adminTrigger = document.getElementById('admin-secret-trigger');
  if (adminTrigger) {
    adminTrigger.addEventListener('click', () => {
      secretClickCount++;
      clearTimeout(secretClickTimer);
      if (secretClickCount >= 5) {
        window.location.href = "admin.html";
        return;
      }
      secretClickTimer = setTimeout(() => {
        secretClickCount = 0;
      }, 1000); // Must click 5 times within 1 second
    });
  }
}

// Boot
init();
