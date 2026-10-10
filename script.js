const MENU = [
  { id: 's1', name: 'Ziggaretten', desc: 'Ziggaretten', price: 20, cat: 'Sonstiges', emoji: '🚬' },

  { id: 'v2', name: 'RIP Eye Steak', desc: 'Saftiges Steak vom Rind', price: 20, cat: 'Hauptgerichte', emoji: '🍲' },
  { id: 'v3', name: 'Wagyu Burger', desc: '', price: 20, cat: 'Hauptgerichte', emoji: '🧀' },
  { id: 'v4', name: 'Steak n Fries', desc: '', price: 20, cat: 'Hauptgerichte', emoji: '🥖' },
  { id: 'v5', name: 'Steak n Fries', desc: '', price: 20, cat: 'Hauptgerichte', emoji: '🥖' },
  { id: 'v6', name: 'Tomahawk Steak', desc: '', price: 20, cat: 'Hauptgerichte', emoji: '🥖' },
  { id: 'v7', name: 'Trüffel Pasta', desc: '', price: 20, cat: 'Hauptgerichte', emoji: '🥖' },
  { id: 'v8', name: 'lachs Nudeln', desc: '', price: 20, cat: 'Hauptgerichte', emoji: '🥖' },
  { id: 'v9', name: 'Rote Gambas Pfanne', desc: '', price: 20, cat: 'Hauptgerichte', emoji: '🥖' },
  { id: 'v10', name: 'Gambas Al Ajillio', desc: '', price: 20, cat: 'Hauptgerichte', emoji: '🥖' },

  { id: 'g1', name: 'Classic Mojito', desc: 'Eisgekühlt', price: 20, cat: 'Getränke', emoji: '🥤' },
  { id: 'g2', name: 'Bella Cocktail', desc: 'Still oder spritzig', price: 20, cat: 'Getränke', emoji: '💧' },
  { id: 'g3', name: 'Apex Champagne', desc: 'Still oder spritzig', price: 20, cat: 'Getränke', emoji: '💧' },
  { id: 'g4', name: 'Siggis Eck Champagne', desc: 'Still oder spritzig', price: 20, cat: 'Getränke', emoji: '💧' },
];

const STORAGE_KEY = 'ruffy-warenkorb';

const money = (value) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD' }).format(value);

const round = (value) => Math.round(value * 100) / 100;

let cart = loadCart();
let activeCategory = 'Alle';

const el = {
  menuList: document.getElementById('menu-list'),
  filters: document.getElementById('filters'),
  cart: document.getElementById('cart'),
  cartItems: document.getElementById('cart-items'),
  badge: document.getElementById('cart-badge'),
  subtotal: document.getElementById('subtotal'),
  total: document.getElementById('total'),
  checkout: document.getElementById('checkout'),
  clear: document.getElementById('clear-cart'),
  orderMsg: document.getElementById('order-msg'),
  overlay: document.getElementById('overlay'),
  toggle: document.getElementById('cart-toggle'),
  close: document.getElementById('cart-close')
};

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((line) => MENU.some((item) => item.id === line.id) && line.qty > 0)
      .map((line) => ({ id: line.id, qty: Math.min(99, Math.floor(line.qty)) }));
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function renderFilters() {
  const categories = ['Alle', ...new Set(MENU.map((item) => item.cat))];
  el.filters.innerHTML = '';
  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'filter' + (cat === activeCategory ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      activeCategory = cat;
      renderFilters();
      renderMenu();
    });
    el.filters.appendChild(btn);
  });
}

function renderMenu() {
  const visible = MENU.filter((item) => activeCategory === 'Alle' || item.cat === activeCategory);
  const categories = [...new Set(visible.map((item) => item.cat))];

  el.menuList.innerHTML = '';
  categories.forEach((cat) => {
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = cat;

    const grid = document.createElement('div');
    grid.className = 'items';

    visible
      .filter((item) => item.cat === cat)
      .forEach((item) => grid.appendChild(renderItem(item)));

    el.menuList.append(title, grid);
  });
}

function renderItem(item) {
  const card = document.createElement('article');
  card.className = 'item';

  const emoji = document.createElement('div');
  emoji.className = 'item-emoji';
  emoji.textContent = item.emoji;

  const name = document.createElement('h3');
  name.textContent = item.name;

  const desc = document.createElement('p');
  desc.textContent = item.desc;

  const foot = document.createElement('div');
  foot.className = 'item-foot';

  const price = document.createElement('span');
  price.className = 'price';
  price.textContent = money(item.price);

  const add = document.createElement('button');
  add.className = 'add-btn';
  add.textContent = '+ In den Warenkorb';
  add.addEventListener('click', () => addToCart(item.id));

  foot.append(price, add);
  card.append(emoji, name, desc, foot);
  return card;
}

function addToCart(id) {
  const line = cart.find((entry) => entry.id === id);
  if (line) {
    line.qty = Math.min(99, line.qty + 1);
  } else {
    cart.push({ id, qty: 1 });
  }
  hideOrderMessage();
  update();
}

function changeQty(id, delta) {
  const line = cart.find((entry) => entry.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) {
    cart = cart.filter((entry) => entry.id !== id);
  } else {
    line.qty = Math.min(99, line.qty);
  }
  hideOrderMessage();
  update();
}

function removeFromCart(id) {
  cart = cart.filter((entry) => entry.id !== id);
  hideOrderMessage();
  update();
}

function renderCart() {
  el.cartItems.innerHTML = '';

  if (cart.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Dein Warenkorb ist noch leer. 🍴';
    el.cartItems.appendChild(empty);
    return;
  }

  cart.forEach((line) => {
    const item = MENU.find((entry) => entry.id === line.id);
    const row = document.createElement('div');
    row.className = 'cart-item';

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = `${item.emoji} ${item.name}`;

    const linePrice = document.createElement('div');
    linePrice.className = 'line-price';
    linePrice.textContent = money(round(item.price * line.qty));

    const qty = document.createElement('div');
    qty.className = 'qty';

    const minus = document.createElement('button');
    minus.textContent = '−';
    minus.setAttribute('aria-label', `Weniger ${item.name}`);
    minus.addEventListener('click', () => changeQty(item.id, -1));

    const count = document.createElement('span');
    count.textContent = line.qty;

    const plus = document.createElement('button');
    plus.textContent = '+';
    plus.setAttribute('aria-label', `Mehr ${item.name}`);
    plus.addEventListener('click', () => changeQty(item.id, 1));

    const unit = document.createElement('span');
    unit.className = 'unit';
    unit.textContent = `à ${money(item.price)}`;

    const remove = document.createElement('button');
    remove.className = 'remove';
    remove.textContent = 'entfernen';
    remove.addEventListener('click', () => removeFromCart(item.id));

    qty.append(minus, count, plus, unit);
    row.append(name, linePrice, qty, remove);
    el.cartItems.appendChild(row);
  });
}

function renderSummary() {
  const subtotal = round(
    cart.reduce((sum, line) => {
      const item = MENU.find((entry) => entry.id === line.id);
      return sum + item.price * line.qty;
    }, 0)
  );

  const total = subtotal;
  const count = cart.reduce((sum, line) => sum + line.qty, 0);

  el.subtotal.textContent = money(subtotal);
  el.total.textContent = money(total);

  el.badge.textContent = count;
  el.badge.hidden = count === 0;
  el.checkout.disabled = cart.length === 0;
}

function update() {
  saveCart();
  renderCart();
  renderSummary();
}

function openCart() {
  el.cart.classList.add('open');
  el.overlay.hidden = false;
}

function closeCart() {
  el.cart.classList.remove('open');
  el.overlay.hidden = true;
}

function hideOrderMessage() {
  el.orderMsg.hidden = true;
}

function createOrderText(total) {
  const price = total.replace(/[€?]\s*$/, '').trim();
  return `Bilionare Club | ${price}`;
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();

  const copied = document.execCommand('copy');
  textArea.remove();

  if (!copied) {
    throw new Error('Der Text konnte nicht in die Zwischenablage kopiert werden.');
  }
}

el.toggle.addEventListener('click', openCart);
el.close.addEventListener('click', closeCart);
el.overlay.addEventListener('click', closeCart);

el.clear.addEventListener('click', () => {
  cart = [];
  hideOrderMessage();
  update();
});

el.checkout.addEventListener('click', async () => {
  const total = el.total.textContent;
  const orderText = createOrderText(total);

  try {
    await copyToClipboard(orderText);
    cart = [];
    update();
    el.orderMsg.textContent = `Bestellung kopiert: ${orderText}`;
    el.orderMsg.hidden = false;
  } catch (error) {
    el.orderMsg.textContent = error.message;
    el.orderMsg.hidden = false;
  }
});

renderFilters();
renderMenu();
update();
