// ==========================================
// 🐾 HOÀNG THƯỢNG ĂN GÌ? - 3D KAWAII EDITION
// ==========================================

// ==========================================
// ☁️ FIREBASE REALTIME DATABASE (ĐỒNG BỘ NHÓM 4-5 NGƯỜI)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyD9NJ0ZM3L8MTheRuqzTagm5pvy5zYmYwg",
  authDomain: "minhdidauza.firebaseapp.com",
  databaseURL: "https://minhdidauza-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "minhdidauza",
  storageBucket: "minhdidauza.firebasestorage.app",
  messagingSenderId: "301099532899",
  appId: "1:301099532899:web:e4451ab261cbeb7e26ee56",
  measurementId: "G-4KXQM85DXL"
};

let fbDb = null;
let isSyncingFromCloud = false;

function setCloudSyncStatus(status, text) {
  const statusEl = document.getElementById('cloud-sync-status');
  if (!statusEl) return;
  if (status === 'connected') {
    statusEl.className = 'flex items-center gap-1 px-2 md:px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] md:text-xs font-black shadow-xs';
    statusEl.innerHTML = `
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>${text || 'Đồng bộ nhóm'}</span>
    `;
  } else if (status === 'syncing') {
    statusEl.className = 'flex items-center gap-1 px-2 md:px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[10px] md:text-xs font-black shadow-xs';
    statusEl.innerHTML = `
      <span class="inline-block animate-spin text-[10px]">🔄</span>
      <span>${text || 'Đang lưu...'}</span>
    `;
  } else if (status === 'offline') {
    statusEl.className = 'flex items-center gap-1 px-2 md:px-2.5 py-1 rounded-xl bg-stone-100 border border-stone-300 text-stone-600 text-[10px] md:text-xs font-bold shadow-xs';
    statusEl.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-stone-400"></span>
      <span>${text || 'Bộ nhớ máy'}</span>
    `;
  }
}

function showCatToast(message, type = 'success') {
  let container = document.getElementById('cat-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'cat-toast-container';
    container.className = 'fixed top-4 right-4 z-[99999] flex flex-col gap-2 pointer-events-none max-w-xs sm:max-w-sm w-full px-2';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-50/95 border-emerald-300 text-emerald-900',
    delete: 'bg-rose-50/95 border-rose-300 text-rose-900',
    edit: 'bg-amber-50/95 border-amber-300 text-amber-900',
    warn: 'bg-orange-50/95 border-orange-300 text-orange-900'
  };
  const colorClass = bgColors[type] || bgColors.success;
  const icon = type === 'delete' ? '🗑️' : (type === 'edit' ? '✏️' : (type === 'warn' ? '⚠️' : '✅'));

  toast.className = `pointer-events-auto p-3 rounded-2xl border-2 shadow-xl backdrop-blur-md flex items-center gap-2.5 text-xs font-black transition-all transform duration-300 translate-y-[-12px] opacity-0 ${colorClass}`;
  toast.innerHTML = `
    <span class="text-base flex-shrink-0">${icon}</span>
    <span class="flex-grow">${message}</span>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-[-12px]', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-[-12px]', 'opacity-0');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 320);
  }, 3200);
}

// Custom Kawaii Confirmation Dialog (replaces harsh browser confirm())
let confirmResolve = null;

function showCatConfirm(message, title = "Xác Nhận Xóa?", icon = "🗑️", okText = "Xác Nhận 🐾") {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-modal-title');
    const descEl = document.getElementById('confirm-modal-desc');
    const iconEl = document.getElementById('confirm-modal-icon');
    const okBtn = document.getElementById('btn-confirm-ok');

    if (!modal) {
      resolve(window.confirm(message));
      return;
    }

    confirmResolve = resolve;

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.innerHTML = message;
    if (iconEl) iconEl.textContent = icon;
    if (okBtn) okBtn.textContent = okText;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (window.gsap) {
      gsap.fromTo('#confirm-modal > div', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.5)' });
    }
  });
}

function initConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  const okBtn = document.getElementById('btn-confirm-ok');
  const cancelBtn = document.getElementById('btn-confirm-cancel');

  function close(result) {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (confirmResolve) {
      const res = confirmResolve;
      confirmResolve = null;
      res(result);
    }
  }

  if (okBtn) {
    okBtn.onclick = () => {
      audio.playPop();
      close(true);
    };
  }
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      audio.playPop();
      close(false);
    };
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        close(false);
      }
    });
  }
}

function sanitizeCloudList(val) {
  if (!val) return [];
  let list = [];
  if (Array.isArray(val)) {
    list = val;
  } else if (typeof val === 'object') {
    list = Object.values(val);
  }
  return list.filter(item => item && typeof item === 'object' && item.name && typeof item.name === 'string' && item.name.trim().length > 0);
}

function sanitizeCloudTags(val) {
  if (!val) return [];
  let list = [];
  if (Array.isArray(val)) {
    list = val;
  } else if (typeof val === 'object') {
    list = Object.values(val);
  }
  return list.filter(item => item && typeof item === 'object' && item.key && item.label);
}

// Customer Suggestions Data (Chỉ admin thấy)
let suggestions = [];

function sanitizeCloudSuggestions(val) {
  if (!val) return [];
  let list = [];
  if (Array.isArray(val)) {
    list = val;
  } else if (typeof val === 'object') {
    list = Object.values(val);
  }
  return list.filter(item => item && typeof item === 'object' && item.foodName && typeof item.foodName === 'string');
}

function loadSuggestions() {
  const saved = localStorage.getItem('customer_suggestions_v1');
  if (saved) {
    try {
      suggestions = JSON.parse(saved);
    } catch (e) {
      suggestions = [];
    }
  }
}

function saveSuggestionsLocally() {
  localStorage.setItem('customer_suggestions_v1', JSON.stringify(suggestions));
}

function initFirebaseSync() {
  if (typeof firebase === 'undefined') {
    console.warn("Firebase SDK not detected, running in local storage mode.");
    setCloudSyncStatus('offline', 'Bộ nhớ máy');
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    fbDb = firebase.database();
    setCloudSyncStatus('connected', 'Đồng bộ nhóm');

    // 1. SYNC FOODS
    fbDb.ref('foods').on('value', snapshot => {
      const val = snapshot.val();
      const sanitized = sanitizeCloudList(val);
      if (sanitized.length > 0) {
        isSyncingFromCloud = true;
        foods = sanitized;
        localStorage.setItem('cat_foods_list_v5', JSON.stringify(foods));
        if (appMode === 'food') {
          updateActiveFilterCount();
          if (typeof renderBallPit === 'function') renderBallPit();
          if (typeof setupSlotMachine === 'function') setupSlotMachine();
          const badge = document.getElementById('foods-badge-count');
          if (badge) badge.textContent = foods.length;
        }
        if (typeof renderFoodList === 'function') renderFoodList();
        if (typeof window.renderFoodList === 'function') window.renderFoodList();
        isSyncingFromCloud = false;
      } else if (!val) {
        if (foods && foods.length > 0) {
          fbDb.ref('foods').set(foods);
        }
      }
    });

    // 2. SYNC PLACES
    fbDb.ref('places').on('value', snapshot => {
      const val = snapshot.val();
      const sanitized = sanitizeCloudList(val);
      if (sanitized.length > 0) {
        isSyncingFromCloud = true;
        places = sanitized;
        localStorage.setItem('cat_places_list_v1', JSON.stringify(places));
        if (appMode === 'place') {
          updateActivePlaceFilterCount();
          if (typeof renderBallPit === 'function') renderBallPit();
          if (typeof setupSlotMachine === 'function') setupSlotMachine();
          const badge = document.getElementById('foods-badge-count');
          if (badge) badge.textContent = places.length;
        }
        if (typeof renderPlaceList === 'function') renderPlaceList();
        isSyncingFromCloud = false;
      } else if (!val) {
        if (places && places.length > 0) {
          fbDb.ref('places').set(places);
        }
      }
    });

    // 3. SYNC MEAL TAGS
    fbDb.ref('mealTags').on('value', snapshot => {
      const val = snapshot.val();
      const sanitized = sanitizeCloudTags(val);
      if (sanitized.length > 0) {
        isSyncingFromCloud = true;
        mealTags = sanitized;
        localStorage.setItem('cat_custom_tags_v1', JSON.stringify(mealTags));
        if (typeof renderMealFilterButtons === 'function') renderMealFilterButtons();
        if (typeof renderModalTagChips === 'function') renderModalTagChips();
        isSyncingFromCloud = false;
      } else if (!val) {
        if (mealTags && mealTags.length > 0) {
          fbDb.ref('mealTags').set(mealTags);
        }
      }
    });

    // 4. SYNC PLACE TAGS
    fbDb.ref('placeTags').on('value', snapshot => {
      const val = snapshot.val();
      const sanitized = sanitizeCloudTags(val);
      if (sanitized.length > 0) {
        isSyncingFromCloud = true;
        placeTags = sanitized;
        localStorage.setItem('cat_place_tags_v1', JSON.stringify(placeTags));
        if (typeof renderPlaceFilterButtons === 'function') renderPlaceFilterButtons();
        if (typeof renderModalPlaceTags === 'function') renderModalPlaceTags();
        isSyncingFromCloud = false;
      } else if (!val) {
        if (placeTags && placeTags.length > 0) {
          fbDb.ref('placeTags').set(placeTags);
        }
      }
    });

    // 5. SYNC COUPLE WISHLIST
    fbDb.ref('coupleWishlist').on('value', snapshot => {
      const val = snapshot.val();
      if (val && val.__empty) {
        isSyncingFromCloud = true;
        coupleWishlist = [];
        localStorage.setItem('couple_wishlist_places_v1', JSON.stringify([]));
        if (typeof renderCoupleWishlist === 'function') renderCoupleWishlist();
        if (appMode === 'wishlist') {
          const badge = document.getElementById('foods-badge-count');
          if (badge) badge.textContent = 0;
        }
        isSyncingFromCloud = false;
        return;
      }
      const sanitized = sanitizeCloudList(val);
      if (sanitized.length > 0) {
        isSyncingFromCloud = true;
        coupleWishlist = sanitized;
        localStorage.setItem('couple_wishlist_places_v1', JSON.stringify(coupleWishlist));
        if (typeof renderCoupleWishlist === 'function') renderCoupleWishlist();
        if (appMode === 'wishlist') {
          const badge = document.getElementById('foods-badge-count');
          if (badge) badge.textContent = coupleWishlist.length;
        }
        isSyncingFromCloud = false;
      } else if (!val) {
        if (coupleWishlist && coupleWishlist.length > 0) {
          fbDb.ref('coupleWishlist').set(coupleWishlist);
        }
      }
    });

    // 6. SYNC CUSTOMER SUGGESTIONS (Chỉ hiển thị cho chủ quán trong Admin)
    fbDb.ref('suggestions').on('value', snapshot => {
      const val = snapshot.val();
      suggestions = sanitizeCloudSuggestions(val);
      saveSuggestionsLocally();
      if (typeof renderSuggestionsList === 'function') renderSuggestionsList();
      if (typeof updateSuggestionsTabCount === 'function') updateSuggestionsTabCount();
    });

  } catch (err) {
    console.warn("Firebase sync error:", err);
    setCloudSyncStatus('offline', 'Bộ nhớ máy');
  }
}

// --- 1. DEFAULT FOODS LIST & MEAL TIME / PRICE HELPERS ---
const DEFAULT_MEAL_TAGS = [
  { key: 'sang', label: 'Ăn Sáng', icon: '🌅', isDefault: true },
  { key: 'trua', label: 'Ăn Trưa', icon: '☀️', isDefault: true },
  { key: 'toi', label: 'Ăn Tối', icon: '🌙', isDefault: true },
  { key: 'vat', label: 'Ăn Vặt / Đồ Ngọt', icon: '🧋', isDefault: true },
  { key: 'dem', label: 'Ăn Đêm', icon: '🦉', isDefault: true }
];

let mealTags = [];

function loadMealTags() {
  const saved = localStorage.getItem('cat_custom_tags_v1');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mealTags = parsed;
        return;
      }
    } catch (e) {}
  }
  mealTags = JSON.parse(JSON.stringify(DEFAULT_MEAL_TAGS));
}

function saveMealTags() {
  localStorage.setItem('cat_custom_tags_v1', JSON.stringify(mealTags));
  if (fbDb && !isSyncingFromCloud) {
    fbDb.ref('mealTags').set(mealTags).catch(e => console.warn('Firebase saveMealTags error:', e));
  }
}

function formatPrice(val) {
  if (!val && val !== 0) return '35.000đ';
  return Number(val).toLocaleString('vi-VN') + 'đ';
}

function getPriceShort(val) {
  if (!val && val !== 0) return '35k';
  const k = Math.round(Number(val) / 1000);
  return k + 'k';
}

function getMealTagBadgeHtml(tagKey) {
  const t = mealTags.find(item => item.key === tagKey);
  if (!t) return '';
  return `<span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 shadow-sm">${t.icon || '🏷️'} ${t.label}</span>`;
}

const DEFAULT_FOODS = [
  { id: 1, name: "Phở Bò Tái Lăn", category: "water", icon: "🍜", price: 45000, mealTimes: ["sang", "trua", "toi"], image: null, desc: "Nước dùng ngọt thanh đậm đà từ xương ống, thịt bò mềm thơm nức mũi!" },
  { id: 2, name: "Trà Sữa Trân Châu Hoàng Kim", category: "snack", icon: "🧋", price: 30000, mealTimes: ["trua", "vat"], image: null, desc: "Full topping trân châu hoàng kim dai giòn, ngọt ngào xua tan mệt mỏi!" },
  { id: 3, name: "Pizza Phô Mai Ngập Tràn", category: "fast", icon: "🍕", price: 119000, mealTimes: ["trua", "toi"], image: null, desc: "Phô mai mozzarella kéo sợi vàng óng, xúc xích thơm lừng giòn rụm." },
  { id: 4, name: "Sushi & Sashimi Cá Hồi", category: "rice", icon: "🍣", price: 145000, mealTimes: ["trua", "toi"], image: null, desc: "Món khoái khẩu nhất của loài mèo! Cá hồi tươi rói béo ngọt tự nhiên." },
  { id: 5, name: "Gà Rán Giòn Cay KFC", category: "fast", icon: "🍗", price: 40000, mealTimes: ["trua", "toi", "vat"], image: null, desc: "Vỏ ngoài giòn rôm rốp, thịt mọng nước kèm khoai tây chiên giòn tan." },
  { id: 6, name: "Burger Bò Phô Mai", category: "fast", icon: "🍔", price: 45000, mealTimes: ["sang", "trua", "vat"], image: null, desc: "Bò nướng than hoa mềm ngọt đẫm sốt, kẹp phô mai cheddar tan chảy." },
  { id: 7, name: "Cơm Tấm Sườn Bì Chả", category: "rice", icon: "🍱", price: 40000, mealTimes: ["sang", "trua", "toi"], image: null, desc: "Sườn nướng mật ong thơm lừng, ốp la lòng đào chảy béo ngậy." },
  { id: 8, name: "Bún Bò Huế Đặc Biệt", category: "water", icon: "🍲", price: 45000, mealTimes: ["sang", "trua", "dem"], image: null, desc: "Chua cay nồng nàn, mọc cua béo ngậy, giò heo giòn sần sật." },
  { id: 9, name: "Bánh Mì Chảo Đặc Biệt", category: "fast", icon: "🍳", price: 35000, mealTimes: ["sang", "trua"], image: null, desc: "Pate cột đèn béo ngậy, trứng ốp la lòng đào, bánh mì giòn tan." },
  { id: 10, name: "Bún Đậu Mắm Tôm Thập Cẩm", category: "fast", icon: "🥒", price: 45000, mealTimes: ["trua", "toi"], image: null, desc: "Mắm tôm bông tuyết dậy vị, chả cốm dẻo quánh, dồi sụn nướng giòn." },
  { id: 11, name: "Mì Cay Hải Sản 7 Cấp Độ", category: "water", icon: "🌶️", price: 55000, mealTimes: ["trua", "toi", "dem"], image: null, desc: "Hải sản tươi rói, xì xụp nước lèo kim chi chua cay bung nóc!" },
  { id: 12, name: "Cơm Gà Xối Mỡ Da Giòn", category: "rice", icon: "🍗", price: 45000, mealTimes: ["trua", "toi"], image: null, desc: "Cơm chiên hạt vàng ươm, đùi gà da giòn rụm chấm nước mắm tỏi ớt." },
  { id: 13, name: "Lẩu Tokbokki Phô Mai Hàn Quốc", category: "snack", icon: "🥘", price: 79000, mealTimes: ["toi", "vat"], image: null, desc: "Bánh gạo mềm dẻo ngập tràn sốt ớt cay ngọt và phô mai béo ngậy." },
  { id: 14, name: "Bánh Tráng Nướng Đà Lạt", category: "snack", icon: "🍕", price: 20000, mealTimes: ["vat", "dem"], image: null, desc: "Pizza Đà Lạt giòn rụm, trứng cút, phô mai, bò khô thơm lừng." },
  { id: 15, name: "Hủ Tiếu Nam Vang Sườn Tôm", category: "water", icon: "🍜", price: 45000, mealTimes: ["sang", "trua", "toi"], image: null, desc: "Sợi hủ tiếu dai dai, nước lèo tôm mực thanh ngọt đậm đà khó cưỡng!" },
  { id: 16, name: "Bún Chả Hà Nội Nướng Than", category: "rice", icon: "🥓", price: 50000, mealTimes: ["trua", "toi"], image: null, desc: "Chả nướng xém cạnh thơm lừng mùi than củi, chấm nước mắm chua ngọt ấm nóng!" },
  { id: 17, name: "Bánh Canh Cua Giò Heo", category: "water", icon: "🦀", price: 55000, mealTimes: ["sang", "trua", "toi"], image: null, desc: "Nước dùng sền sệt gạch cua thơm béo, thịt cua tươi ngọt kèm giò heo giòn gân!" },
  { id: 18, name: "Mì Quảng Tôm Thịt Trứng Cút", category: "water", icon: "🍤", price: 40000, mealTimes: ["sang", "trua"], image: null, desc: "Sợi mì vàng ươm, nước nhưn tôm thịt rim đậm đà rắc đậu phộng thơm phức!" },
  { id: 19, name: "Ramen Nhật Bản Thịt Chashu", category: "water", icon: "🍜", price: 85000, mealTimes: ["trua", "toi"], image: null, desc: "Nước hầm xương Tonkotsu béo ngậy 12 tiếng, thịt cuộn mềm tan trong miệng!" },
  { id: 20, name: "Lẩu Thái Tomyum Chua Cay", category: "water", icon: "🍲", price: 169000, mealTimes: ["toi", "dem"], image: null, desc: "Hương sả lá chanh bùng nổ vị giác, nhúng bò Mỹ và hải sản tươi rói đã thèm!" },
  { id: 21, name: "Cơm Niêu Singapore Cháy Giòn", category: "rice", icon: "🍚", price: 65000, mealTimes: ["trua", "toi"], image: null, desc: "Lớp cháy vàng ruộm đáy niêu giòn tan rôm rốp, sốt bò tiêu đen thơm nức mũi!" },
  { id: 22, name: "Bò Bít Tết Sốt Tiêu Đen", category: "fast", icon: "🥩", price: 89000, mealTimes: ["trua", "toi"], image: null, desc: "Thịt bò thăn mềm mọng nước xèo xèo trên chảo gang, chấm bánh mì cực đỉnh!" },
  { id: 23, name: "Bánh Cuốn Nóng Thịt Nấm", category: "fast", icon: "🥟", price: 30000, mealTimes: ["sang", "toi"], image: null, desc: "Bánh tráng mỏng dính nhân mộc nhĩ thịt băm rắc hành phi giòn tan thơm phức!" },
  { id: 24, name: "Cơm Rang Dưa Bò Giòn Rụm", category: "rice", icon: "🍳", price: 45000, mealTimes: ["trua", "toi", "dem"], image: null, desc: "Hạt cơm đảo săn giòn vàng ruộm, thịt bò mềm xào dưa chua ngấm vị chua ngọt!" },
  { id: 25, name: "Bánh Tráng Trộn Sốt Me Bò Khô", category: "snack", icon: "🥗", price: 25000, mealTimes: ["vat", "dem"], image: null, desc: "Đủ vị chua cay mặn ngọt béo bùi từ trứng cút, xoài băm, bò khô và sốt me!" },
  { id: 26, name: "Nem Chua Rán Phố Cổ Hà Nội", category: "snack", icon: "🥖", price: 35000, mealTimes: ["vat", "dem"], image: null, desc: "Chiên nóng giòn rụm bên ngoài, dẻo dai bên trong, chấm tương ớt cay nồng!" },
  { id: 27, name: "Dimsum Há Cảo Tôm Hấp", category: "snack", icon: "🥟", price: 45000, mealTimes: ["sang", "vat"], image: null, desc: "Vỏ bột trong veo hé lộ tôm tươi nguyên con sần sật mọng nước ngọt lành!" },
  { id: 28, name: "Cà Phê Muối / Bạc Xỉu Sữa Đá", category: "snack", icon: "☕", price: 25000, mealTimes: ["sang", "vat"], image: null, desc: "Lớp kem muối béo ngậy mằn mặn hòa quyện cà phê phin đậm đà thơm ngát!" },
  { id: 29, name: "Trà Đào Cam Sả Tươi Mát", category: "snack", icon: "🍹", price: 35000, mealTimes: ["trua", "vat"], image: null, desc: "Thanh mát xua tan oi bức ngày hè, miếng đào giòn ngọt kèm hương sả thơm lừng!" },
  { id: 30, name: "Matcha Latte Đậu Đỏ Nhật Bản", category: "snack", icon: "🍵", price: 39000, mealTimes: ["vat"], image: null, desc: "Trà xanh Uji chuẩn Nhật thơm ngát đắng nhẹ, quyện đậu đỏ ngọt bùi béo ngậy!" },
  { id: 31, name: "Bingsu Xoài Tuyết Hoa Tuyết", category: "snack", icon: "🍧", price: 65000, mealTimes: ["vat", "toi"], image: null, desc: "Tuyết sữa mịn như nhung phủ đẫm xoài cát tươi vàng óng mát lạnh tê đầu lưỡi!" },
  { id: 32, name: "Chè Bưởi An Giang Nước Cốt Dừa", category: "snack", icon: "🍨", price: 20000, mealTimes: ["vat", "toi"], image: null, desc: "Cùi bưởi giòn sần sật bọc bột năng dai dẻo, chan ngập nước cốt dừa béo ngậy!" },
  { id: 33, name: "Sinh Tố Bơ Sáp Dừa Béo Ngậy", category: "snack", icon: "🥑", price: 35000, mealTimes: ["vat"], image: null, desc: "Bơ sáp Đắk Lắk xay nhuyễn dẻo quánh cùng sữa đặc, thơm béo bổ dưỡng!" },
  { id: 34, name: "Salad Ức Gà Sốt Mè Rang", category: "fast", icon: "🥗", price: 49000, mealTimes: ["trua", "toi"], image: null, desc: "Rau xanh giòn ngọt, ức gà nướng thảo mộc ít calo thơm lừng chuẩn dáng xinh!" },
  { id: 35, name: "Cơm Gạo Lứt Bò Nướng Healthy", category: "rice", icon: "🍱", price: 45000, mealTimes: ["trua", "toi"], image: null, desc: "Hạt gạo lứt bùi bùi dồi dào chất xơ, bò nướng mềm ngọt ăn no không lo tích mỡ!" },
  { id: 36, name: "Phở Chay Nấm Hương Thanh Đạm", category: "water", icon: "🍲", price: 35000, mealTimes: ["sang", "trua", "toi"], image: null, desc: "Nước dùng hầm từ củ cải quả ngọt tự nhiên, nấm hương thơm lừng nhẹ nhõm tâm hồn!" }
];

const DEFAULT_PLACE_TAGS = [
  { key: 'chill', label: 'Chill & Hẹn hò', icon: '☕', isDefault: true },
  { key: 'entertain', label: 'Vui chơi & Giải trí', icon: '🎮', isDefault: true },
  { key: 'outdoor', label: 'Dã ngoại & Ngoài trời', icon: '🌳', isDefault: true },
  { key: 'sport', label: 'Vận động & Thể thao', icon: '🎳', isDefault: true },
  { key: 'night', label: 'Quẩy đêm & Ăn chơi', icon: '🌙', isDefault: true },
  { key: 'date', label: 'Cặp đôi & Lãng mạn', icon: '💖', isDefault: true }
];

let placeTags = [];

function loadPlaceTags() {
  const saved = localStorage.getItem('cat_place_tags_v1');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        placeTags = parsed;
        return;
      }
    } catch (e) {}
  }
  placeTags = JSON.parse(JSON.stringify(DEFAULT_PLACE_TAGS));
}

function savePlaceTags() {
  localStorage.setItem('cat_place_tags_v1', JSON.stringify(placeTags));
  if (fbDb && !isSyncingFromCloud) {
    fbDb.ref('placeTags').set(placeTags).catch(e => console.warn('Firebase savePlaceTags error:', e));
  }
}

function getPlaceTagBadgeHtml(tagKey) {
  const t = placeTags.find(item => item.key === tagKey);
  if (!t) return '';
  return `<span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">${t.icon || '🏷️'} ${t.label}</span>`;
}

const DEFAULT_PLACES = [
  { id: 101, name: "Quán Cafe Rooftop Ngắm Hoàng Hôn", category: "cafe", icon: "☕", cost: 50000, placeTags: ["chill", "date"], desc: "View triệu đô lộng gió, ngắm hoàng hôn buông xuống cùng người thương!" },
  { id: 102, name: "Rạp Chiếu Phim CGV / Lotte Cinema", category: "movie", icon: "🎬", cost: 95000, placeTags: ["entertain", "date"], desc: "Thưởng thức bom tấn điện ảnh kèm bắp rang bơ giòn rụm thơm lừng!" },
  { id: 103, name: "TTTM Aeon Mall / Vincom Mega", category: "mall", icon: "🛍️", cost: 100000, placeTags: ["entertain", "chill"], desc: "Thiên đường mua sắm, máy lạnh mát rượi, ăn chơi không sợ mưa nắng!" },
  { id: 104, name: "Phố Đi Bộ & Hóng Gió Hồ Tây", category: "outdoor", icon: "🌳", cost: 0, placeTags: ["chill", "outdoor", "date"], desc: "Dạo mát hít thở khí trời, ngắm cảnh phố xá lung linh về đêm!" },
  { id: 105, name: "Khu Vui Chơi Bowling & Bắn Cung", category: "sport", icon: "🎳", cost: 85000, placeTags: ["sport", "entertain"], desc: "Ném strike cực ngầu hoặc kéo cung thiện xạ, xả stress bung nóc!" },
  { id: 106, name: "Triển Lãm Nghệ Thuật & Bảo Tàng", category: "art", icon: "🎨", cost: 30000, placeTags: ["chill", "date"], desc: "Ngàn góc sống ảo thần sầu, đắm mình trong không gian tranh nghệ thuật!" },
  { id: 107, name: "Cắm Trại Dã Ngoại / Glamping", category: "camp", icon: "⛺", cost: 220000, placeTags: ["outdoor", "date", "chill"], desc: "Rời xa khói bụi thành phố, đốt lửa trại nướng BBQ dưới trời sao!" },
  { id: 108, name: "Chợ Đêm & Phố Ẩm Thực Vỉa Hè", category: "night", icon: "🍢", cost: 60000, placeTags: ["night", "chill"], desc: "Lê la hàng quán, ăn sập các món ngon đường phố nhộn nhịp về đêm!" },
  { id: 109, name: "Công Viên Cây Xanh Picnic", category: "park", icon: "🌿", cost: 0, placeTags: ["outdoor", "chill"], desc: "Trải thảm cỏ xanh mướt, ăn bánh ngọt đọc sách nghe nhạc chill chill!" },
  { id: 110, name: "Khu Trò Chơi Arcade & Gắp Gấu", category: "game", icon: "🕹️", cost: 50000, placeTags: ["entertain", "sport"], desc: "Đua xe, bắn súng, gắp thú bông mang về tặng người yêu bao ngầu!" },
  { id: 111, name: "Đạp Vịt & Chèo SUP Mặt Hồ", category: "water", icon: "⛵", cost: 40000, placeTags: ["outdoor", "date"], desc: "Lênh đênh trên mặt nước sóng sánh, đón gió trời lãng mạn vô cùng!" },
  { id: 112, name: "Workshop Làm Gốm & Nến Thơm", category: "craft", icon: "🕯️", cost: 120000, placeTags: ["craft", "date", "chill"], desc: "Tự tay nặn chiếc ly gốm hoặc đúc cốc nến thơm mang dấu ấn riêng!" },
  { id: 113, name: "Phòng Karaoke Quẩy Hết Mình", category: "karaoke", icon: "🎤", cost: 90000, placeTags: ["entertain", "night"], desc: "Hát hò xả ga cùng hội bạn thân, giải tỏa hết mọi mệt mỏi trong tuần!" },
  { id: 114, name: "Quán Cà Phê Mèo Cưng Nựng", category: "pet", icon: "🐕", cost: 45000, placeTags: ["chill", "date"], desc: "Ngắm đàn mèo béo ú quấn quýt, vuốt ve bộ lông mềm như nhung!" },
  { id: 115, name: "Đài Quan Sát Landmark / Lotte", category: "view", icon: "🌇", cost: 110000, placeTags: ["chill", "date"], desc: "Ngắm trọn vẹn thành phố rực rỡ ánh đèn từ trên độ cao chọc trời!" },
  { id: 116, name: "Sân Trượt Băng Trong Nhà Ice Rink", category: "sport", icon: "⛸️", cost: 120000, placeTags: ["sport", "entertain", "date"], desc: "Lướt nhẹ trên sân băng mát lạnh, cảm giác như mùa đông Châu Âu!" },
  { id: 117, name: "Nhà Sách Không Gian Mở Yên Tĩnh", category: "book", icon: "📚", cost: 0, placeTags: ["chill"], desc: "Không gian yên tĩnh ngập tràn tri thức và mùi sách mới thơm phức!" },
  { id: 118, name: "Lướt Ván & Chèo Thuyền Kayak", category: "water", icon: "🏄", cost: 130000, placeTags: ["sport", "outdoor"], desc: "Rèn luyện thể lực, lướt sóng nước ngắm hoàng hôn rực rỡ!" },
  { id: 119, name: "Quán Trà Đạo & Vườn Thiền Nhật", category: "tea", icon: "🍵", cost: 45000, placeTags: ["chill", "date"], desc: "Thưởng thức chén trà thơm tĩnh tâm giữa khu vườn sỏi thanh tịnh!" },
  { id: 120, name: "Khu Du Lịch Sinh Thái Miệt Vườn", category: "eco", icon: "🌾", cost: 160000, placeTags: ["outdoor", "chill"], desc: "Hòa mình vào thiên nhiên, câu cá và hít thở bầu không khí trong lành!" }
];

const CAT_QUOTES = [
  "Hoàng Thượng đã chuẩn y! Mau đi ăn đi Sen, cấm cãi!",
  "Trẫm ngửi thấy mùi thơm của món này từ 9 tầng mây rồi!",
  "Hôm nay Sen ăn món này đảm bảo ví dày, sếp khen, crush chú ý!",
  "Ăn no không lo deadline! Món này trẫm chấm 10/10 không có nhưng!",
  "Món này ngon đến mức Hoàng Thượng cũng muốn ké một miếng đó Sen!",
  "Ăn đi rồi về sớm dọn cát sạch sẽ cho Trẫm nghe chưa!"
];

const CAT_PLACE_QUOTES = [
  "Trẫm đã chọn chỗ này rồi! Mau lên đồ đi chơi ngay đi Sen, cấm bàn lùi!",
  "Chỗ này chụp ảnh sống ảo đảm bảo nghìn like đó Sen ơi!",
  "Đi chơi cho khuây khỏa đầu óc rồi về phục vụ Trẫm chu đáo nha!",
  "Kèo này quá thơm! Trẫm chuẩn y 100%, xuất phát liền!",
  "Hôm nay trời đẹp, tới địa điểm này xả stress là đúng bài rồi Sen!",
  "Đi quẩy hết mình đi Sen, nhưng nhớ về trước giờ ăn của Trẫm đó!"
];

const BALL_GRADIENTS = [
  { bg: 'radial-gradient(circle at 30% 25%, #FFFFFF 0%, #FF3B30 40%, #D70015 80%, #60000A 100%)', color: 'red' },
  { bg: 'radial-gradient(circle at 30% 25%, #FFFFFF 0%, #8FE300 40%, #52A800 80%, #1E4400 100%)', color: 'lime' },
  { bg: 'radial-gradient(circle at 30% 25%, #FFFFFF 0%, #FF2D85 40%, #C8005A 80%, #5C0028 100%)', color: 'magenta' },
  { bg: 'radial-gradient(circle at 30% 25%, #FFFFFF 0%, #5AC8FA 40%, #007AFF 80%, #003380 100%)', color: 'blue' },
  { bg: 'radial-gradient(circle at 30% 25%, #FFFFFF 0%, #FFD60A 40%, #FF9F0A 80%, #804700 100%)', color: 'yellow' },
  { bg: 'radial-gradient(circle at 30% 25%, #FFFFFF 0%, #BF5AF2 40%, #8916C4 80%, #3B0059 100%)', color: 'purple' }
];

// --- 2. AUDIO SYNTHESIZER (Web Audio API) ---
class CatAudioPlayer {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.08);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playMeow() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playSlotTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.035);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  playBellDing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [1046.50, 1318.51, 1567.98].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.25, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.005, now + i * 0.06 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.4);
    });
  }

  playWoodShake() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + Math.random() * 160, now + i * 0.05);
      gain.gain.setValueAtTime(0.18, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.04);
    }
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const start = now + idx * 0.1;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + (idx === 3 ? 0.7 : 0.22));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + (idx === 3 ? 0.7 : 0.22));
    });
  }

  playFoilTear() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = 0.9; // Matches 0.9s foil peel animation

    // 1. DUAL-TEXTURE NOISE (White + Serrated Granular Foil Crackle)
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = noiseBuffer.getChannelData(0);

    let smoothedVal = 0;
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const rawWhite = Math.random() * 2 - 1;
      // Gentle smoothing for low-mid paper body
      smoothedVal = (smoothedVal * 0.65) + (rawWhite * 0.35);

      // Serrated micro-crackle: dynamic ripples simulating ripping across foil teeth
      const ripple = Math.sin(progress * Math.PI * 65) * 0.3 + 0.7;
      const jitter = Math.random() > 0.4 ? 1.0 : (0.25 + Math.random() * 0.45);

      // Envelope: snappy attack notch, sustained friction rip, soft finish
      let env = 1;
      if (progress < 0.05) {
        env = (progress / 0.05) * 1.25;
      } else if (progress > 0.8) {
        env = Math.max(0, 1 - (progress - 0.8) / 0.2);
      }

      data[i] = (rawWhite * 0.7 + smoothedVal * 0.3) * ripple * jitter * env;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // 2. PRIMARY BANDPASS FILTER: Simulates crunchy tearing friction
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.setValueAtTime(3.5, now);
    // Sweeps dynamically: sharp notch break (3600Hz) -> abrasive rip (2700-3900Hz) -> lower release (1500Hz)
    bandpass.frequency.setValueAtTime(3600, now);
    bandpass.frequency.exponentialRampToValueAtTime(2700, now + 0.25);
    bandpass.frequency.exponentialRampToValueAtTime(3900, now + 0.55);
    bandpass.frequency.exponentialRampToValueAtTime(1500, now + duration);

    // 3. HIGHPASS FILTER LAYER: For crisp metallic foil/plastic edge
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(4500, now);

    // 4. INITIAL NOTCH "SNAP" (Instantaneous punch at t=0)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(750, now);
    snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.05);
    snapGain.gain.setValueAtTime(0.25, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.05);

    // 5. MASTER TEAR GAIN ENVELOPE
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.linearRampToValueAtTime(0.6, now + 0.03); // Instant crisp bite
    masterGain.gain.setValueAtTime(0.5, now + 0.25);
    masterGain.gain.linearRampToValueAtTime(0.4, now + 0.7);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Routing
    noiseSource.connect(bandpass);
    bandpass.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    // High foil sheen route
    const foilCrispGain = this.ctx.createGain();
    foilCrispGain.gain.setValueAtTime(0.2, now);
    foilCrispGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noiseSource.connect(highpass);
    highpass.connect(foilCrispGain);
    foilCrispGain.connect(this.ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
  }

  playFoilSlide() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = 0.5;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const p = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, now);
    filter.frequency.exponentialRampToValueAtTime(250, now + duration);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + duration);
  }
}

const audio = new CatAudioPlayer();

// --- 3. STATE & STORAGE ---
let appMode = 'food'; // 'food' | 'place'
let foods = [];
let places = [];
let currentMealTag = 'all';
let currentPriceRange = 'all';
let currentPlaceTag = 'all';
let currentPlaceCost = 'all';
let editingFoodId = null;
let editingPlaceId = null;
let isActionRunning = false;
let currentUploadedImageBase64 = null;
let activeModalTab = 'foods'; // 'foods' | 'places'

function loadFoods() {
  const oldKeys = ['cat_foods_list_v4', 'cat_foods_list_v3', 'cat_foods_list_v2', 'cat_foods_list'];
  let loadedList = [];
  const savedV5 = localStorage.getItem('cat_foods_list_v5');

  if (savedV5) {
    try {
      const parsed = JSON.parse(savedV5);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loadedList = parsed;
      }
    } catch (e) {}
  }

  // Only if v5 has never existed on this browser, check if an old key can be migrated once
  if (loadedList.length === 0) {
    for (const key of oldKeys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsedOld = JSON.parse(raw);
          if (Array.isArray(parsedOld) && parsedOld.length > 0) {
            loadedList = parsedOld;
            break;
          }
        } catch (e) {}
      }
    }
  }

  // PERMANENTLY PURGE all legacy keys so deleted dishes are NEVER resurrected on reload
  oldKeys.forEach(key => {
    try { localStorage.removeItem(key); } catch (e) {}
  });

  // If still empty, use default foods
  if (loadedList.length === 0) {
    loadedList = JSON.parse(JSON.stringify(DEFAULT_FOODS));
  }

  // Ensure all items have valid prices and mealTimes
  foods = loadedList.filter(f => f && typeof f === 'object' && f.name).map(f => {
    const matchedDefault = DEFAULT_FOODS.find(df => df.id === f.id || df.name === f.name);
    return {
      ...f,
      id: f.id || Date.now() + Math.floor(Math.random() * 1000),
      name: f.name.trim(),
      price: (f.price !== undefined && f.price !== null) ? Number(f.price) : (matchedDefault ? matchedDefault.price : 35000),
      mealTimes: (f.mealTimes && Array.isArray(f.mealTimes) && f.mealTimes.length) 
        ? f.mealTimes 
        : (matchedDefault ? matchedDefault.mealTimes : ['trua', 'toi'])
    };
  });

  localStorage.setItem('cat_foods_list_v5', JSON.stringify(foods));
}

function saveFoods() {
  const cleanFoods = foods.filter(f => f && typeof f === 'object' && f.name);
  localStorage.setItem('cat_foods_list_v5', JSON.stringify(cleanFoods));
  if (fbDb && !isSyncingFromCloud) {
    setCloudSyncStatus('syncing', 'Đang lưu...');
    fbDb.ref('foods').set(cleanFoods)
      .then(() => setCloudSyncStatus('connected', 'Đồng bộ nhóm'))
      .catch(e => {
        console.warn('Firebase saveFoods error:', e);
        setCloudSyncStatus('connected', 'Lưu trên máy');
      });
  }
}

function loadPlaces() {
  const saved = localStorage.getItem('cat_places_list_v1');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        places = parsed.filter(p => p && typeof p === 'object' && p.name);
        return;
      }
    } catch (e) {}
  }
  places = JSON.parse(JSON.stringify(DEFAULT_PLACES));
  localStorage.setItem('cat_places_list_v1', JSON.stringify(places));
}

function savePlaces() {
  const cleanPlaces = places.filter(p => p && typeof p === 'object' && p.name);
  localStorage.setItem('cat_places_list_v1', JSON.stringify(cleanPlaces));
  if (fbDb && !isSyncingFromCloud) {
    setCloudSyncStatus('syncing', 'Đang lưu...');
    fbDb.ref('places').set(cleanPlaces)
      .then(() => setCloudSyncStatus('connected', 'Đồng bộ nhóm'))
      .catch(e => {
        console.warn('Firebase savePlaces error:', e);
        setCloudSyncStatus('connected', 'Lưu trên máy');
      });
  }
}

function getFilteredFoods() {
  return foods.filter(food => {
    // 1. Filter by Meal Time Tag
    if (currentMealTag !== 'all') {
      const times = food.mealTimes || [];
      if (!times.includes(currentMealTag)) {
        return false;
      }
    }
    // 2. Filter by Price Range
    const price = Number(food.price) || 35000;
    if (currentPriceRange === 'under30') {
      if (price >= 30000) return false;
    } else if (currentPriceRange === '30to60') {
      if (price < 30000 || price > 60000) return false;
    } else if (currentPriceRange === 'over60') {
      if (price <= 60000) return false;
    }
    return true;
  });
}

function getActiveFoodsOrFallback() {
  const list = getFilteredFoods();
  if (list.length > 0) return list;
  return foods; // Fallback so games never break if 0 dishes match
}

function getFilteredPlaces() {
  return places.filter(place => {
    // 1. Filter by Place Tag
    if (currentPlaceTag !== 'all') {
      const tags = place.placeTags || [];
      if (!tags.includes(currentPlaceTag)) {
        return false;
      }
    }
    // 2. Filter by Cost
    const cost = Number(place.cost) || 0;
    if (currentPlaceCost === 'free') {
      if (cost > 30000) return false;
    } else if (currentPlaceCost === 'mid') {
      if (cost <= 30000 || cost > 100000) return false;
    } else if (currentPlaceCost === 'high') {
      if (cost <= 100000) return false;
    }
    return true;
  });
}

function getActivePlacesOrFallback() {
  const list = getFilteredPlaces();
  if (list.length > 0) return list;
  return places;
}

function getActiveItemsOrFallback() {
  if (appMode === 'place') {
    return getActivePlacesOrFallback();
  }
  return getActiveFoodsOrFallback();
}

function getRandomItem() {
  const list = getActiveItemsOrFallback();
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomFood() {
  return getRandomItem();
}

// --- 4. PAW CLICK TRAIL ---
function initPawCursor() {
  window.addEventListener('click', (e) => {
    const p = document.createElement('div');
    p.className = 'paw-particle';
    p.style.left = `${e.clientX}px`;
    p.style.top = `${e.clientY}px`;
    p.innerHTML = `<svg viewBox="0 0 32 32" fill="#FF6584"><path d="M16 14c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm-5.5-2c-1.4 0-2.5 1.1-2.5 2.5S9.1 17 10.5 17s2.5-1.1 2.5-2.5S11.9 12 10.5 12zm11 0c-1.4 0-2.5 1.1-2.5 2.5S20.1 17 21.5 17s2.5-1.1 2.5-2.5S22.9 12 21.5 12zM16 21c-3.3 0-6 2.2-7 5h14c-1-2.8-3.7-5-7-5z"/></svg>`;
    document.body.appendChild(p);

    if (window.gsap) {
      gsap.to(p, {
        scale: 1.6,
        rotation: Math.random() * 50 - 25,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => p.remove()
      });
    } else {
      setTimeout(() => p.remove(), 600);
    }
  });
}

// --- 5. CONFETTI BLAST ---
function shootConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#FF6584', '#FFD166', '#06D6A0', '#118AB2', '#FF8DA1']
    });
  }
}

// --- 6. RESULT MODAL (SUPPORTS REAL PHOTO OR EMOJI, FOOD OR PLACE) ---
function showResultModal(item) {
  const modal = document.getElementById('result-modal');
  const foodImgContainer = document.getElementById('result-food-img-container');
  const foodImg = document.getElementById('result-food-img');
  const foodIcon = document.getElementById('result-food-icon');
  const foodName = document.getElementById('result-food-name');
  const foodDesc = document.getElementById('result-food-desc');
  const catSpeech = document.getElementById('result-cat-speech');
  const resultFoodPrice = document.getElementById('result-food-price');
  const resultFoodTags = document.getElementById('result-food-tags');
  const acceptBtnText = document.getElementById('btn-accept-result-text');
  const retryBtnText = document.getElementById('btn-retry-result-text');

  // Handle Photo vs Emoji
  if (item.image) {
    foodImg.src = item.image;
    foodImgContainer.classList.remove('hidden');
    foodIcon.classList.add('hidden');
  } else {
    foodIcon.textContent = item.icon || (appMode === 'place' ? '📍' : '🍱');
    foodIcon.classList.remove('hidden');
    foodImgContainer.classList.add('hidden');
  }

  foodName.textContent = item.name;

  if (appMode === 'place') {
    foodDesc.textContent = item.desc || 'Địa điểm vui chơi cực đỉnh cho ngày hôm nay!';
    catSpeech.textContent = CAT_PLACE_QUOTES[Math.floor(Math.random() * CAT_PLACE_QUOTES.length)];
    if (resultFoodPrice) {
      const costVal = Number(item.cost) || 0;
      resultFoodPrice.innerHTML = costVal === 0 ? `🎟️ <b>Miễn phí</b>` : `💰 ~${formatPrice(costVal)}`;
    }
    if (resultFoodTags) {
      const tags = (item.placeTags && item.placeTags.length) ? item.placeTags : ['chill'];
      resultFoodTags.innerHTML = tags.map(getPlaceTagBadgeHtml).join(' ');
    }
    if (acceptBtnText) acceptBtnText.textContent = '🚀 Chốt Chỗ Này, Đi Ngay Thôi!';
    if (retryBtnText) retryBtnText.textContent = '🐾 Sen Muốn Đổi Chỗ Khác!';
  } else {
    foodDesc.textContent = item.desc || 'Món ăn siêu hấp dẫn cho ngày hôm nay!';
    catSpeech.textContent = CAT_QUOTES[Math.floor(Math.random() * CAT_QUOTES.length)];
    if (resultFoodPrice) {
      resultFoodPrice.innerHTML = `💰 ${formatPrice(item.price)}`;
    }
    if (resultFoodTags) {
      const tags = (item.mealTimes && item.mealTimes.length) ? item.mealTimes : ['trua'];
      resultFoodTags.innerHTML = tags.map(getMealTagBadgeHtml).join(' ');
    }
    if (acceptBtnText) acceptBtnText.textContent = '💖 Chốt Món Này, Đi Ăn Thôi!';
    if (retryBtnText) retryBtnText.textContent = '🐾 Sen Chê! Chọn Lại Món Khác';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  if (window.gsap) {
    gsap.fromTo('.food-card-3d', 
      { scale: 0.6, rotation: -8, opacity: 0 }, 
      { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
  }

  audio.playFanfare();
  shootConfetti();
}

function hideResultModal() {
  const modal = document.getElementById('result-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// --- 7. MINI-GAME 1: ARCADE CLAW & DENSE BALL PIT ---
let craneIdleTween = null;

function setupClawMachine() {
  const joystickTrigger = document.getElementById('joystick-trigger') || document.getElementById('btn-claw-grab');
  const catGifContainer = document.getElementById('cat-gif-container');
  const craneCarriage = document.getElementById('crane-carriage');
  const craneCable = document.getElementById('crane-cable');
  const clawArmLeft = document.getElementById('claw-arm-left');
  const clawArmRight = document.getElementById('claw-arm-right');
  const heldClawBall = document.getElementById('held-claw-ball');
  const heldFoodContent = document.getElementById('held-food-content');
  const heldFoodLabel = document.getElementById('held-food-label');
  const joystickStick = document.getElementById('joystick-stick');
  const ballPit = document.getElementById('arcade-ball-pit');

  // Set initial symmetrical angles (relaxed natural posture)
  gsap.set(clawArmLeft, { rotation: 10 });
  gsap.set(clawArmRight, { rotation: -10 });

  // Pre-calculated organic 3D mound slots (overlapping and covering each other naturally)
  const CLAW_PILE_SLOTS = [
    // Tier 1: Floor row (bottom 2-5px)
    { left: 1, bottom: 2, z: 8, rot: -4 },
    { left: 13, bottom: 4, z: 9, rot: 5 },
    { left: 25, bottom: 1, z: 8, rot: -3 },
    { left: 37, bottom: 3, z: 9, rot: 4 },
    { left: 49, bottom: 2, z: 8, rot: -5 },
    { left: 61, bottom: 4, z: 9, rot: 3 },
    { left: 73, bottom: 1, z: 8, rot: -2 },
    { left: 85, bottom: 3, z: 9, rot: 4 },

    // Tier 1.5: Deep crevices (bottom 16-20px)
    { left: 7, bottom: 18, z: 4, rot: 6 },
    { left: 19, bottom: 16, z: 5, rot: -5 },
    { left: 31, bottom: 20, z: 4, rot: 3 },
    { left: 43, bottom: 17, z: 5, rot: -4 },
    { left: 55, bottom: 19, z: 4, rot: 5 },
    { left: 67, bottom: 16, z: 5, rot: -3 },
    { left: 79, bottom: 18, z: 4, rot: 4 },

    // Tier 2: Front middle layer (bottom 31-36px, z: 18-20)
    { left: 3, bottom: 32, z: 18, rot: -3 },
    { left: 15, bottom: 35, z: 19, rot: 4 },
    { left: 27, bottom: 33, z: 18, rot: -4 },
    { left: 39, bottom: 36, z: 20, rot: 3 },
    { left: 51, bottom: 34, z: 19, rot: -5 },
    { left: 63, bottom: 36, z: 20, rot: 4 },
    { left: 75, bottom: 33, z: 18, rot: -2 },
    { left: 86, bottom: 32, z: 17, rot: 5 },

    // Tier 2.5: Mid-high crevices (bottom 48-53px, z: 12-14)
    { left: 9, bottom: 49, z: 12, rot: 4 },
    { left: 22, bottom: 52, z: 13, rot: -3 },
    { left: 35, bottom: 50, z: 12, rot: 5 },
    { left: 48, bottom: 53, z: 14, rot: -4 },
    { left: 61, bottom: 51, z: 13, rot: 3 },
    { left: 74, bottom: 48, z: 12, rot: -5 },

    // Tier 3: Top crest hill mound (bottom 63-70px, z: 24-28)
    { left: 16, bottom: 64, z: 24, rot: -4 },
    { left: 29, bottom: 68, z: 26, rot: 3 },
    { left: 42, bottom: 70, z: 28, rot: -2 },
    { left: 55, bottom: 67, z: 26, rot: 4 },
    { left: 68, bottom: 63, z: 24, rot: -3 }
  ];

  // Render natural organic 3D Gashapon pile (supports 100+ dishes gracefully)
  function renderBallPit() {
    ballPit.innerHTML = '';
    const currentList = getActiveItemsOrFallback();
    
    // Support gracefully from few dishes up to 100+ dishes:
    // Sample items to fill the 34 organic slots
    const displayPool = [];
    if (currentList.length >= CLAW_PILE_SLOTS.length) {
      const shuffled = [...currentList].sort(() => 0.5 - Math.random());
      displayPool.push(...shuffled.slice(0, CLAW_PILE_SLOTS.length));
    } else {
      while (displayPool.length < CLAW_PILE_SLOTS.length) {
        displayPool.push(...currentList);
      }
    }

    CLAW_PILE_SLOTS.forEach((slot, idx) => {
      const item = displayPool[idx];
      if (!item) return;

      const ball = document.createElement('div');
      ball.className = 'shiny-food-ball';
      
      const grad = BALL_GRADIENTS[idx % BALL_GRADIENTS.length];
      ball.style.background = grad.bg;
      
      // Exact organic position & layering
      ball.style.left = `${slot.left}%`;
      ball.style.bottom = `${slot.bottom}px`;
      ball.style.zIndex = slot.z;
      ball.style.transform = `rotate(${slot.rot}deg)`;

      ball.setAttribute('data-food-name', item.name);
      ball.setAttribute('data-food-icon', item.icon || (appMode === 'place' ? '📍' : '🍱'));
      ball.setAttribute('data-grad', grad.bg);

      // Miniature price badge
      const shortPrice = appMode === 'place'
        ? (Number(item.cost) === 0 ? 'Free' : getPriceShort(item.cost))
        : getPriceShort(item.price);

      if (item.image) {
        ball.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="w-7 h-7 rounded-full object-cover shadow-sm pointer-events-none border border-white/60">
          <div class="flex items-center justify-center gap-0.5 mt-0.5 pointer-events-none">
            <span class="text-[7px] font-black text-white bg-black/60 px-1 rounded-full line-clamp-1 max-w-[32px] text-center leading-tight">${item.name.split(' ')[0]}</span>
            <span class="text-[6.5px] font-black text-stone-900 bg-amber-400 px-1 rounded-full leading-tight shadow-sm">${shortPrice}</span>
          </div>
        `;
      } else {
        ball.innerHTML = `
          <span class="text-xl filter drop-shadow select-none leading-none pointer-events-none">${item.icon || (appMode === 'place' ? '📍' : '🍱')}</span>
          <div class="flex items-center justify-center gap-0.5 mt-0.5 pointer-events-none">
            <span class="text-[7.5px] font-black text-white bg-black/50 px-1 rounded-full line-clamp-1 max-w-[32px] text-center leading-tight">${item.name.split(' ')[0]}</span>
            <span class="text-[6.5px] font-black text-stone-900 bg-amber-400 px-1 rounded-full leading-tight shadow-sm">${shortPrice}</span>
          </div>
        `;
      }

      ballPit.appendChild(ball);
    });
  }
  renderBallPit();

  // Gentle crane idle tracking
  function startCraneIdle() {
    if (!window.gsap) return;
    if (craneIdleTween) craneIdleTween.kill();
    craneIdleTween = gsap.to(craneCarriage, {
      left: '74%',
      duration: 2.3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }
  startCraneIdle();

  // Grab trigger handler
  function triggerClawGrab() {
    if (isActionRunning) return;
    isActionRunning = true;
    audio.playPop();
    if (joystickTrigger) {
      joystickTrigger.disabled = true;
      joystickTrigger.classList.add('opacity-50', 'pointer-events-none');
    }

    if (craneIdleTween) craneIdleTween.pause();

    // Satisfying mechanical joystick tilt animation
    if (window.gsap) {
      gsap.timeline()
        .to(joystickStick, { rotation: 30, duration: 0.12, ease: 'power2.out' })
        .to(joystickStick, { rotation: -16, duration: 0.12, ease: 'power2.inOut' })
        .to(joystickStick, { rotation: 0, duration: 0.25, ease: 'elastic.out(1.2, 0.4)' });

      if (catGifContainer) {
        gsap.to(catGifContainer, { scale: 1.12, duration: 0.14, yoyo: true, repeat: 3 });
      }
    }

    const winningFood = getRandomItem();
    const pitBalls = ballPit.querySelectorAll('.shiny-food-ball');
    const targetBall = pitBalls[Math.floor(Math.random() * pitBalls.length)] || pitBalls[0];

    const chamberRect = document.querySelector('.claw-arcade-chamber').getBoundingClientRect();
    let targetXPercent = 55;
    if (targetBall) {
      const bRect = targetBall.getBoundingClientRect();
      targetXPercent = ((bRect.left + bRect.width / 2 - chamberRect.left) / chamberRect.width) * 100;
      targetXPercent = Math.max(28, Math.min(84, targetXPercent));
    }

    const grad = targetBall ? targetBall.getAttribute('data-grad') : BALL_GRADIENTS[0].bg;

    const timeline = gsap.timeline();

    // 1. Carriage moves horizontally above target ball
    timeline.to(craneCarriage, {
      left: `${targetXPercent}%`,
      duration: 0.8,
      ease: 'power2.inOut'
    });

    // 2. Claws open wide BEFORE and during descent
    timeline.to(clawArmLeft, { rotation: 28, duration: 0.25, ease: 'power2.out' }, 'openClaws');
    timeline.to(clawArmRight, { rotation: -28, duration: 0.25, ease: 'power2.out' }, 'openClaws');

    // 3. Lower steel cable down into the pit (claws wide open)
    timeline.to(craneCable, {
      height: 165,
      duration: 1.1,
      ease: 'power1.inOut'
    });

    // 4. Claws clamp snugly around the sphere
    timeline.call(() => {
      audio.playMeow();
      if (targetBall) {
        gsap.to(targetBall, { scale: 0.7, opacity: 0.2, duration: 0.2 });
      }
    });

    timeline.to(clawArmLeft, { rotation: 6, duration: 0.25, ease: 'power2.out' }, 'clampClaws');
    timeline.to(clawArmRight, { rotation: -6, duration: 0.25, ease: 'power2.out' }, 'clampClaws');

    // 5. Held ball appears with real image or emoji inside the grip
    timeline.call(() => {
      if (winningFood.image) {
        heldFoodContent.innerHTML = `<img src="${winningFood.image}" class="w-8 h-8 rounded-full object-cover shadow-sm border border-white">`;
      } else {
        heldFoodContent.innerHTML = `<span class="text-2xl filter drop-shadow">${winningFood.icon || (appMode === 'place' ? '📍' : '🍱')}</span>`;
      }
      const displayPrice = appMode === 'place'
        ? (Number(winningFood.cost) === 0 ? 'Miễn phí' : formatPrice(winningFood.cost))
        : formatPrice(winningFood.price);
      heldFoodLabel.textContent = `${winningFood.name} (${displayPrice})`;
      heldClawBall.style.background = grad;
      heldClawBall.classList.remove('hidden');
      gsap.set(heldClawBall, { y: 0, opacity: 1, scale: 1 });
    });

    timeline.to(craneCable, {
      height: 25,
      duration: 1.2,
      ease: 'power1.inOut'
    });

    // 6. Carriage glides to Drop Chute (left corner: 14%)
    timeline.to(craneCarriage, {
      left: '14%',
      duration: 0.95,
      ease: 'power2.inOut'
    });

    // 7. Claws open wide & drop ball into chute!
    timeline.to(clawArmLeft, { rotation: 28, duration: 0.2 }, 'dropBall');
    timeline.to(clawArmRight, { rotation: -28, duration: 0.2 }, 'dropBall');

    timeline.call(() => {
      audio.playBellDing();
    });

    // 8. Ball falls through chute with gravity bounce
    timeline.to(heldClawBall, {
      y: 190,
      opacity: 0,
      scale: 0.8,
      duration: 0.55,
      ease: 'bounce.out'
    });

    // 9. Reset claws & show Result Modal
    timeline.call(() => {
      heldClawBall.classList.add('hidden');
      gsap.set(heldClawBall, { y: 0, opacity: 1 });
      gsap.to(clawArmLeft, { rotation: 10, duration: 0.25 });
      gsap.to(clawArmRight, { rotation: -10, duration: 0.25 });

      renderBallPit();
      showResultModal(winningFood);

      isActionRunning = false;
      if (joystickTrigger) {
        joystickTrigger.disabled = false;
        joystickTrigger.classList.remove('opacity-50', 'pointer-events-none');
      }
      startCraneIdle();
    });
  }

  // Click on Joystick OR Cat GIF triggers the grab
  if (joystickTrigger) joystickTrigger.onclick = triggerClawGrab;
  if (catGifContainer) catGifContainer.onclick = triggerClawGrab;
}

// --- 8. MINI-GAME 2: 3D SLOT MACHINE (RAPID TUMBLING REELS) ---
let currentSlotReelFoods = [null, null, null];

function createSlotReelItemHtml(food, height) {
  if (food && food.image) {
    return `
      <div class="w-full flex items-center justify-center flex-shrink-0" style="height: ${height}px;">
        <img src="${food.image}" alt="${food.name}" class="w-9 h-9 md:w-11 md:h-11 rounded-xl object-cover shadow border border-amber-300 pointer-events-none select-none">
      </div>
    `;
  }
  return `
    <div class="w-full flex items-center justify-center flex-shrink-0" style="height: ${height}px;">
      <span class="text-3xl md:text-4xl filter drop-shadow pointer-events-none select-none leading-none">${(food && food.icon) || (appMode === 'place' ? '📍' : '🍱')}</span>
    </div>
  `;
}

function setupSlotMachine() {
  const spinBtn = document.getElementById('btn-slot-spin');
  const tailTrigger = document.getElementById('slot-tail-trigger');
  const machineImg = document.getElementById('slot-machine-img');
  const reelStrips = [
    document.getElementById('slot-reel-1'),
    document.getElementById('slot-reel-2'),
    document.getElementById('slot-reel-3')
  ];

  const activePool = getActiveItemsOrFallback();

  // Determine reel viewport height dynamically
  const getReelItemHeight = () => {
    if (reelStrips[0] && reelStrips[0].parentElement) {
      return reelStrips[0].parentElement.clientHeight || (window.innerWidth < 768 ? 56 : 64);
    }
    return window.innerWidth < 768 ? 56 : 64;
  };

  // Initial state of reels (showing distinct cute foods)
  const itemHeight = getReelItemHeight();
  reelStrips.forEach((strip, i) => {
    if (!strip) return;
    if (!currentSlotReelFoods[i] || !activePool.some(f => f.name === currentSlotReelFoods[i].name)) {
      currentSlotReelFoods[i] = activePool[i % activePool.length];
    }
    strip.innerHTML = createSlotReelItemHtml(currentSlotReelFoods[i], itemHeight);
    if (window.gsap) gsap.set(strip, { y: 0 });
    strip.classList.remove('slot-blur', 'slot-spinning');
  });

  const doSpin = () => {
    if (isActionRunning) return;
    isActionRunning = true;
    audio.playPop();
    spinBtn.disabled = true;
    spinBtn.classList.add('opacity-50');

    // Tail pull & cabinet vibration
    if (window.gsap) {
      gsap.timeline()
        .to(machineImg, { scale: 0.98, duration: 0.08, yoyo: true, repeat: 1 })
        .to(tailTrigger, { rotate: 22, transformOrigin: 'top right', duration: 0.12, yoyo: true, repeat: 1 });
    }

    setTimeout(() => {
      audio.playMeow();
    }, 150);

    const winningFood = getRandomItem();
    const currentHeight = getReelItemHeight();

    // Start fast mechanical ticking sound while reels are whizzing
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      audio.playSlotTick();
      tickCount++;
      if (tickCount > 28) {
        clearInterval(tickInterval);
      }
    }, 85);

    // Spin parameters for each of the 3 reels
    const spinConfigs = [
      { count: 30, duration: 1.8 },
      { count: 40, duration: 2.3 },
      { count: 50, duration: 2.8 }
    ];

    reelStrips.forEach((strip, i) => {
      if (!strip) return;
      const config = spinConfigs[i];
      const startFood = currentSlotReelFoods[i] || activePool[0];

      // Build a dynamic sequence of dozens of items streaming past:
      const itemsList = [startFood];
      for (let k = 1; k < config.count; k++) {
        itemsList.push(activePool[Math.floor(Math.random() * activePool.length)]);
      }
      itemsList.push(winningFood); // targetIndex = config.count
      itemsList.push(activePool[Math.floor(Math.random() * activePool.length)]); // extra buffer for bounce
      itemsList.push(activePool[Math.floor(Math.random() * activePool.length)]);

      // Render the full tumble strip
      strip.innerHTML = itemsList.map(f => createSlotReelItemHtml(f, currentHeight)).join('');
      if (window.gsap) gsap.set(strip, { y: 0 });

      strip.classList.add('slot-spinning');

      const targetY = -config.count * currentHeight;

      if (window.gsap) {
        gsap.to(strip, {
          y: targetY,
          duration: config.duration,
          ease: 'back.out(1.2)', // Authentic mechanical slot bounce on stop!
          onUpdate: function() {
            if (this.progress() > 0.75 && strip.classList.contains('slot-spinning')) {
              strip.classList.remove('slot-spinning');
            }
          },
          onComplete: () => {
            strip.classList.remove('slot-spinning');
            audio.playBellDing();
            currentSlotReelFoods[i] = winningFood;

            // When the 3rd and final reel snaps into place: JACKPOT!
            if (i === 2) {
              clearInterval(tickInterval);
              audio.playFanfare();
              shootConfetti();

              setTimeout(() => {
                // Tidy up each strip to clean winningFood at y: 0
                reelStrips.forEach((s) => {
                  s.innerHTML = createSlotReelItemHtml(winningFood, currentHeight);
                  gsap.set(s, { y: 0 });
                });

                showResultModal(winningFood);
                isActionRunning = false;
                spinBtn.disabled = false;
                spinBtn.classList.remove('opacity-50');
              }, 450);
            }
          }
        });
      } else {
        // Fallback without GSAP
        strip.style.transition = `transform ${config.duration}s cubic-bezier(0.12, 0.8, 0.32, 1)`;
        strip.style.transform = `translateY(${targetY}px)`;
        setTimeout(() => {
          strip.classList.remove('slot-spinning');
          audio.playBellDing();
          currentSlotReelFoods[i] = winningFood;
          if (i === 2) {
            clearInterval(tickInterval);
            showResultModal(winningFood);
            isActionRunning = false;
            spinBtn.disabled = false;
            spinBtn.classList.remove('opacity-50');
          }
        }, config.duration * 1000);
      }
    });
  };

  spinBtn.onclick = doSpin;
  tailTrigger.onclick = doSpin;
}

// --- 9. MINI-GAME 3: POKÉMON-STYLE BOOSTER PACK UNBOXING ---
const CAT_TAROT_FORTUNES = [
  "✦ Quẻ Thượng Thượng Cát: Món này vũ trụ bảo ăn là hết đau đầu! ✦",
  "✦ Điềm Lành: Hôm nay ăn món này lộc lá tràn trề, ví tiền rủng rỉnh! ✦",
  "✦ Lời Sấm Tiên Tri: Ăn ngay kẻo đói xỉu nha Sen! ✦",
  "✦ Quẻ Đại Cát: Một muỗng đắm say, hai muỗng ngất ngây! ✦",
  "✦ Vận Mệnh Ẩm Thực: Ăn món này sẽ gặp may mắn ngập tràn! ✦",
  "✦ Quẻ Tình Duyên: Ăn no bụng rồi mới có sức tìm người yêu! ✦",
  "✦ Tín Hiệu Vũ Trụ: Đúng món ruột của Sen rồi, chén thôi! ✦"
];

const CAT_PLACE_FORTUNES = [
  "✦ Quẻ Thượng Thượng Cát: Đến đây xả stress đảm bảo tâm trạng phơi phới! ✦",
  "✦ Tín Hiệu Vũ Trụ: Lên đồ ngay đi Sen, hôm nay đi chơi là gặp may mắn lớn! ✦",
  "✦ Quẻ Tình Duyên: Chỗ này hẹn hò lãng mạn số 1, người ấy mê tít! ✦",
  "✦ Điềm Lành: Tới đây chụp ảnh nghìn like, lộc lá ngập tràn! ✦",
  "✦ Quẻ Đại Cát: Điểm đến chân ái trúng tủ của Sen hôm nay! ✦"
];

function setupOmikuji() {
  const openBtn = document.getElementById('btn-omikuji-shake');
  const boosterPack = document.getElementById('booster-pack');
  const packTopPiece = document.getElementById('pack-top-piece');
  const packBodyPiece = document.getElementById('pack-body-piece');
  const packLightBurst = document.getElementById('pack-light-burst');
  const cardContainer = document.getElementById('omikuji-stick');
  const cardInner = document.getElementById('tarot-card-inner');
  const tarotFoodImgContainer = document.getElementById('tarot-food-img-container');
  const tarotFoodName = document.getElementById('tarot-food-name');
  const tarotFortuneText = document.getElementById('tarot-fortune-text');

  let showcaseTimer = null;
  let floatTween = null;

  function doOpenPack() {
    if (isActionRunning) return;
    isActionRunning = true;
    audio.playPop();
    openBtn.disabled = true;
    openBtn.classList.add('opacity-50');

    // 1. Pack vibrates and rises with suspense
    const tl = gsap.timeline();

    tl.to(boosterPack, {
      y: -14,
      scale: 1.04,
      duration: 0.35,
      ease: 'power2.out'
    });

    tl.to(boosterPack, {
      x: 5,
      duration: 0.05,
      repeat: 8,
      yoyo: true,
      ease: 'none'
    });

    // 2. Tear the top strip slowly and smoothly across
    tl.call(() => {
      audio.playFoilTear();
    });

    // Top piece tears diagonally across to the right and peels away (smooth 0.9s peel)
    tl.to(packTopPiece, {
      x: 160,
      y: -50,
      rotation: 42,
      opacity: 0,
      duration: 0.9,
      ease: 'power1.inOut'
    });

    // Golden light beam erupts from the torn opening!
    tl.fromTo(packLightBurst,
      { scale: 0.2, opacity: 0 },
      { scale: 2.6, opacity: 1, duration: 0.5, yoyo: true, repeat: 1, ease: 'power2.out' },
      '-=0.7'
    );

    // Pick the winning item and prepare card
    tl.call(() => {
      const winningFood = getRandomItem();
      const fortunePool = appMode === 'place' ? CAT_PLACE_FORTUNES : CAT_TAROT_FORTUNES;
      const fortune = fortunePool[Math.floor(Math.random() * fortunePool.length)];

      if (tarotFoodName) tarotFoodName.textContent = winningFood.name;
      if (tarotFortuneText) tarotFortuneText.textContent = fortune;
      const tarotFoodPrice = document.getElementById('tarot-food-price');
      const tarotFoodTag = document.getElementById('tarot-food-tag');
      if (tarotFoodPrice) {
        if (appMode === 'place') {
          const costVal = Number(winningFood.cost) || 0;
          tarotFoodPrice.textContent = costVal === 0 ? 'Miễn phí' : formatPrice(costVal);
        } else {
          tarotFoodPrice.textContent = formatPrice(winningFood.price);
        }
      }
      if (tarotFoodTag) {
        if (appMode === 'place') {
          const firstTag = (winningFood.placeTags && winningFood.placeTags[0]) || 'chill';
          const tagObj = placeTags.find(t => t.key === firstTag) || placeTags[0] || { icon: '📍', label: 'Đi chơi' };
          tarotFoodTag.textContent = `${tagObj.icon || '📍'} ${tagObj.label}`;
        } else {
          const firstTag = (winningFood.mealTimes && winningFood.mealTimes[0]) || 'trua';
          const tagObj = mealTags.find(t => t.key === firstTag) || mealTags[1] || { icon: '🍱', label: 'Bữa trưa' };
          tarotFoodTag.textContent = `${tagObj.icon || '🍱'} ${tagObj.label}`;
        }
      }
      if (tarotFoodImgContainer) {
        if (winningFood.image) {
          tarotFoodImgContainer.innerHTML = `<img src="${winningFood.image}" alt="${winningFood.name}" class="w-full h-full object-cover">`;
        } else {
          tarotFoodImgContainer.innerHTML = `<span class="text-4xl sm:text-5xl filter drop-shadow select-none">${winningFood.icon || (appMode === 'place' ? '📍' : '🍱')}</span>`;
        }
      }

      // Prepare card: FACE DOWN (rotateY: 180) behind wrapper, locked at center
      cardContainer.style.setProperty('display', 'block', 'important');
      cardContainer.classList.remove('hidden');
      gsap.set(cardInner, { rotateY: 180, x: 0, y: 15, scale: 0.92, opacity: 1 });
    });

    // 3. Outer foil wrapper body slides down and drops completely away
    tl.call(() => {
      audio.playFoilSlide();
      audio.playMeow();
    });

    tl.to(packBodyPiece, {
      y: 450,
      opacity: 0,
      rotation: -6,
      duration: 0.85,
      ease: 'power2.in',
      onComplete: () => {
        boosterPack.style.display = 'none';
      }
    });

    // Simultaneously, the mysterious FACE-DOWN card rises smoothly to dead center stage
    tl.to(cardInner, {
      x: 0,
      y: 0,
      scale: 1.0,
      duration: 0.85,
      ease: 'power2.out'
    }, '<');

    // Dramatic suspense pause while looking at the card back!
    tl.to({}, { duration: 0.35 });

    // 4. THE CARD FLIPS OVER IN JAW-DROPPING 3D TO REVEAL THE PRIZE!
    tl.call(() => {
      audio.playFanfare();
      audio.playBellDing();
      shootConfetti();
      setTimeout(shootConfetti, 400);
    });

    tl.to(cardInner, {
      rotateY: 0,
      scale: 1.05,
      x: 0,
      y: 0,
      duration: 1.15,
      ease: 'back.out(1.35)',
      onComplete: () => {
        // Idle gentle float centered in the box
        floatTween = gsap.to(cardInner, {
          y: -10,
          duration: 1.8,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
      }
    });

    // 5. 5-Second Showcase for everyone to see the card!
    tl.call(() => {
      function finishShowcase() {
        if (showcaseTimer) {
          clearTimeout(showcaseTimer);
          showcaseTimer = null;
        }
        if (floatTween) {
          floatTween.kill();
          floatTween = null;
        }

        const winningItem = getActiveItemsOrFallback().find(f => f.name === tarotFoodName.textContent) || getActiveItemsOrFallback()[0];
        showResultModal(winningItem);
        cardContainer.style.setProperty('display', 'none', 'important');
        cardContainer.classList.add('hidden');

        // Reset booster pack back to unopened state for next pull!
        boosterPack.style.display = 'flex';
        gsap.set(packTopPiece, { x: 0, y: 0, rotation: 0, opacity: 1 });
        gsap.set(packBodyPiece, { x: 0, y: 0, rotation: 0, opacity: 1 });
        gsap.set(boosterPack, { y: 0, x: 0, scale: 1 });
        gsap.set(cardInner, { x: 0, y: 0, rotateY: 180, scale: 1 });
        gsap.fromTo(boosterPack,
          { scale: 0.85, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.2)' }
        );

        isActionRunning = false;
        openBtn.disabled = false;
        openBtn.classList.remove('opacity-50');
      }

      showcaseTimer = setTimeout(finishShowcase, 5000);
      if (cardInner) cardInner.onclick = finishShowcase;
    });
  }

  // Both button click and clicking the foil pack directly trigger the unbox!
  if (openBtn) openBtn.onclick = doOpenPack;
  if (boosterPack) boosterPack.onclick = doOpenPack;
}

// --- 10. TAB NAVIGATION ---
function initTabs() {
  const tabs = [
    { id: 'tab-claw', view: 'view-claw', activeClass: 'text-rose-600' },
    { id: 'tab-slot', view: 'view-slot', activeClass: 'text-amber-600' },
    { id: 'tab-omikuji', view: 'view-omikuji', activeClass: 'text-red-600' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.id);
    btn.onclick = () => {
      if (isActionRunning) return;
      audio.playPop();

      tabs.forEach(item => {
        const itemBtn = document.getElementById(item.id);
        const itemView = document.getElementById(item.view);
        if (item.id === t.id) {
          itemBtn.className = `px-4 md:px-6 py-2.5 rounded-2xl font-black text-xs md:text-sm transition-all duration-300 flex items-center space-x-2 bg-white ${item.activeClass} shadow-md scale-105`;
          itemView.classList.remove('hidden');
          if (window.gsap) {
            gsap.fromTo(itemView, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 });
          }
        } else {
          itemBtn.className = 'px-4 md:px-6 py-2.5 rounded-2xl font-black text-xs md:text-sm transition-all duration-300 flex items-center space-x-2 text-stone-500 hover:bg-rose-50';
          itemView.classList.add('hidden');
        }
      });
    };
  });
}

// --- 11. DYNAMIC TAG MANAGEMENT & CHIPS ---
function renderModalTagChips(selectedKeys = null) {
  const container = document.getElementById('modal-tag-chips-list');
  if (!container) return;

  if (!selectedKeys) {
    const currentActive = Array.from(container.querySelectorAll('.modal-tag-chip.active-chip')).map(c => c.getAttribute('data-tag'));
    selectedKeys = currentActive.length > 0 ? currentActive : (mealTags.slice(0, 2).map(t => t.key));
  }

  container.innerHTML = '';

  mealTags.forEach(t => {
    const isSelected = selectedKeys.includes(t.key);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `modal-tag-chip ${isSelected ? 'active-chip' : ''} px-2.5 py-1 rounded-lg text-xs font-bold relative inline-flex items-center gap-1`;
    chip.setAttribute('data-tag', t.key);

    let deleteBtnHtml = '';
    if (!t.isDefault) {
      deleteBtnHtml = `<span class="btn-delete-tag ml-1 text-[11px] text-rose-300 hover:text-white bg-rose-200/60 hover:bg-rose-600 rounded-full w-4 h-4 inline-flex items-center justify-center transition-colors shadow-xs" title="Xóa thẻ tag này">×</span>`;
    }

    chip.innerHTML = `<span>${t.icon || '🏷️'} ${t.label}</span>${deleteBtnHtml}`;

    chip.onclick = (e) => {
      if (e.target.classList.contains('btn-delete-tag')) {
        e.stopPropagation();
        deleteCustomTag(t.key);
        return;
      }
      audio.playPop();
      chip.classList.toggle('active-chip');
    };

    container.appendChild(chip);
  });
}

async function deleteCustomTag(tagKey) {
  const targetTag = mealTags.find(t => t.key === tagKey);
  const tagLabel = targetTag ? targetTag.label : tagKey;
  const ok = await showCatConfirm(`Sen có chắc chắn muốn xóa thẻ tag "<b>${tagLabel}</b>" không? 🏷️`, "Xóa Thẻ Tag?", "🏷️", "Xóa Tag 🐾");
  if (!ok) {
    return;
  }
  mealTags = mealTags.filter(t => t.key !== tagKey);
  saveMealTags();

  // Gỡ tag khỏi các món ăn đang có
  foods.forEach(f => {
    if (f.mealTimes && Array.isArray(f.mealTimes)) {
      f.mealTimes = f.mealTimes.filter(k => k !== tagKey);
      if (f.mealTimes.length === 0) f.mealTimes = ['trua'];
    }
  });
  saveFoods();

  if (currentMealTag === tagKey) {
    currentMealTag = 'all';
  }

  renderModalTagChips();
  renderMealFilterButtons();
  updateActiveFilterCount();
  setupClawMachine();
  setupSlotMachine();
  audio.playPop();
  showCatToast(`Đã xóa thẻ tag "${tagLabel}"!`, 'delete');
}

function initCustomTagCreator() {
  const showAddBtn = document.getElementById('btn-show-add-tag');
  const addForm = document.getElementById('new-tag-form');
  const nameInput = document.getElementById('new-tag-name-input');
  const iconSelect = document.getElementById('new-tag-icon-select');
  const submitBtn = document.getElementById('btn-submit-new-tag');
  const cancelBtn = document.getElementById('btn-cancel-new-tag');

  if (!showAddBtn || !addForm) return;

  showAddBtn.onclick = () => {
    audio.playPop();
    addForm.classList.remove('hidden');
    addForm.classList.add('flex');
    nameInput.value = '';
    nameInput.focus();
  };

  cancelBtn.onclick = () => {
    audio.playPop();
    addForm.classList.add('hidden');
    addForm.classList.remove('flex');
  };

  const handleCreateTag = () => {
    const rawName = nameInput.value.trim();
    if (!rawName) {
      nameInput.focus();
      return;
    }

    // Tạo key an toàn không trùng lặp
    const cleanKey = 'tag_' + Date.now();
    const iconVal = iconSelect.value || '🏷️';

    const newTag = {
      key: cleanKey,
      label: rawName,
      icon: iconVal,
      isDefault: false
    };

    mealTags.push(newTag);
    saveMealTags();

    // Tự động chọn thẻ mới thêm vào món ăn đang tạo
    const currentActive = Array.from(document.querySelectorAll('.modal-tag-chip.active-chip')).map(c => c.getAttribute('data-tag'));
    currentActive.push(cleanKey);
    renderModalTagChips(currentActive);

    // Cập nhật bộ lọc ở màn hình chính
    renderMealFilterButtons();
    updateActiveFilterCount();

    nameInput.value = '';
    addForm.classList.add('hidden');
    addForm.classList.remove('flex');
    audio.playBellDing();
    showCatToast(`Đã tạo thẻ tag "${newTag.label}" thành công! 🏷️`, 'success');
  };

  submitBtn.onclick = handleCreateTag;
  nameInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTag();
    } else if (e.key === 'Escape') {
      cancelBtn.click();
    }
  };
}

// --- 11. FOOD & PLACES MANAGER MODAL ---
function initFoodManager() {
  const openBtn = document.getElementById('btn-open-foods');
  const closeBtn = document.getElementById('btn-close-foods');
  const modal = document.getElementById('foods-modal');
  const listContainer = document.getElementById('foods-list-items');
  const addBtn = document.getElementById('btn-add-food');
  const addBtnText = document.getElementById('btn-add-food-text') || addBtn;
  const foodFormTitle = document.getElementById('food-form-title');
  const cancelEditFoodBtn = document.getElementById('btn-cancel-edit-food');
  const newNameInput = document.getElementById('new-food-name');
  const newPriceInput = document.getElementById('new-food-price');
  const newCategorySelect = document.getElementById('new-food-category');
  const newIconSelect = document.getElementById('new-food-icon');
  const resetBtn = document.getElementById('btn-reset-default-foods');

  // Image Upload Elements
  const fileInput = document.getElementById('new-food-file-input');
  const triggerUploadBtn = document.getElementById('btn-trigger-upload');
  const previewImg = document.getElementById('new-image-preview');
  const previewPlaceholder = document.getElementById('preview-placeholder-icon');
  const removeImageBtn = document.getElementById('btn-remove-new-image');
  const imgUrlInput = document.getElementById('new-food-img-url');

  // Compress and handle image upload via Canvas
  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSide = 300;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSide) {
            height *= maxSide / width;
            width = maxSide;
          }
        } else {
          if (height > maxSide) {
            width *= maxSide / height;
            height = maxSide;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        currentUploadedImageBase64 = canvas.toDataURL('image/jpeg', 0.85);
        showPreview(currentUploadedImageBase64);
        imgUrlInput.value = '';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function showPreview(url) {
    previewImg.src = url;
    previewImg.classList.remove('hidden');
    previewPlaceholder.classList.add('hidden');
    removeImageBtn.classList.remove('hidden');
    removeImageBtn.classList.add('flex');
  }

  function clearImagePreview() {
    currentUploadedImageBase64 = null;
    fileInput.value = '';
    imgUrlInput.value = '';
    previewImg.src = '';
    previewImg.classList.add('hidden');
    previewPlaceholder.classList.remove('hidden');
    removeImageBtn.classList.add('hidden');
    removeImageBtn.classList.remove('flex');
  }

  triggerUploadBtn.onclick = () => fileInput.click();
  fileInput.onchange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  // Quick price buttons
  document.querySelectorAll('.price-quick-btn').forEach(btn => {
    btn.onclick = () => {
      audio.playPop();
      if (newPriceInput) {
        newPriceInput.value = btn.getAttribute('data-val');
      }
    };
  });

  // Render dynamic meal tag chips & init custom tag creator
  renderModalTagChips();
  initCustomTagCreator();

  imgUrlInput.oninput = () => {
    const url = imgUrlInput.value.trim();
    if (url) {
      currentUploadedImageBase64 = url;
      showPreview(url);
    } else {
      clearImagePreview();
    }
  };

  removeImageBtn.onclick = clearImagePreview;

  function cancelFoodEdit() {
    editingFoodId = null;
    newNameInput.value = '';
    if (newPriceInput) newPriceInput.value = 35000;
    clearImagePreview();
    renderModalTagChips(['sang', 'trua']);
    if (foodFormTitle) foodFormTitle.innerHTML = `<span>➕</span> <span>Thêm món mới vào thực đơn:</span>`;
    if (addBtnText) addBtnText.textContent = 'Thêm Món';
    if (cancelEditFoodBtn) cancelEditFoodBtn.classList.add('hidden');
    audio.playPop();
  }

  if (cancelEditFoodBtn) cancelEditFoodBtn.onclick = cancelFoodEdit;

  function renderList() {
    window.renderFoodList = renderList;
    const badgeCount = document.getElementById('foods-badge-count');
    const modalTabCount = document.getElementById('modal-foods-tab-count');
    if (badgeCount) badgeCount.textContent = foods.length;
    if (modalTabCount) modalTabCount.textContent = foods.length;
    if (typeof window.renderPublicMenuModal === 'function') window.renderPublicMenuModal();
    listContainer.innerHTML = '';
    
    foods.forEach((food) => {
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between p-2.5 bg-rose-50/70 rounded-2xl border border-rose-100 hover:bg-rose-100/60 transition-all';
      
      const mediaHtml = food.image 
        ? `<img src="${food.image}" alt="${food.name}" class="w-11 h-11 rounded-xl object-cover shadow border border-rose-200">`
        : `<span class="text-2xl">${food.icon || '🍱'}</span>`;

      const tagsHtml = ((food.mealTimes && food.mealTimes.length) ? food.mealTimes : ['trua']).map(getMealTagBadgeHtml).join(' ');

      item.innerHTML = `
        <div class="flex items-center space-x-3">
          ${mediaHtml}
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <p class="font-extrabold text-stone-800 text-sm">${food.name}</p>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">${formatPrice(food.price)}</span>
            </div>
            <div class="flex items-center gap-1 mt-0.5 flex-wrap">
              ${tagsHtml}
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-1 flex-shrink-0">
          <button data-id="${food.id}" class="btn-edit-food w-8 h-8 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 flex items-center justify-center transition-colors" title="Chỉnh sửa món này">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button data-id="${food.id}" class="btn-delete-food w-8 h-8 rounded-full bg-rose-100 text-rose-500 hover:bg-rose-200 flex items-center justify-center transition-colors" title="Xóa món">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      `;
      listContainer.appendChild(item);
    });

    // Wire edit food buttons
    listContainer.querySelectorAll('.btn-edit-food').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const target = foods.find(f => f.id === id);
        if (!target) return;
        editingFoodId = id;
        newNameInput.value = target.name;
        if (newPriceInput) newPriceInput.value = target.price || 35000;
        if (newCategorySelect) newCategorySelect.value = target.category || 'water';
        if (newIconSelect) newIconSelect.value = target.icon || '🍱';
        if (target.image) {
          currentUploadedImageBase64 = target.image;
          showPreview(target.image);
        } else {
          clearImagePreview();
        }
        renderModalTagChips(target.mealTimes || ['trua']);
        if (foodFormTitle) foodFormTitle.innerHTML = `<span>✏️</span> <span>Sửa món: <b class="text-rose-600">${target.name}</b></span>`;
        if (addBtnText) addBtnText.textContent = '💾 Lưu Cập Nhật';
        if (cancelEditFoodBtn) cancelEditFoodBtn.classList.remove('hidden');
        audio.playPop();
      };
    });

    // Wire delete food buttons
    listContainer.querySelectorAll('.btn-delete-food').forEach(btn => {
      btn.onclick = async () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        if (foods.length <= 1) {
          showCatToast("Hoàng Thượng yêu cầu giữ lại ít nhất 1 món ăn trong thực đơn nha Sen!", "warn");
          return;
        }
        const target = foods.find(f => f.id === id);
        const foodName = target ? target.name : 'món này';
        const ok = await showCatConfirm(`Sen có chắc chắn muốn xóa món "<b>${foodName}</b>" khỏi thực đơn không? 😿`, "Xác Nhận Xóa Món?", "🍜", "Xóa Món 🐾");
        if (!ok) {
          return;
        }
        if (editingFoodId === id) {
          cancelFoodEdit();
        }
        foods = foods.filter(f => f.id !== id);
        saveFoods();
        renderList();
        updateActiveFilterCount();
        if (appMode === 'food') {
          setupClawMachine();
          setupSlotMachine();
        }
        audio.playPop();
        showCatToast(`Đã xóa món "${foodName}" khỏi thực đơn!`, 'delete');
      };
    });
  }

  // Password Protection for Management Modal ('liltam')
  const authModal = document.getElementById('auth-modal');
  const authForm = document.getElementById('auth-form');
  const authPasswordInput = document.getElementById('auth-password-input');
  const authErrorMsg = document.getElementById('auth-error-msg');
  const btnToggleAuthPwd = document.getElementById('btn-toggle-auth-pwd');
  const btnAuthCancel = document.getElementById('btn-auth-cancel');
  const btnLockFoodsModal = document.getElementById('btn-lock-foods-modal');

  function openFoodsModalDirectly() {
    renderList();
    renderModalTagChips();
    renderPlaceList();
    renderModalPlaceTags();
    const wlTabCount = document.getElementById('modal-wishlist-tab-count');
    if (wlTabCount) wlTabCount.textContent = coupleWishlist.length;
    const suggTabCount = document.getElementById('modal-suggestions-tab-count');
    if (suggTabCount) suggTabCount.textContent = suggestions.length;
    renderSuggestionsList();
    const tabFoods = document.getElementById('modal-tab-foods');
    if (tabFoods) tabFoods.click();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.gsap) {
      gsap.fromTo('#foods-modal > div', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
    }
  }

  function openAuthModal() {
    if (authErrorMsg) authErrorMsg.classList.add('hidden');
    if (authPasswordInput) {
      authPasswordInput.value = '';
      authPasswordInput.type = 'password';
    }
    if (authModal) {
      authModal.classList.remove('hidden');
      authModal.classList.add('flex');
      if (window.gsap) {
        gsap.fromTo('#auth-modal > div', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.5)' });
      }
      setTimeout(() => { if (authPasswordInput) authPasswordInput.focus(); }, 150);
    }
  }
  window.openAuthModal = openAuthModal;

  function closeAuthModal() {
    if (authModal) {
      authModal.classList.add('hidden');
      authModal.classList.remove('flex');
    }
  }

  if (btnToggleAuthPwd && authPasswordInput) {
    btnToggleAuthPwd.onclick = () => {
      authPasswordInput.type = authPasswordInput.type === 'password' ? 'text' : 'password';
    };
  }

  if (btnAuthCancel) btnAuthCancel.onclick = closeAuthModal;

  if (authForm) {
    authForm.onsubmit = (e) => {
      e.preventDefault();
      const entered = authPasswordInput ? authPasswordInput.value.trim().toLowerCase() : '';
      if (entered === 'liltam') {
        sessionStorage.setItem('liltam_authenticated', 'true');
        closeAuthModal();
        audio.playMeow();
        showCatToast("Chào mừng Lil Tâm đã mở khóa quyền quản trị! 👑", "success");
        if (typeof updateAdminBranding === 'function') updateAdminBranding();
        openFoodsModalDirectly();
      } else {
        if (authErrorMsg) authErrorMsg.classList.remove('hidden');
        if (authPasswordInput) authPasswordInput.select();
        audio.playPop();
        if (window.gsap) {
          gsap.fromTo('#auth-modal > div', { x: -8 }, { x: 8, duration: 0.07, repeat: 5, yoyo: true, onComplete: () => gsap.set('#auth-modal > div', { x: 0 }) });
        }
      }
    };
  }

  if (btnLockFoodsModal) {
    btnLockFoodsModal.onclick = () => {
      audio.playPop();
      sessionStorage.removeItem('liltam_authenticated');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (typeof updateAdminBranding === 'function') updateAdminBranding();
      showCatToast("Đã khóa lại quyền quản trị thực đơn & địa điểm! 🔒", "warn");
    };
  }

  openBtn.onclick = () => {
    audio.playPop();
    if (sessionStorage.getItem('liltam_authenticated') === 'true') {
      openFoodsModalDirectly();
    } else {
      openAuthModal();
    }
  };

  closeBtn.onclick = () => {
    audio.playPop();
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  addBtn.onclick = () => {
    const name = newNameInput.value.trim();
    if (!name) {
      newNameInput.focus();
      return;
    }
    
    const priceVal = newPriceInput ? Number(newPriceInput.value) || 35000 : 35000;
    const activeTags = Array.from(document.querySelectorAll('.modal-tag-chip.active-chip')).map(c => c.getAttribute('data-tag'));
    const mealTimes = activeTags.length > 0 ? activeTags : ['trua'];
    const specificImage = currentUploadedImageBase64 || (imgUrlInput ? imgUrlInput.value.trim() : null) || null;

    if (editingFoodId !== null) {
      const idx = foods.findIndex(f => f.id === editingFoodId);
      if (idx !== -1) {
        foods[idx].name = name;
        foods[idx].price = priceVal;
        foods[idx].mealTimes = mealTimes;
        foods[idx].category = newCategorySelect.value;
        foods[idx].icon = newIconSelect.value;
        if (specificImage) {
          foods[idx].image = specificImage;
        }
      }
      editingFoodId = null;
      if (foodFormTitle) foodFormTitle.innerHTML = `<span>➕</span> <span>Thêm món mới vào thực đơn:</span>`;
      if (addBtnText) addBtnText.textContent = 'Thêm Món';
      if (cancelEditFoodBtn) cancelEditFoodBtn.classList.add('hidden');
      showCatToast(`Đã cập nhật món "${name}" thành công! ✨`, 'edit');
    } else {
      const newFood = {
        id: Date.now(),
        name: name,
        price: priceVal,
        mealTimes: mealTimes,
        category: newCategorySelect.value,
        icon: newIconSelect.value,
        image: specificImage,
        desc: "Món ăn tuyệt hảo do chính Sen đưa vào thực đơn Hoàng Thượng!"
      };
      foods.unshift(newFood);
      showCatToast(`Đã thêm món "${name}" vào thực đơn! 🍜`, 'success');
    }

    saveFoods();
    newNameInput.value = '';
    clearImagePreview();
    renderList();
    renderModalTagChips(['sang', 'trua']);
    updateActiveFilterCount();
    if (appMode === 'food') {
      setupClawMachine();
      setupSlotMachine();
    }
    audio.playBellDing();
  };

  resetBtn.onclick = async () => {
    const ok = await showCatConfirm("Sen có chắc muốn khôi phục về danh sách <b>36 món ăn và đồ uống</b> ban đầu không?", "Khôi Phục Thực Đơn?", "🔄", "Khôi Phục 🐾");
    if (ok) {
      foods = JSON.parse(JSON.stringify(DEFAULT_FOODS));
      saveFoods();
      cancelFoodEdit();
      renderList();
      renderModalTagChips();
      updateActiveFilterCount();
      if (appMode === 'food') {
        setupClawMachine();
        setupSlotMachine();
      }
      audio.playMeow();
      showCatToast("Đã khôi phục danh sách 36 món ăn ban đầu! 🔄", "edit");
    }
  };

  // Initialize Places Manager & Modal Tabs
  initPlacesManager();
  initModalTabs();
}

// --- 11B. PLACES MANAGER LOGIC ---
function renderPlaceList() {
  const listContainer = document.getElementById('places-list-items');
  const modalTabCount = document.getElementById('modal-places-tab-count');
  if (modalTabCount) modalTabCount.textContent = places.length;
  if (typeof window.renderPublicMenuModal === 'function') window.renderPublicMenuModal();
  if (!listContainer) return;
  listContainer.innerHTML = '';

  places.forEach(place => {
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between p-2.5 bg-amber-50/70 rounded-2xl border border-amber-200 hover:bg-amber-100/60 transition-all';

    const costVal = Number(place.cost) || 0;
    const costBadge = costVal === 0
      ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">🆓 Miễn phí</span>`
      : `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">~${formatPrice(costVal)}</span>`;

    const tagsHtml = ((place.placeTags && place.placeTags.length) ? place.placeTags : ['chill']).map(getPlaceTagBadgeHtml).join(' ');

    item.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="text-2xl">${place.icon || '📍'}</span>
        <div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <p class="font-extrabold text-stone-800 text-sm">${place.name}</p>
            ${costBadge}
          </div>
          <div class="flex items-center gap-1 mt-0.5 flex-wrap">
            ${tagsHtml}
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-1 flex-shrink-0">
        <button data-id="${place.id}" class="btn-edit-place w-8 h-8 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center transition-colors" title="Chỉnh sửa địa điểm này">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        </button>
        <button data-id="${place.id}" class="btn-delete-place w-8 h-8 rounded-full bg-rose-100 text-rose-500 hover:bg-rose-200 flex items-center justify-center transition-colors" title="Xóa địa điểm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    `;
    listContainer.appendChild(item);
  });

  // Wire edit place buttons
  listContainer.querySelectorAll('.btn-edit-place').forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const target = places.find(p => p.id === id);
      if (!target) return;
      editingPlaceId = id;
      const nameInput = document.getElementById('new-place-name');
      const costSelect = document.getElementById('new-place-cost');
      const iconSelect = document.getElementById('new-place-icon');
      const titleEl = document.getElementById('place-form-title');
      const addBtnText = document.getElementById('btn-add-place-text');
      const cancelBtn = document.getElementById('btn-cancel-edit-place');

      if (nameInput) nameInput.value = target.name;
      if (costSelect) costSelect.value = target.cost || 0;
      if (iconSelect) iconSelect.value = target.icon || '📍';
      renderModalPlaceTags(target.placeTags || ['chill']);
      if (titleEl) titleEl.innerHTML = `<span>✏️</span> <span>Sửa địa điểm: <b class="text-amber-800">${target.name}</b></span>`;
      if (addBtnText) addBtnText.textContent = '💾 Lưu Cập Nhật';
      if (cancelBtn) cancelBtn.classList.remove('hidden');
      audio.playPop();
    };
  });

  // Wire delete place buttons
  listContainer.querySelectorAll('.btn-delete-place').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      if (places.length <= 1) {
        showCatToast("Hoàng Thượng yêu cầu giữ lại ít nhất 1 địa điểm để đi chơi nha Sen!", "warn");
        return;
      }
      const target = places.find(p => p.id === id);
      const placeName = target ? target.name : 'địa điểm này';
      const ok = await showCatConfirm(`Sen có chắc chắn muốn xóa địa điểm "<b>${placeName}</b>" không? 😿`, "Xác Nhận Xóa Chỗ Đi?", "🎡", "Xóa Địa Điểm 🐾");
      if (!ok) {
        return;
      }
      places = places.filter(p => p.id !== id);
      savePlaces();
      renderPlaceList();
      updateActivePlaceFilterCount();
      if (appMode === 'place') {
        setupClawMachine();
        setupSlotMachine();
      }
      audio.playPop();
      showCatToast(`Đã xóa địa điểm "${placeName}"!`, 'delete');
    };
  });
}

function renderModalPlaceTags(selectedKeys = null) {
  const container = document.getElementById('modal-place-tags-list');
  if (!container) return;

  if (!selectedKeys) {
    const currentActive = Array.from(container.querySelectorAll('.modal-place-tag-chip.active-chip')).map(c => c.getAttribute('data-tag'));
    selectedKeys = currentActive.length > 0 ? currentActive : (placeTags.slice(0, 2).map(t => t.key));
  }

  container.innerHTML = '';
  placeTags.forEach(t => {
    const isSelected = selectedKeys.includes(t.key);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `modal-place-tag-chip ${isSelected ? 'active-chip' : ''} px-2.5 py-1 rounded-lg text-xs font-bold relative inline-flex items-center gap-1`;
    chip.setAttribute('data-tag', t.key);

    chip.innerHTML = `<span>${t.icon || '🏷️'} ${t.label}</span>`;
    chip.onclick = () => {
      audio.playPop();
      chip.classList.toggle('active-chip');
    };
    container.appendChild(chip);
  });
}

function initPlacesManager() {
  const addBtn = document.getElementById('btn-add-place');
  const addBtnText = document.getElementById('btn-add-place-text');
  const nameInput = document.getElementById('new-place-name');
  const costSelect = document.getElementById('new-place-cost');
  const iconSelect = document.getElementById('new-place-icon');
  const titleEl = document.getElementById('place-form-title');
  const cancelBtn = document.getElementById('btn-cancel-edit-place');
  const resetBtn = document.getElementById('btn-reset-default-places');

  function cancelPlaceEdit() {
    editingPlaceId = null;
    if (nameInput) nameInput.value = '';
    if (titleEl) titleEl.innerHTML = `<span>➕</span> <span>Thêm địa điểm đi chơi mới:</span>`;
    if (addBtnText) addBtnText.textContent = 'Thêm Chỗ Đi';
    if (cancelBtn) cancelBtn.classList.add('hidden');
    renderModalPlaceTags(['chill']);
    audio.playPop();
  }

  if (cancelBtn) cancelBtn.onclick = cancelPlaceEdit;

  if (addBtn) {
    addBtn.onclick = () => {
      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) {
        if (nameInput) nameInput.focus();
        return;
      }

      const costVal = costSelect ? Number(costSelect.value) || 0 : 0;
      const iconVal = iconSelect ? iconSelect.value : '📍';
      const activeChips = Array.from(document.querySelectorAll('.modal-place-tag-chip.active-chip')).map(c => c.getAttribute('data-tag'));
      const activeTags = activeChips.length > 0 ? activeChips : ['chill'];

      if (editingPlaceId !== null) {
        const idx = places.findIndex(p => p.id === editingPlaceId);
        if (idx !== -1) {
          places[idx].name = name;
          places[idx].cost = costVal;
          places[idx].icon = iconVal;
          places[idx].placeTags = activeTags;
        }
        editingPlaceId = null;
        if (titleEl) titleEl.innerHTML = `<span>➕</span> <span>Thêm địa điểm đi chơi mới:</span>`;
        if (addBtnText) addBtnText.textContent = 'Thêm Chỗ Đi';
        if (cancelBtn) cancelBtn.classList.add('hidden');
        showCatToast(`Đã cập nhật địa điểm "${name}" thành công! ✨`, 'edit');
      } else {
        const newPlace = {
          id: Date.now(),
          name: name,
          category: 'custom',
          icon: iconVal,
          cost: costVal,
          placeTags: activeTags,
          desc: 'Địa điểm hấp dẫn do chính Sen đưa vào lịch trình vi vu!'
        };
        places.unshift(newPlace);
        showCatToast(`Đã thêm địa điểm "${name}" đi chơi mới! 🎡`, 'success');
      }

      savePlaces();
      if (nameInput) nameInput.value = '';
      renderPlaceList();
      renderModalPlaceTags(['chill']);
      updateActivePlaceFilterCount();
      if (appMode === 'place') {
        setupClawMachine();
        setupSlotMachine();
      }
      audio.playBellDing();
    };
  }

  if (resetBtn) {
    resetBtn.onclick = async () => {
      const ok = await showCatConfirm("Sen có chắc muốn khôi phục về danh sách <b>20 địa điểm gốc</b> không?", "Khôi Phục Địa Điểm?", "🔄", "Khôi Phục 🐾");
      if (ok) {
        places = JSON.parse(JSON.stringify(DEFAULT_PLACES));
        savePlaces();
        cancelPlaceEdit();
        renderPlaceList();
        renderModalPlaceTags(['chill']);
        updateActivePlaceFilterCount();
        if (appMode === 'place') {
          setupClawMachine();
          setupSlotMachine();
        }
        audio.playMeow();
        showCatToast("Đã khôi phục danh sách địa điểm ban đầu! 🔄", "edit");
      }
    };
  }

  renderPlaceList();
  renderModalPlaceTags();
}

function updateSuggestionsTabCount() {
  const badge = document.getElementById('modal-suggestions-tab-count');
  if (badge) badge.textContent = suggestions.length;
}

function renderSuggestionsList() {
  const container = document.getElementById('suggestions-list-container');
  const emptyState = document.getElementById('suggestions-empty-state');
  if (!container) return;
  container.innerHTML = '';

  updateSuggestionsTabCount();

  if (!suggestions || suggestions.length === 0) {
    if (emptyState) {
      emptyState.classList.remove('hidden');
      emptyState.classList.add('flex');
    }
    return;
  }
  if (emptyState) {
    emptyState.classList.add('hidden');
    emptyState.classList.remove('flex');
  }

  suggestions.forEach(s => {
    const card = document.createElement('div');
    card.className = 'p-3 bg-white rounded-2xl border border-amber-200 shadow-xs hover:border-amber-300 transition-all flex flex-col gap-1.5';

    const priceBadge = s.price && Number(s.price) > 0
      ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">~${formatPrice(Number(s.price))}</span>`
      : '';

    card.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-1">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-base">🍜</span>
          <span class="font-black text-stone-800 text-sm">${escapeHtml(s.foodName)}</span>
          ${priceBadge}
        </div>
        <span class="text-[10px] text-stone-400 font-semibold">${escapeHtml(s.createdAt || '')}</span>
      </div>
      ${s.location ? `<div class="text-xs text-stone-600 font-semibold flex items-center gap-1">📍 <span>${escapeHtml(s.location)}</span></div>` : ''}
      ${s.note ? `<div class="text-xs text-stone-600 italic bg-amber-50/70 p-2 rounded-xl border border-amber-100">💬 "${escapeHtml(s.note)}"</div>` : ''}
      <div class="flex items-center justify-between pt-1 border-t border-stone-100 flex-wrap gap-2">
        <span class="text-[10px] text-rose-500 font-bold">Người gửi: <b>${escapeHtml(s.sender || 'Khách dễ thương')}</b></span>
        <div class="flex items-center gap-1.5">
          <button class="btn-adopt-suggestion px-2.5 py-1 rounded-lg text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-xs flex items-center gap-1 transition-all" title="Chuyển sang form thêm món ăn">
            <span>➕</span> <span>Thêm vào thực đơn</span>
          </button>
          <button class="btn-delete-suggestion w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors" title="Xóa gợi ý này">
            🗑️
          </button>
        </div>
      </div>
    `;

    const adoptBtn = card.querySelector('.btn-adopt-suggestion');
    if (adoptBtn) {
      adoptBtn.onclick = () => {
        audio.playPop();
        const tabFoods = document.getElementById('modal-tab-foods');
        if (tabFoods) tabFoods.click();

        const nameInput = document.getElementById('new-food-name');
        const priceInput = document.getElementById('new-food-price');
        if (nameInput) {
          nameInput.value = s.foodName;
          nameInput.focus();
        }
        if (priceInput && s.price) {
          priceInput.value = s.price;
        }
        showCatToast(`Đã nạp món "${s.foodName}" vào form! Hãy chọn nhóm rồi bấm Thêm món nha ✨`, 'edit');
      };
    }

    const delBtn = card.querySelector('.btn-delete-suggestion');
    if (delBtn) {
      delBtn.onclick = async () => {
        const ok = await showCatConfirm(`Sen có chắc muốn xóa gợi ý món "<b>${s.foodName}</b>" này không? 🗑️`, "Xóa Gợi Ý?", "🗑️", "Xóa Ngay 🐾");
        if (!ok) return;
        suggestions = suggestions.filter(item => item.id !== s.id);
        saveSuggestionsLocally();
        if (fbDb) {
          fbDb.ref('suggestions').child(String(s.id)).remove().catch(e => console.warn(e));
        }
        renderSuggestionsList();
        updateSuggestionsTabCount();
        audio.playPop();
        showCatToast(`Đã xóa gợi ý "${s.foodName}"!`, "delete");
      };
    }

    container.appendChild(card);
  });
}

function initModalTabs() {
  const tabFoods = document.getElementById('modal-tab-foods');
  const tabPlaces = document.getElementById('modal-tab-places');
  const tabWishlist = document.getElementById('modal-tab-wishlist');
  const tabSuggestions = document.getElementById('modal-tab-suggestions');

  const secFoods = document.getElementById('modal-foods-section');
  const secPlaces = document.getElementById('modal-places-section');
  const secWishlist = document.getElementById('modal-wishlist-section');
  const secSuggestions = document.getElementById('modal-suggestions-section');

  function updateModalWishlistStats() {
    const totalEl = document.getElementById('modal-wl-total');
    const doneEl = document.getElementById('modal-wl-done');
    const pendingEl = document.getElementById('modal-wl-pending');
    const tabCount = document.getElementById('modal-wishlist-tab-count');
    if (tabCount) tabCount.textContent = coupleWishlist.length;
    if (totalEl) totalEl.textContent = coupleWishlist.length;
    if (doneEl) doneEl.textContent = coupleWishlist.filter(i => i.status === 'done').length;
    if (pendingEl) pendingEl.textContent = coupleWishlist.filter(i => i.status !== 'done').length;
  }

  function setTabActive(activeTab) {
    [tabFoods, tabPlaces, tabWishlist, tabSuggestions].forEach(tab => {
      if (!tab) return;
      if (tab === activeTab) {
        tab.className = 'py-2 px-1 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 bg-white text-rose-600 shadow-sm truncate';
      } else {
        tab.className = 'py-2 px-1 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 text-stone-500 hover:text-stone-800 truncate';
      }
    });
  }

  if (tabFoods) {
    tabFoods.onclick = () => {
      audio.playPop();
      setTabActive(tabFoods);
      if (secFoods) { secFoods.classList.remove('hidden'); secFoods.classList.add('flex'); }
      if (secPlaces) { secPlaces.classList.add('hidden'); secPlaces.classList.remove('flex'); }
      if (secWishlist) { secWishlist.classList.add('hidden'); secWishlist.classList.remove('flex'); }
      if (secSuggestions) { secSuggestions.classList.add('hidden'); secSuggestions.classList.remove('flex'); }
    };
  }

  if (tabPlaces) {
    tabPlaces.onclick = () => {
      audio.playPop();
      setTabActive(tabPlaces);
      if (secPlaces) { secPlaces.classList.remove('hidden'); secPlaces.classList.add('flex'); }
      if (secFoods) { secFoods.classList.add('hidden'); secFoods.classList.remove('flex'); }
      if (secWishlist) { secWishlist.classList.add('hidden'); secWishlist.classList.remove('flex'); }
      if (secSuggestions) { secSuggestions.classList.add('hidden'); secSuggestions.classList.remove('flex'); }
      renderPlaceList();
      renderModalPlaceTags();
    };
  }

  if (tabWishlist) {
    tabWishlist.onclick = () => {
      audio.playPop();
      setTabActive(tabWishlist);
      if (secWishlist) { secWishlist.classList.remove('hidden'); secWishlist.classList.add('flex'); }
      if (secFoods) { secFoods.classList.add('hidden'); secFoods.classList.remove('flex'); }
      if (secPlaces) { secPlaces.classList.add('hidden'); secPlaces.classList.remove('flex'); }
      if (secSuggestions) { secSuggestions.classList.add('hidden'); secSuggestions.classList.remove('flex'); }
      updateModalWishlistStats();
    };
  }

  if (tabSuggestions) {
    tabSuggestions.onclick = () => {
      audio.playPop();
      setTabActive(tabSuggestions);
      if (secSuggestions) { secSuggestions.classList.remove('hidden'); secSuggestions.classList.add('flex'); }
      if (secFoods) { secFoods.classList.add('hidden'); secFoods.classList.remove('flex'); }
      if (secPlaces) { secPlaces.classList.add('hidden'); secPlaces.classList.remove('flex'); }
      if (secWishlist) { secWishlist.classList.add('hidden'); secWishlist.classList.remove('flex'); }
      renderSuggestionsList();
    };
  }

  // Admin Wishlist Buttons
  const adminResetBtn = document.getElementById('btn-admin-wishlist-reset');
  const adminClearBtn = document.getElementById('btn-admin-wishlist-clear');

  if (adminResetBtn) {
    adminResetBtn.onclick = async () => {
      const ok = await showCatConfirm("Sen có chắc muốn khôi phục danh sách địa điểm mẫu ban đầu của <b>Lil Tâm & Ttungg</b> không? 💕", "Khôi Phục Mẫu?", "🔄", "Khôi Phục 🐾");
      if (ok) {
        coupleWishlist = JSON.parse(JSON.stringify(DEFAULT_COUPLE_WISHLIST));
        saveCoupleWishlist();
        renderCoupleWishlist();
        updateModalWishlistStats();
        audio.playMeow();
        showCatToast("Đã khôi phục danh sách địa điểm mẫu! 🔄", "edit");
      }
    };
  }

  if (adminClearBtn) {
    adminClearBtn.onclick = async () => {
      if (coupleWishlist.length === 0) {
        showCatToast("Sổ tay đang trống rồi nha Sen!", "warn");
        return;
      }
      const ok = await showCatConfirm("Sen có chắc muốn <b>xóa toàn bộ</b> danh sách địa điểm trong sổ tay không? 😿", "Xóa Hết Sổ Tay?", "🗑️", "Xóa Tất Cả 🐾");
      if (ok) {
        coupleWishlist = [];
        saveCoupleWishlist();
        renderCoupleWishlist();
        updateModalWishlistStats();
        audio.playMeow();
        showCatToast("Đã xóa toàn bộ sổ tay địa điểm! 🐾", "delete");
      }
    };
  }

  // Clear all suggestions button
  const clearSuggBtn = document.getElementById('btn-clear-all-suggestions');
  if (clearSuggBtn) {
    clearSuggBtn.onclick = async () => {
      if (suggestions.length === 0) {
        showCatToast("Chưa có gợi ý nào để xóa nha Sen!", "warn");
        return;
      }
      const ok = await showCatConfirm("Sen có chắc muốn <b>xóa toàn bộ</b> danh sách gợi ý từ khách hàng không? 📭", "Xóa Hết Gợi Ý?", "🗑️", "Xóa Tất Cả 🐾");
      if (ok) {
        suggestions = [];
        saveSuggestionsLocally();
        if (fbDb) {
          fbDb.ref('suggestions').remove().catch(e => console.warn(e));
        }
        renderSuggestionsList();
        updateSuggestionsTabCount();
        audio.playMeow();
        showCatToast("Đã xóa toàn bộ gợi ý món từ khách! 🐾", "delete");
      }
    };
  }
}

function initSuggestionModal() {
  const openBtn = document.getElementById('btn-open-suggestion');
  const closeBtn = document.getElementById('btn-close-suggestion');
  const cancelBtn = document.getElementById('btn-cancel-suggestion');
  const modal = document.getElementById('suggestion-modal');
  const form = document.getElementById('suggestion-form');

  const nameInput = document.getElementById('sugg-food-name');
  const placeInput = document.getElementById('sugg-food-place');
  const priceInput = document.getElementById('sugg-food-price');
  const noteInput = document.getElementById('sugg-food-note');
  const senderInput = document.getElementById('sugg-sender-name');

  function open() {
    audio.playPop();
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (window.gsap) {
        gsap.fromTo('#suggestion-modal > div', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.5)' });
      }
      setTimeout(() => { if (nameInput) nameInput.focus(); }, 150);
    }
  }

  function close() {
    audio.playPop();
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  if (openBtn) openBtn.onclick = open;
  if (closeBtn) closeBtn.onclick = close;
  if (cancelBtn) cancelBtn.onclick = close;

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
  }

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const foodName = nameInput ? nameInput.value.trim() : '';
      if (!foodName) {
        if (nameInput) nameInput.focus();
        return;
      }

      const location = placeInput ? placeInput.value.trim() : '';
      const price = priceInput && priceInput.value ? parseInt(priceInput.value, 10) : 0;
      const note = noteInput ? noteInput.value.trim() : '';
      const sender = senderInput ? senderInput.value.trim() : '';

      const now = new Date();
      const timeStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      const newSugg = {
        id: Date.now(),
        foodName: foodName,
        location: location,
        price: price,
        note: note,
        sender: sender || 'Khách dễ thương',
        createdAt: timeStr
      };

      suggestions.unshift(newSugg);
      saveSuggestionsLocally();

      if (fbDb) {
        fbDb.ref('suggestions').child(String(newSugg.id)).set(newSugg)
          .catch(err => console.warn("Firebase save suggestion error:", err));
      }

      updateSuggestionsTabCount();
      if (typeof renderSuggestionsList === 'function') {
        renderSuggestionsList();
      }

      close();
      form.reset();

      if (window.confetti) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });
      }
      audio.playMeow();
      showCatToast("Cảm ơn bạn đã gửi gợi ý cho quán! Quán đã nhận được và sẽ xem xét thêm vào thực đơn nhé 💕🐾", "success");
    };
  }
}

// --- 11E. PUBLIC READ-ONLY MENU MODAL (XEM THỰC ĐƠN & ĐỊA ĐIỂM VÒNG QUAY) ---
function initPublicMenuModal() {
  const modal = document.getElementById('public-menu-modal');
  if (!modal) return;

  const btnOpenHeader = document.getElementById('btn-open-public-menu');
  const btnClose = document.getElementById('btn-close-public-menu');
  const btnCloseBottom = document.getElementById('btn-close-public-menu-btn');
  const btnQuickFood = document.getElementById('btn-quick-view-menu-food');
  const btnQuickPlace = document.getElementById('btn-quick-view-menu-place');

  const tabFoods = document.getElementById('public-menu-tab-foods');
  const tabPlaces = document.getElementById('public-menu-tab-places');
  const countFoodsEl = document.getElementById('public-menu-foods-count');
  const countPlacesEl = document.getElementById('public-menu-places-count');
  const visibleCountEl = document.getElementById('public-menu-visible-count');
  const countInfoEl = document.getElementById('public-menu-count-info');

  const searchInput = document.getElementById('public-menu-search');
  const categoryFilter = document.getElementById('public-menu-category-filter');
  const itemsGrid = document.getElementById('public-menu-items-grid');
  const emptyState = document.getElementById('public-menu-empty');

  let currentTab = 'food'; // 'food' or 'place'

  function updateCategoryOptions() {
    if (!categoryFilter) return;
    const prevVal = categoryFilter.value;
    categoryFilter.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = 'all';
    defaultOpt.textContent = currentTab === 'food' ? '🌟 Tất cả món ăn' : '🌟 Tất cả địa điểm';
    categoryFilter.appendChild(defaultOpt);

    if (currentTab === 'food') {
      mealTags.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.key;
        opt.textContent = `${t.icon || '🏷️'} ${t.label}`;
        categoryFilter.appendChild(opt);
      });
    } else {
      placeTags.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.key;
        opt.textContent = `${t.icon || '🏷️'} ${t.label}`;
        categoryFilter.appendChild(opt);
      });
    }

    if ([...categoryFilter.options].some(o => o.value === prevVal)) {
      categoryFilter.value = prevVal;
    } else {
      categoryFilter.value = 'all';
    }
  }

  function renderItems() {
    if (!itemsGrid) return;
    const query = (searchInput ? searchInput.value.trim().toLowerCase() : '');
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

    // Update tab badges
    if (countFoodsEl) countFoodsEl.textContent = foods.length;
    if (countPlacesEl) countPlacesEl.textContent = places.length;

    itemsGrid.innerHTML = '';

    if (currentTab === 'food') {
      const filtered = foods.filter(food => {
        const matchQuery = !query ||
          food.name.toLowerCase().includes(query) ||
          (food.category && food.category.toLowerCase().includes(query)) ||
          (food.mealTimes && food.mealTimes.some(m => m.toLowerCase().includes(query)));
        
        const matchCategory = selectedCategory === 'all' ||
          (food.mealTimes && food.mealTimes.includes(selectedCategory)) ||
          food.category === selectedCategory;

        return matchQuery && matchCategory;
      });

      if (visibleCountEl) visibleCountEl.textContent = filtered.length;
      if (countInfoEl) {
        countInfoEl.innerHTML = `Hiển thị <b class="text-rose-600 font-black">${filtered.length}</b> món ăn`;
      }

      if (filtered.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        itemsGrid.classList.add('hidden');
      } else {
        if (emptyState) emptyState.classList.add('hidden');
        itemsGrid.classList.remove('hidden');

        filtered.forEach(food => {
          const card = document.createElement('div');
          card.className = 'flex items-center gap-2.5 p-2.5 bg-rose-50/60 hover:bg-rose-100/70 rounded-2xl border border-rose-100/90 transition-all hover:shadow-xs';

          const mediaHtml = food.image
            ? `<img src="${food.image}" alt="${food.name}" class="w-12 h-12 rounded-xl object-cover shadow-2xs border border-rose-200 flex-shrink-0">`
            : `<div class="w-12 h-12 rounded-xl bg-white border border-rose-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">${food.icon || '🍱'}</div>`;

          const tagsHtml = ((food.mealTimes && food.mealTimes.length) ? food.mealTimes : ['trua']).map(getMealTagBadgeHtml).join(' ');

          card.innerHTML = `
            ${mediaHtml}
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1 flex-wrap">
                <h4 class="font-extrabold text-stone-800 text-xs sm:text-sm truncate" title="${food.name}">${food.name}</h4>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex-shrink-0 shadow-2xs">
                  ${formatPrice(food.price)}
                </span>
              </div>
              <div class="flex items-center gap-1 mt-1 flex-wrap">
                ${tagsHtml}
              </div>
            </div>
          `;
          itemsGrid.appendChild(card);
        });
      }

    } else {
      // PLACES TAB
      const filtered = places.filter(place => {
        const matchQuery = !query ||
          place.name.toLowerCase().includes(query) ||
          (place.placeTags && place.placeTags.some(t => t.toLowerCase().includes(query)));

        const matchCategory = selectedCategory === 'all' ||
          (place.placeTags && place.placeTags.includes(selectedCategory)) ||
          place.category === selectedCategory;

        return matchQuery && matchCategory;
      });

      if (visibleCountEl) visibleCountEl.textContent = filtered.length;
      if (countInfoEl) {
        countInfoEl.innerHTML = `Hiển thị <b class="text-amber-600 font-black">${filtered.length}</b> địa điểm`;
      }

      if (filtered.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        itemsGrid.classList.add('hidden');
      } else {
        if (emptyState) emptyState.classList.add('hidden');
        itemsGrid.classList.remove('hidden');

        filtered.forEach(place => {
          const card = document.createElement('div');
          card.className = 'flex items-center gap-2.5 p-2.5 bg-amber-50/60 hover:bg-amber-100/70 rounded-2xl border border-amber-200/90 transition-all hover:shadow-xs';

          const costVal = Number(place.cost) || 0;
          const costBadge = costVal === 0
            ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">🆓 Miễn phí</span>`
            : `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">~${formatPrice(costVal)}</span>`;

          const tagsHtml = ((place.placeTags && place.placeTags.length) ? place.placeTags : ['chill']).map(getPlaceTagBadgeHtml).join(' ');

          card.innerHTML = `
            <div class="w-12 h-12 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">
              ${place.icon || '🎡'}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1 flex-wrap">
                <h4 class="font-extrabold text-stone-800 text-xs sm:text-sm truncate" title="${place.name}">${place.name}</h4>
                ${costBadge}
              </div>
              <div class="flex items-center gap-1 mt-1 flex-wrap">
                ${tagsHtml}
              </div>
            </div>
          `;
          itemsGrid.appendChild(card);
        });
      }
    }
  }

  function setTab(tab) {
    currentTab = tab;
    if (tab === 'food') {
      tabFoods.className = 'py-2 px-1 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 bg-white text-rose-600 shadow-sm truncate cursor-pointer';
      tabPlaces.className = 'py-2 px-1 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 text-stone-500 hover:text-stone-800 truncate cursor-pointer';
      if (searchInput) searchInput.placeholder = 'Tìm tên món ăn (phở, bún, trà sữa...)...';
    } else {
      tabPlaces.className = 'py-2 px-1 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 bg-white text-amber-700 shadow-sm truncate cursor-pointer';
      tabFoods.className = 'py-2 px-1 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 text-stone-500 hover:text-stone-800 truncate cursor-pointer';
      if (searchInput) searchInput.placeholder = 'Tìm địa điểm vui chơi (hồ tây, cafe, rạp phim...)...';
    }
    updateCategoryOptions();
    renderItems();
  }

  function open(preferredTab) {
    audio.playPop();
    const tabToOpen = preferredTab || (appMode === 'place' ? 'place' : 'food');
    setTab(tabToOpen);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.gsap) {
      gsap.fromTo('#public-menu-modal > div', { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.5)' });
    }
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 150);
    }
  }

  function close() {
    audio.playPop();
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  // Event handlers
  if (btnOpenHeader) btnOpenHeader.onclick = () => open();
  if (btnQuickFood) btnQuickFood.onclick = () => open('food');
  if (btnQuickPlace) btnQuickPlace.onclick = () => open('place');
  if (btnClose) btnClose.onclick = close;
  if (btnCloseBottom) btnCloseBottom.onclick = close;

  if (tabFoods) tabFoods.onclick = () => { audio.playPop(); setTab('food'); };
  if (tabPlaces) tabPlaces.onclick = () => { audio.playPop(); setTab('place'); };

  if (searchInput) searchInput.oninput = renderItems;
  if (categoryFilter) categoryFilter.onchange = renderItems;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  window.openPublicMenuModal = open;
  window.renderPublicMenuModal = renderItems;
}

// --- 12. DUAL FILTERS: THỜI ĐIỂM ĂN & MỨC GIÁ (CHO FOOD) ---
function renderMealFilterButtons() {
  const container = document.getElementById('meal-filter-container');
  if (!container) return;
  container.innerHTML = '';

  // 1. Tất cả
  const allBtn = document.createElement('button');
  allBtn.setAttribute('data-mealtag', 'all');
  allBtn.className = `meal-filter-btn ${currentMealTag === 'all' ? 'active-filter' : ''} px-3 py-1 rounded-full text-xs font-black transition-all`;
  allBtn.innerHTML = '🌟 Tất cả';
  allBtn.onclick = () => selectMealFilter('all');
  container.appendChild(allBtn);

  // 2. Từng thẻ tag động
  mealTags.forEach(t => {
    const btn = document.createElement('button');
    btn.setAttribute('data-mealtag', t.key);
    btn.className = `meal-filter-btn ${currentMealTag === t.key ? 'active-filter' : ''} px-3 py-1 rounded-full text-xs font-bold transition-all`;
    btn.innerHTML = `${t.icon || '🏷️'} ${t.label}`;
    btn.onclick = () => selectMealFilter(t.key);
    container.appendChild(btn);
  });
}

function selectMealFilter(tagKey) {
  audio.playPop();
  currentMealTag = tagKey;
  renderMealFilterButtons();
  updateActiveFilterCount();
  if (appMode === 'food') {
    setupClawMachine();
    setupSlotMachine();
  }
}

function updateActiveFilterCount() {
  const filtered = getFilteredFoods();
  const countNum = document.getElementById('filtered-count-num');
  const statusText = document.getElementById('filter-status-text');
  if (countNum) countNum.textContent = filtered.length;
  if (statusText) {
    if (filtered.length > 0) {
      statusText.innerHTML = `🐾 Đang có <b class="text-rose-600 font-black text-xs">${filtered.length}</b> món phù hợp để quay`;
    } else {
      statusText.innerHTML = `⚠️ <span class="text-rose-600 font-bold">Không có món nào đúng tiêu chí này! Tạm thời quay trên tất cả món nha Sen.</span>`;
    }
  }
}

function initDualFilters() {
  renderMealFilterButtons();

  const priceBtns = document.querySelectorAll('.price-filter-btn');
  priceBtns.forEach(btn => {
    btn.onclick = () => {
      audio.playPop();
      currentPriceRange = btn.getAttribute('data-pricerange');
      priceBtns.forEach(b => {
        if (b.getAttribute('data-pricerange') === currentPriceRange) {
          b.classList.add('active-price-filter');
        } else {
          b.classList.remove('active-price-filter');
        }
      });
      updateActiveFilterCount();
      if (appMode === 'food') {
        setupClawMachine();
        setupSlotMachine();
      }
    };
  });

  updateActiveFilterCount();
}

// --- 12B. PLACE FILTERS (CHO ĐỊA ĐIỂM ĐI CHƠI) ---
function renderPlaceFilterButtons() {
  const container = document.getElementById('place-filter-container');
  if (!container) return;
  container.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.setAttribute('data-placetag', 'all');
  allBtn.className = `place-filter-btn ${currentPlaceTag === 'all' ? 'active-filter' : ''} px-3 py-1 rounded-full text-xs font-black transition-all`;
  allBtn.innerHTML = '🌟 Tất cả';
  allBtn.onclick = () => selectPlaceFilter('all');
  container.appendChild(allBtn);

  placeTags.forEach(t => {
    const btn = document.createElement('button');
    btn.setAttribute('data-placetag', t.key);
    btn.className = `place-filter-btn ${currentPlaceTag === t.key ? 'active-filter' : ''} px-3 py-1 rounded-full text-xs font-bold transition-all`;
    btn.innerHTML = `${t.icon || '🏷️'} ${t.label}`;
    btn.onclick = () => selectPlaceFilter(t.key);
    container.appendChild(btn);
  });
}

function selectPlaceFilter(tagKey) {
  audio.playPop();
  currentPlaceTag = tagKey;
  renderPlaceFilterButtons();
  updateActivePlaceFilterCount();
  if (appMode === 'place') {
    setupClawMachine();
    setupSlotMachine();
  }
}

function initPlaceFilters() {
  renderPlaceFilterButtons();

  const costBtns = document.querySelectorAll('.place-cost-btn');
  costBtns.forEach(btn => {
    btn.onclick = () => {
      audio.playPop();
      currentPlaceCost = btn.getAttribute('data-placecost');
      costBtns.forEach(b => {
        if (b.getAttribute('data-placecost') === currentPlaceCost) {
          b.classList.add('active-cost-filter');
        } else {
          b.classList.remove('active-cost-filter');
        }
      });
      updateActivePlaceFilterCount();
      if (appMode === 'place') {
        setupClawMachine();
        setupSlotMachine();
      }
    };
  });

  updateActivePlaceFilterCount();
}

function updateActivePlaceFilterCount() {
  const filtered = getFilteredPlaces();
  const countNum = document.getElementById('filtered-place-count-num');
  const statusText = document.getElementById('place-filter-status-text');
  if (countNum) countNum.textContent = filtered.length;
  if (statusText) {
    if (filtered.length > 0) {
      statusText.innerHTML = `🐾 Đang có <b class="text-amber-600 font-black text-xs">${filtered.length}</b> địa điểm phù hợp để đi chơi`;
    } else {
      statusText.innerHTML = `⚠️ <span class="text-amber-700 font-bold">Không có địa điểm nào đúng tiêu chí này! Tạm thời quay trên tất cả địa điểm nha Sen.</span>`;
    }
  }
}

// --- 12B2. SỔ TAY "MÌNH ĐI CHỖ NÀY NHA" (LIL TÂM & TTUNGG WISHLIST) ---
const DEFAULT_COUPLE_WISHLIST = [
  { id: 1, name: "Quán Cafe Rooftop ngắm hoàng hôn Chill Garden", category: "cafe", status: "pending", note: "Đi vào tầm 17h chiều chụp ảnh hoàng hôn siêu đẹp 🌅" },
  { id: 2, name: "Phở Thìn Lò Đúc - Bò Tái Lăn ngập hành", category: "eat", status: "done", note: "Nước dùng béo ngậy thơm nức mũi, hai đứa ăn no căng 🍜" },
  { id: 3, name: "Bánh Tráng Nướng Đà Lạt & Sữa Đậu Nành ấm", category: "snack", status: "done", note: "Ăn vặt buổi tối mát trời, chấm tương ớt cay cay 🍕" },
  { id: 4, name: "Rạp CGV xem phim bom tấn cuối tuần", category: "movie", status: "planned", note: "Chọn ghế đôi Sweetbox xem phim tình cảm 🎬" },
  { id: 5, name: "Khu Bowling & Bắn Cung xả stress Aeon Mall", category: "play", status: "pending", note: "Thi xem ai ném strike nhiều hơn, ai thua bao trà sữa 🎳" },
  { id: 6, name: "Lẩu Haidilao múa mì & kem miễn phí", category: "eat", status: "planned", note: "Gọi nước lẩu cà chua và lẩu nấm siêu ngon 🍲" },
  { id: 7, name: "Cắm trại Glamping ngắm sao ngoại thành", category: "travel", status: "pending", note: "Đốt lửa trại nướng thịt BBQ và chill cùng nhau ⛺" },
  { id: 8, name: "Bingsu Xoài Tuyết Sữa hoa tuyết mát lạnh", category: "dessert", status: "done", note: "Xoài chín ngọt lịm, kem sữa mịn tan trên đầu lưỡi 🍧" }
];

let coupleWishlist = [];
let currentWishlistFilter = 'all'; // 'all' | 'pending' | 'planned' | 'done'
let currentWishlistCategory = 'all';
let currentWishlistSearch = '';
function isLilTamAdmin() {
  return sessionStorage.getItem('liltam_authenticated') === 'true';
}

function updateAdminBranding() {
  const isAdmin = isLilTamAdmin();

  // Top Header elements
  const headerMainTitle = document.getElementById('header-main-title');
  const headerMainIcon = document.getElementById('header-main-icon');
  const headerMainTagline = document.getElementById('header-main-tagline');

  if (appMode === 'wishlist') {
    if (headerMainTitle) {
      headerMainTitle.innerHTML = isAdmin
        ? 'LIL TÂM & <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">TTUNGG</span> 💖'
        : 'MÌNH ĐI <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">ĐÂU ZA?</span> 🐾';
    }
    if (headerMainIcon) {
      headerMainIcon.textContent = isAdmin ? '💑' : '🗺️';
    }
    if (headerMainTagline) {
      headerMainTagline.textContent = isAdmin
        ? '🐾 Danh sách địa điểm ăn uống, đi chơi & cà phê hai đứa mình muốn đến 🐾'
        : '🐾 Danh sách địa điểm ăn uống, đi chơi & cà phê muốn đến 🐾';
    }
  }

  // Wishlist card elements
  const cardIcon = document.getElementById('wishlist-card-icon');
  const cardBadge = document.getElementById('wishlist-card-badge');
  const cardTitle = document.getElementById('wishlist-card-title');
  const emptyMsg = document.getElementById('wishlist-empty-msg');
  const footerText = document.getElementById('footer-copyright-text');

  if (cardIcon) cardIcon.textContent = isAdmin ? '💑' : '🗺️';
  if (cardBadge) cardBadge.textContent = isAdmin ? 'Không Gacha • Sổ Tay Cặp Đôi' : 'Không Gacha • Sổ Tay Khám Phá';
  if (cardTitle) {
    cardTitle.textContent = isAdmin
      ? 'DANH SÁCH ĐỊA ĐIỂM ĂN UỐNG, ĐI CHƠI & CÀ PHÊ CỦA LIL TÂM VÀ TTUNGG'
      : 'DANH SÁCH ĐỊA ĐIỂM ĂN UỐNG, ĐI CHƠI & CÀ PHÊ MUỐN ĐẾN';
  }
  if (emptyMsg) {
    emptyMsg.textContent = isAdmin
      ? 'Hãy thêm quán ngon hoặc nơi muốn đến ở form phía trên nha Lil Tâm & Ttungg 💕'
      : 'Hãy thêm quán ngon hoặc nơi muốn đến ở form phía trên nha 💕';
  }
  if (footerText) {
    footerText.textContent = isAdmin
      ? '🐾 Hoàng Thượng Ăn Gì? • Lil Tâm & Ttungg 💖'
      : '🐾 Hoàng Thượng Ăn Gì? • Sổ Tay Đi Chơi & Khám Phá ✨';
  }

  // Wishlist Admin Controls & Form Visibility
  const formContainer = document.getElementById('wishlist-form-container');
  const adminBar = document.getElementById('wishlist-admin-bar');
  const loginHint = document.getElementById('wishlist-public-login-hint');
  const thActions = document.getElementById('wishlist-th-actions');

  if (adminBar) {
    adminBar.classList.toggle('hidden', !isAdmin);
    adminBar.classList.toggle('flex', isAdmin);
  }
  if (loginHint) {
    loginHint.classList.toggle('hidden', isAdmin);
    loginHint.classList.toggle('flex', !isAdmin);
  }
  if (formContainer) {
    formContainer.classList.toggle('hidden', !isAdmin);
    formContainer.classList.toggle('flex', isAdmin);
  }
  if (thActions) {
    thActions.classList.toggle('hidden', !isAdmin);
  }

  if (typeof updateWishlistStats === 'function') {
    updateWishlistStats();
  }
}
window.updateAdminBranding = updateAdminBranding;

let editingWishlistId = null;

const WISHLIST_CATEGORIES = {
  eat: { label: 'Ăn uống', icon: '🍜', class: 'category-eat' },
  cafe: { label: 'Cà phê', icon: '☕', class: 'category-cafe' },
  play: { label: 'Đi chơi', icon: '🎡', class: 'category-play' },
  snack: { label: 'Ăn vặt', icon: '🧋', class: 'category-snack' },
  movie: { label: 'Xem phim', icon: '🎬', class: 'category-movie' },
  travel: { label: 'Dã ngoại', icon: '⛺', class: 'category-travel' },
  dessert: { label: 'Đồ ngọt', icon: '🍰', class: 'category-dessert' }
};

const WISHLIST_STATUSES = {
  pending: { label: 'Chưa đi', icon: '⏳', class: 'status-pending', next: 'planned' },
  planned: { label: 'Sắp đi', icon: '💖', class: 'status-planned', next: 'done' },
  done: { label: 'Đã đi', icon: '✅', class: 'status-done', next: 'pending' }
};

function loadCoupleWishlist() {
  const saved = localStorage.getItem('couple_wishlist_places_v1');
  if (saved !== null) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        coupleWishlist = parsed.filter(i => i && typeof i === 'object' && i.name);
        return;
      }
    } catch (e) {}
  }
  coupleWishlist = JSON.parse(JSON.stringify(DEFAULT_COUPLE_WISHLIST));
  localStorage.setItem('couple_wishlist_places_v1', JSON.stringify(coupleWishlist));
}

function saveCoupleWishlist() {
  const cleanList = coupleWishlist.filter(i => i && typeof i === 'object' && i.name);
  localStorage.setItem('couple_wishlist_places_v1', JSON.stringify(cleanList));
  if (fbDb && !isSyncingFromCloud) {
    setCloudSyncStatus('syncing', 'Đang lưu...');
    const dataToSave = cleanList.length === 0 ? { __empty: true, updatedAt: Date.now() } : cleanList;
    fbDb.ref('coupleWishlist').set(dataToSave)
      .then(() => setCloudSyncStatus('connected', 'Đồng bộ nhóm'))
      .catch(e => {
        console.warn('Firebase saveCoupleWishlist error:', e);
        setCloudSyncStatus('connected', 'Lưu trên máy');
      });
  }
}

function getFilteredWishlist() {
  return coupleWishlist.filter(item => {
    if (currentWishlistFilter !== 'all' && item.status !== currentWishlistFilter) {
      return false;
    }
    if (currentWishlistCategory !== 'all' && item.category !== currentWishlistCategory) {
      return false;
    }
    if (currentWishlistSearch) {
      const q = currentWishlistSearch.toLowerCase();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchNote = (item.note || '').toLowerCase().includes(q);
      if (!matchName && !matchNote) return false;
    }
    return true;
  });
}

function updateWishlistStats() {
  const total = coupleWishlist.length;
  const done = coupleWishlist.filter(i => i.status === 'done').length;
  const pending = coupleWishlist.filter(i => i.status === 'pending').length;
  const planned = coupleWishlist.filter(i => i.status === 'planned').length;

  const statTotal = document.getElementById('wishlist-stat-total');
  const statDone = document.getElementById('wishlist-stat-done');
  const statPending = document.getElementById('wishlist-stat-pending');

  const countAll = document.getElementById('wishlist-count-all');
  const countPending = document.getElementById('wishlist-count-pending');
  const countPlanned = document.getElementById('wishlist-count-planned');
  const countDone = document.getElementById('wishlist-count-done');

  if (statTotal) statTotal.textContent = total;
  if (statDone) statDone.textContent = done;
  if (statPending) statPending.textContent = pending + planned;

  if (countAll) countAll.textContent = total;
  if (countPending) countPending.textContent = pending;
  if (countPlanned) countPlanned.textContent = planned;
  if (countDone) countDone.textContent = done;

  const speech = document.getElementById('wishlist-couple-speech');
  if (speech) {
    const isAdmin = isLilTamAdmin();
    if (total === 0) {
      speech.innerHTML = isAdmin
        ? `<span>🐾</span> <span>Bảng đang trống trơn nè, Lil Tâm & Ttungg mau ghi những điểm hẹn hò đầu tiên vào nha! 💕</span>`
        : `<span>🐾</span> <span>Bảng đang trống trơn nè, mau ghi những điểm muốn đến đầu tiên vào nha! 💕</span>`;
    } else if (done === total && total > 0) {
      speech.innerHTML = isAdmin
        ? `<span>🎉</span> <span>Woa đỉnh quá! Lil Tâm & Ttungg đã hoàn thành 100% tất cả <b>${total}</b> địa điểm rồi! Thêm địa điểm mới thôi nào! 💖</span>`
        : `<span>🎉</span> <span>Woa đỉnh quá! Đã hoàn thành 100% tất cả <b>${total}</b> địa điểm rồi! Thêm địa điểm mới thôi nào! 💖</span>`;
    } else {
      speech.innerHTML = isAdmin
        ? `<span>🐾</span> <span>Hai đứa mình đã cùng nhau đi được <b class="text-emerald-700">${done}</b> địa điểm! Còn <b class="text-rose-600">${pending + planned}</b> chỗ đang chờ Lil Tâm & Ttungg cùng vi vu khám phá 💕</span>`
        : `<span>🐾</span> <span>Đã cùng nhau đi được <b class="text-emerald-700">${done}</b> địa điểm! Còn <b class="text-rose-600">${pending + planned}</b> chỗ đang chờ cùng vi vu khám phá 💕</span>`;
    }
  }
}

function renderCoupleWishlist() {
  const tbody = document.getElementById('wishlist-table-body');
  const emptyState = document.getElementById('wishlist-empty-state');
  if (!tbody) return;

  const isAdmin = isLilTamAdmin();
  const thActions = document.getElementById('wishlist-th-actions');
  if (thActions) {
    thActions.classList.toggle('hidden', !isAdmin);
  }

  updateWishlistStats();
  const filtered = getFilteredWishlist();

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  tbody.innerHTML = '';

  filtered.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.className = 'wishlist-table-row border-b border-stone-200';

    const catInfo = WISHLIST_CATEGORIES[item.category] || WISHLIST_CATEGORIES.cafe;
    const statusInfo = WISHLIST_STATUSES[item.status] || WISHLIST_STATUSES.pending;

    const statusColHtml = isAdmin
      ? `<button data-id="${item.id}" class="btn-toggle-wishlist-status wishlist-status-pill px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${statusInfo.class}" title="Nhấp để đổi trạng thái">
          ${statusInfo.icon} ${statusInfo.label}
        </button>`
      : `<span class="wishlist-status-pill px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${statusInfo.class} cursor-default select-none">
          ${statusInfo.icon} ${statusInfo.label}
        </span>`;

    const noteBorder = isAdmin ? 'border-r border-stone-200' : '';

    const actionColHtml = isAdmin ? `
      <td class="py-1.5 px-1 text-center">
        <div class="flex items-center justify-center space-x-1">
          <button data-id="${item.id}" class="btn-edit-wishlist w-6 h-6 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center transition-colors" title="Sửa dòng này">
            <svg class="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button data-id="${item.id}" class="btn-delete-wishlist w-6 h-6 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors" title="Xóa dòng này">
            <svg class="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </td>
    ` : '';

    tr.innerHTML = `
      <td class="py-1.5 px-1 text-center border-r border-stone-200 font-extrabold text-stone-500 text-[11px]">${index + 1}</td>
      <td class="py-1.5 px-2.5 border-r border-stone-200">
        <span class="font-extrabold text-stone-800 text-xs ${item.status === 'done' ? 'line-through text-stone-400' : ''}">${escapeHtml(item.name)}</span>
      </td>
      <td class="py-1.5 px-1 text-center border-r border-stone-200">
        <span class="category-badge ${catInfo.class}">${catInfo.icon} ${catInfo.label}</span>
      </td>
      <td class="py-1.5 px-1 text-center border-r border-stone-200">
        ${statusColHtml}
      </td>
      <td class="py-1.5 px-2 ${noteBorder} text-stone-600 text-xs italic">
        ${item.note ? escapeHtml(item.note) : '<span class="text-stone-300 font-normal">Chưa có</span>'}
      </td>
      ${actionColHtml}
    `;

    tbody.appendChild(tr);
  });

  // Wire interactive status toggle
  tbody.querySelectorAll('.btn-toggle-wishlist-status').forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const item = coupleWishlist.find(i => i.id === id);
      if (!item) return;

      const curr = WISHLIST_STATUSES[item.status] || WISHLIST_STATUSES.pending;
      item.status = curr.next;
      saveCoupleWishlist();

      if (item.status === 'done') {
        audio.playFanfare();
        shootConfetti();
      } else {
        audio.playPop();
      }

      renderCoupleWishlist();
    };
  });

  // Wire edit row
  tbody.querySelectorAll('.btn-edit-wishlist').forEach(btn => {
    btn.onclick = () => {
      if (sessionStorage.getItem('liltam_authenticated') !== 'true') {
        if (typeof window.openAuthModal === 'function') window.openAuthModal();
        showCatToast("Vui lòng nhập mật khẩu quản trị để sửa sổ tay nha Sen! 🔐", "warn");
        return;
      }
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const item = coupleWishlist.find(i => i.id === id);
      if (!item) return;

      editingWishlistId = id;
      const inputPlace = document.getElementById('wishlist-input-place');
      const selectCat = document.getElementById('wishlist-select-category');
      const selectStatus = document.getElementById('wishlist-select-status');
      const inputNote = document.getElementById('wishlist-input-note');
      const titleEl = document.getElementById('wishlist-form-title');
      const addBtnText = document.getElementById('btn-wishlist-add-text');
      const cancelBtn = document.getElementById('btn-wishlist-cancel-edit');

      if (inputPlace) inputPlace.value = item.name;
      if (selectCat) selectCat.value = item.category || 'cafe';
      if (selectStatus) selectStatus.value = item.status || 'pending';
      if (inputNote) inputNote.value = item.note || '';

      if (titleEl) titleEl.innerHTML = `<span>✏️</span> <span>Sửa địa điểm: <b class="text-rose-600">${escapeHtml(item.name)}</b></span>`;
      if (addBtnText) addBtnText.textContent = 'Lưu';
      if (cancelBtn) cancelBtn.classList.remove('hidden');

      if (inputPlace) {
        inputPlace.focus();
        inputPlace.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      audio.playPop();
    };
  });

  // Wire delete row
  tbody.querySelectorAll('.btn-delete-wishlist').forEach(btn => {
    btn.onclick = async () => {
      if (sessionStorage.getItem('liltam_authenticated') !== 'true') {
        if (typeof window.openAuthModal === 'function') window.openAuthModal();
        showCatToast("Vui lòng nhập mật khẩu quản trị để xóa địa điểm khỏi sổ tay! 🔐", "warn");
        return;
      }
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const target = coupleWishlist.find(i => i.id === id);
      const itemName = target ? target.name : 'địa điểm này';
      const ok = await showCatConfirm(`Sen có chắc muốn xóa "<b>${itemName}</b>" khỏi sổ tay không? 💕`, "Xóa Khỏi Sổ Tay?", "🗑️", "Xóa Ngay 🐾");
      if (!ok) {
        return;
      }
      coupleWishlist = coupleWishlist.filter(i => i.id !== id);
      saveCoupleWishlist();
      renderCoupleWishlist();
      audio.playPop();
      showCatToast(`Đã xóa "${itemName}" khỏi sổ tay!`, 'delete');
    };
  });
}

function initCoupleWishlist() {
  const addBtn = document.getElementById('btn-wishlist-add');
  const addBtnText = document.getElementById('btn-wishlist-add-text');
  const cancelBtn = document.getElementById('btn-wishlist-cancel-edit');
  const logoutBtn = document.getElementById('btn-wishlist-logout');
  const quickLoginBtn = document.getElementById('btn-wishlist-quick-login');
  const inputPlace = document.getElementById('wishlist-input-place');
  const selectCat = document.getElementById('wishlist-select-category');
  const selectStatus = document.getElementById('wishlist-select-status');
  const inputNote = document.getElementById('wishlist-input-note');
  const titleEl = document.getElementById('wishlist-form-title');
  const resetBtn = document.getElementById('btn-wishlist-reset-default');
  const copyBtn = document.getElementById('btn-wishlist-copy');
  const searchInput = document.getElementById('wishlist-search-input');
  const categoryFilter = document.getElementById('wishlist-filter-category');

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      audio.playPop();
      sessionStorage.removeItem('liltam_authenticated');
      updateAdminBranding();
      renderCoupleWishlist();
      showCatToast("Đã khóa quyền quản trị! Trở về chế độ xem công khai 🔒", "warn");
    };
  }

  if (quickLoginBtn) {
    quickLoginBtn.onclick = () => {
      audio.playPop();
      if (typeof window.openAuthModal === 'function') {
        window.openAuthModal();
      }
    };
  }

  function cancelEdit() {
    editingWishlistId = null;
    if (inputPlace) inputPlace.value = '';
    if (inputNote) inputNote.value = '';
    if (titleEl) titleEl.innerHTML = `<span>➕</span> <span>Thêm địa điểm / món muốn đến cùng nhau:</span>`;
    if (addBtnText) addBtnText.textContent = 'Thêm';
    if (cancelBtn) cancelBtn.classList.add('hidden');
    audio.playPop();
  }

  if (cancelBtn) cancelBtn.onclick = cancelEdit;

  if (addBtn) {
    addBtn.onclick = () => {
      const name = inputPlace ? inputPlace.value.trim() : '';
      if (!name) {
        if (inputPlace) inputPlace.focus();
        return;
      }
      const category = selectCat ? selectCat.value : 'cafe';
      const status = selectStatus ? selectStatus.value : 'pending';
      const note = inputNote ? inputNote.value.trim() : '';

      if (editingWishlistId !== null) {
        const idx = coupleWishlist.findIndex(i => i.id === editingWishlistId);
        if (idx !== -1) {
          coupleWishlist[idx].name = name;
          coupleWishlist[idx].category = category;
          coupleWishlist[idx].status = status;
          coupleWishlist[idx].note = note;
        }
        editingWishlistId = null;
        if (titleEl) titleEl.innerHTML = `<span>➕</span> <span>Thêm địa điểm / món muốn đến cùng nhau:</span>`;
        if (addBtnText) addBtnText.textContent = 'Thêm';
        if (cancelBtn) cancelBtn.classList.add('hidden');
        showCatToast(`Đã cập nhật "${name}" thành công! ✨`, 'edit');
      } else {
        const newItem = {
          id: Date.now(),
          name: name,
          category: category,
          status: status,
          note: note
        };
        coupleWishlist.unshift(newItem);
        const isAdmin = isLilTamAdmin();
        showCatToast(isAdmin ? `Đã thêm "${name}" vào sổ tay Lil Tâm & Ttungg! 💖` : `Đã thêm "${name}" vào sổ tay địa điểm! ✨`, 'success');
      }

      saveCoupleWishlist();
      if (inputPlace) inputPlace.value = '';
      if (inputNote) inputNote.value = '';
      renderCoupleWishlist();
      audio.playBellDing();
    };
  }

  if (inputPlace) {
    inputPlace.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (addBtn) addBtn.click();
      }
    };
  }

  if (inputNote) {
    inputNote.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (addBtn) addBtn.click();
      }
    };
  }

  // Filter tabs
  const filterBtns = document.querySelectorAll('.wishlist-filter-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      audio.playPop();
      currentWishlistFilter = btn.getAttribute('data-wishlist-filter');
      filterBtns.forEach(b => {
        if (b.getAttribute('data-wishlist-filter') === currentWishlistFilter) {
          b.className = 'wishlist-filter-btn active-wishlist-filter px-3 py-1 rounded-lg text-xs font-black transition-all';
        } else {
          b.className = 'wishlist-filter-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-stone-600 hover:text-stone-900';
        }
      });
      renderCoupleWishlist();
    };
  });

  // Search input
  if (searchInput) {
    searchInput.oninput = () => {
      currentWishlistSearch = searchInput.value.trim();
      renderCoupleWishlist();
    };
  }

  // Category filter
  if (categoryFilter) {
    categoryFilter.onchange = () => {
      currentWishlistCategory = categoryFilter.value;
      renderCoupleWishlist();
    };
  }

  // Clear all
  const clearAllBtn = document.getElementById('btn-wishlist-clear-all');
  if (clearAllBtn) {
    clearAllBtn.onclick = async () => {
      if (coupleWishlist.length === 0) {
        showCatToast("Bảng đang trống rồi nha Sen!", "warn");
        return;
      }
      const ok = await showCatConfirm("Sen có chắc muốn <b>xóa toàn bộ</b> danh sách địa điểm trong sổ tay không? 😿", "Xóa Hết Sổ Tay?", "🗑️", "Xóa Tất Cả 🐾");
      if (ok) {
        coupleWishlist = [];
        saveCoupleWishlist();
        cancelEdit();
        renderCoupleWishlist();
        audio.playMeow();
        showCatToast("Đã xóa toàn bộ sổ tay địa điểm! 🐾", "delete");
      }
    };
  }

  // Reset default
  if (resetBtn) {
    resetBtn.onclick = async () => {
      const ok = await showCatConfirm("Sen có chắc muốn khôi phục danh sách địa điểm mẫu ban đầu của <b>Lil Tâm & Ttungg</b> không? 💕", "Khôi Phục Mẫu?", "🔄", "Khôi Phục 🐾");
      if (ok) {
        coupleWishlist = JSON.parse(JSON.stringify(DEFAULT_COUPLE_WISHLIST));
        saveCoupleWishlist();
        cancelEdit();
        renderCoupleWishlist();
        audio.playMeow();
        showCatToast("Đã khôi phục danh sách địa điểm mẫu! 🔄", "edit");
      }
    };
  }

  // Copy to clipboard
  if (copyBtn) {
    copyBtn.onclick = () => {
      audio.playPop();
      if (coupleWishlist.length === 0) {
        alert("Danh sách đang trống nha Sen!");
        return;
      }
      const isAdmin = isLilTamAdmin();
      let text = isAdmin
        ? "💑 DANH SÁCH ĐỊA ĐIỂM ĂN UỐNG, ĐI CHƠI & CÀ PHÊ CỦA LIL TÂM VÀ TTUNGG 💖\n\n"
        : "🗺️ DANH SÁCH ĐỊA ĐIỂM ĂN UỐNG, ĐI CHƠI & CÀ PHÊ MUỐN ĐẾN ✨\n\n";
      coupleWishlist.forEach((item, idx) => {
        const cat = WISHLIST_CATEGORIES[item.category] ? WISHLIST_CATEGORIES[item.category].label : '';
        const st = item.status === 'done' ? '[Đã đi ✅]' : (item.status === 'planned' ? '[Sắp đi 💖]' : '[Chưa đi ⏳]');
        text += `${idx + 1}. ${item.name} (${cat}) ${st}${item.note ? ' - ' + item.note : ''}\n`;
      });

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          alert(isAdmin
            ? "Đã sao chép danh sách vào bộ nhớ tạm! Lil Tâm & Ttungg có thể dán vào Zalo/Messenger gửi cho nhau nhé 💕"
            : "Đã sao chép danh sách vào bộ nhớ tạm! Bạn có thể dán vào Zalo/Messenger để lưu lại nhé 💕");
        }).catch(() => {
          prompt("Sao chép danh sách dưới đây:", text);
        });
      } else {
        prompt("Sao chép danh sách dưới đây:", text);
      }
    };
  }

  renderCoupleWishlist();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

// --- 12C. PURPOSE SWITCHER (ĂN GÌ? VS ĐI ĐÂU ZA? VS MÌNH ĐI CHỖ NÀY NHA) ---
function setAppMode(mode) {
  if (appMode === mode) return;
  appMode = mode;
  audio.playPop();

  const foodSwitchBtn = document.getElementById('mode-switch-food');
  const placeSwitchBtn = document.getElementById('mode-switch-place');
  const wishlistSwitchBtn = document.getElementById('mode-switch-wishlist');
  const foodFilters = document.getElementById('filter-bar-food');
  const placeFilters = document.getElementById('filter-bar-place');
  const gameTabsContainer = document.getElementById('game-tabs-container');
  const gameArenaContainer = document.getElementById('game-arena-container');
  const wishlistView = document.getElementById('view-couple-wishlist');
  
  const headerMainTitle = document.getElementById('header-main-title');
  const headerMainIcon = document.getElementById('header-main-icon');
  const headerMainTagline = document.getElementById('header-main-tagline');
  const headerManageText = document.getElementById('header-manage-text');

  if (mode === 'wishlist') {
    // Mode: Mình Đi Chỗ Này Nha (No Gacha)
    if (foodSwitchBtn) foodSwitchBtn.className = 'px-3 md:px-4 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all duration-300 flex items-center space-x-1.5 text-stone-600 hover:text-rose-600 hover:bg-white/60';
    if (placeSwitchBtn) placeSwitchBtn.className = 'px-3 md:px-4 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all duration-300 flex items-center space-x-1.5 text-stone-600 hover:text-rose-600 hover:bg-white/60';
    if (wishlistSwitchBtn) wishlistSwitchBtn.className = 'px-3 md:px-4 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all duration-300 flex items-center space-x-1.5 bg-[#7A2018] text-white shadow-sm scale-105';

    // Hide Minigames & Filter bars
    if (gameTabsContainer) gameTabsContainer.classList.add('hidden');
    if (foodFilters) foodFilters.classList.add('hidden');
    if (placeFilters) {
      placeFilters.classList.add('hidden');
      placeFilters.classList.remove('flex');
    }
    if (gameArenaContainer) gameArenaContainer.classList.add('hidden');

    // Show Wishlist Table
    if (wishlistView) {
      wishlistView.classList.remove('hidden');
      wishlistView.classList.add('flex');
    }

    if (typeof updateAdminBranding === 'function') {
      updateAdminBranding();
    }
    if (headerManageText) headerManageText.innerHTML = `Sổ Tay (<span id="foods-badge-count">${coupleWishlist.length}</span>)`;

    renderCoupleWishlist();
  } else if (mode === 'place') {
    // Mode: Mình Đi Đâu Za? (Minigames địa điểm)
    if (foodSwitchBtn) foodSwitchBtn.className = 'px-3 md:px-4 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all duration-300 flex items-center space-x-1.5 text-stone-600 hover:text-rose-600 hover:bg-white/60';
    if (placeSwitchBtn) placeSwitchBtn.className = 'px-3 md:px-4 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all duration-300 flex items-center space-x-1.5 bg-amber-500 text-white shadow-sm scale-105';
    if (wishlistSwitchBtn) wishlistSwitchBtn.className = 'px-3 md:px-4 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all duration-300 flex items-center space-x-1.5 text-stone-600 hover:text-amber-700 hover:bg-white/60';

    if (wishlistView) {
      wishlistView.classList.add('hidden');
      wishlistView.classList.remove('flex');
    }
    if (gameTabsContainer) gameTabsContainer.classList.remove('hidden');
    if (gameArenaContainer) gameArenaContainer.classList.remove('hidden');

    if (foodFilters) foodFilters.classList.add('hidden');
    if (placeFilters) {
      placeFilters.classList.remove('hidden');
      placeFilters.classList.add('flex');
    }

    if (headerMainTitle) headerMainTitle.innerHTML = 'HÔM NAY <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500">ĐI ĐÂU ZA?</span>';
    if (headerMainIcon) headerMainIcon.textContent = '🎡';
    if (headerMainTagline) headerMainTagline.textContent = 'Khám phá địa điểm vui chơi giải trí & hẹn hò theo ý chỉ Hoàng Thượng!';
    if (headerManageText) headerManageText.innerHTML = `Địa điểm (<span id="foods-badge-count">${places.length}</span>)`;

    updateActivePlaceFilterCount();
    setupClawMachine();
    setupSlotMachine();
  } else {
    // Mode: Hôm Nay Ăn Gì? (Minigames đồ ăn)
    if (placeSwitchBtn) placeSwitchBtn.className = 'px-3 md:px-4 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all duration-300 flex items-center space-x-1.5 text-stone-600 hover:text-rose-600 hover:bg-white/60';
    if (foodSwitchBtn) foodSwitchBtn.className = 'px-3 md:px-4 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all duration-300 flex items-center space-x-1.5 bg-rose-500 text-white shadow-sm scale-105';
    if (wishlistSwitchBtn) wishlistSwitchBtn.className = 'px-3 md:px-4 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all duration-300 flex items-center space-x-1.5 text-stone-600 hover:text-amber-700 hover:bg-white/60';

    if (wishlistView) {
      wishlistView.classList.add('hidden');
      wishlistView.classList.remove('flex');
    }
    if (gameTabsContainer) gameTabsContainer.classList.remove('hidden');
    if (gameArenaContainer) gameArenaContainer.classList.remove('hidden');

    if (placeFilters) {
      placeFilters.classList.add('hidden');
      placeFilters.classList.remove('flex');
    }
    if (foodFilters) foodFilters.classList.remove('hidden');

    if (headerMainTitle) headerMainTitle.innerHTML = 'HÔM NAY <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">ĂN GÌ NHỈ?</span>';
    if (headerMainIcon) headerMainIcon.textContent = '🐾';
    if (headerMainTagline) headerMainTagline.textContent = 'Vòng quay ẩm thực may mắn theo ý chỉ của Hoàng Thượng!';
    if (headerManageText) headerManageText.innerHTML = `Thực đơn (<span id="foods-badge-count">${foods.length}</span>)`;

    updateActiveFilterCount();
    setupClawMachine();
    setupSlotMachine();
  }
}

function initModeSwitcher() {
  const foodBtn = document.getElementById('mode-switch-food');
  const placeBtn = document.getElementById('mode-switch-place');
  const wishlistBtn = document.getElementById('mode-switch-wishlist');
  if (foodBtn) foodBtn.onclick = () => setAppMode('food');
  if (placeBtn) placeBtn.onclick = () => setAppMode('place');
  if (wishlistBtn) wishlistBtn.onclick = () => setAppMode('wishlist');
}

// --- 13. SOUNDCLOUD BACKGROUND MUSIC (PLAYLIST 4 BÀI XOAY VÒNG) ---
const BGM_PLAYLIST = [
  {
    title: "VSTRA - Ai Ngoài Anh 💕",
    url: "https://api.soundcloud.com/tracks/2237488661"
  },
  {
    title: "Đưa Em Về Nhà 🛵",
    url: "https://api.soundcloud.com/tracks/1531767415"
  },
  {
    title: "Obito - Hà Nội ft VSTRA (MDXI RMX) 🎧",
    url: "https://api.soundcloud.com/tracks/1834004217"
  },
  {
    title: "Không Yêu Em Thì Yêu Ai..? 💖",
    url: "https://api.soundcloud.com/tracks/1925174048"
  }
];

class SoundCloudBgmController {
  constructor() {
    this.widget = null;
    this.isReady = false;
    this.shouldPlay = true;
    this.isActuallyPlaying = false;
    this.volume = 25;
    this.currentIndex = 0;
    this.playlist = BGM_PLAYLIST;
  }

  init() {
    if (this.widget) return;
    const iframe = document.getElementById('sc-bgm-iframe');
    if (!iframe) return;

    if (typeof window.SC === 'undefined' || !window.SC.Widget) {
      setTimeout(() => this.init(), 250);
      return;
    }

    try {
      this.widget = window.SC.Widget(iframe);
      this.widget.bind(window.SC.Widget.Events.READY, () => {
        this.isReady = true;
        this.widget.setVolume(this.volume);

        // Tự động xoay vòng bài hát tiếp theo khi kết thúc bài
        this.widget.bind(window.SC.Widget.Events.FINISH, () => {
          if (!audio.muted && this.shouldPlay) {
            this.next(true);
          }
        });

        this.widget.bind(window.SC.Widget.Events.PLAY, () => {
          this.isActuallyPlaying = true;
          this.widget.setVolume(this.volume);
          updateSoundVisuals(true);
        });

        this.widget.bind(window.SC.Widget.Events.PAUSE, () => {
          this.isActuallyPlaying = false;
          updateSoundVisuals(false);
        });

        if (this.shouldPlay && !audio.muted) {
          this.widget.play();
        }
      });
    } catch (e) {
      console.warn("SoundCloud Widget initialization:", e);
    }
  }

  getCurrentTrack() {
    return this.playlist[this.currentIndex];
  }

  next(showToast = true) {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.loadCurrentTrack(true, showToast);
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadCurrentTrack(true, true);
  }

  loadCurrentTrack(autoPlay = true, showToast = true) {
    if (!this.widget) return;
    const track = this.getCurrentTrack();
    try {
      this.widget.load(track.url, {
        auto_play: autoPlay && this.shouldPlay && !audio.muted,
        hide_related: true,
        show_comments: false,
        show_user: false,
        show_reposts: false,
        show_teaser: false,
        visual: false,
        callback: () => {
          this.widget.setVolume(this.volume);
          if (autoPlay && this.shouldPlay && !audio.muted) {
            this.widget.play();
          }
          if (showToast) {
            showCatToast(`🎵 Đang phát: ${track.title}`, "success");
          }
        }
      });
    } catch (e) {
      console.warn("SC load track error:", e);
    }
  }

  play() {
    this.shouldPlay = true;
    if (this.isReady && this.widget) {
      try {
        this.widget.setVolume(this.volume);
        this.widget.play();
      } catch (e) {
        console.warn("SC play error:", e);
      }
    } else {
      this.init();
    }
  }

  pause() {
    this.shouldPlay = false;
    if (this.isReady && this.widget) {
      try {
        this.widget.pause();
      } catch (e) {}
    }
  }

  stop() {
    this.pause();
  }

  start() {
    this.play();
  }
}

const lotteryBgm = new SoundCloudBgmController();

function updateSoundVisuals(isPlaying) {
  const indicator = document.getElementById('bgm-playing-indicator');
  const muteSlash = document.getElementById('sound-mute-slash');

  if (indicator) {
    if (isPlaying && !audio.muted) {
      indicator.classList.remove('hidden');
      indicator.classList.add('flex');
    } else {
      indicator.classList.add('hidden');
      indicator.classList.remove('flex');
    }
  }

  if (muteSlash) {
    if (audio.muted) {
      muteSlash.classList.remove('hidden');
      muteSlash.classList.add('flex');
    } else {
      muteSlash.classList.add('hidden');
      muteSlash.classList.remove('flex');
    }
  }
}

function initSoundToggle() {
  const soundBtn = document.getElementById('btn-toggle-sound');
  const soundBell = document.getElementById('sound-bell-icon');
  const nextBgmBtn = document.getElementById('btn-next-bgm');

  if (soundBtn) {
    soundBtn.onclick = (e) => {
      if (e) e.stopPropagation();
      audio.init();
      audio.muted = !audio.muted;
      if (audio.muted) {
        soundBtn.classList.add('opacity-50');
        if (soundBell) {
          soundBell.classList.remove('text-amber-500');
          soundBell.classList.add('text-stone-400');
        }
        lotteryBgm.stop();
        updateSoundVisuals(false);
      } else {
        soundBtn.classList.remove('opacity-50');
        if (soundBell) {
          soundBell.classList.add('text-amber-500');
          soundBell.classList.remove('text-stone-400');
        }
        lotteryBgm.start();
        updateSoundVisuals(true);
        audio.playBellDing();
      }
    };
  }

  if (nextBgmBtn) {
    nextBgmBtn.onclick = (e) => {
      if (e) e.stopPropagation();
      audio.playPop();
      if (audio.muted) {
        audio.init();
        audio.muted = false;
        if (soundBtn) soundBtn.classList.remove('opacity-50');
        if (soundBell) {
          soundBell.classList.add('text-amber-500');
          soundBell.classList.remove('text-stone-400');
        }
        updateSoundVisuals(true);
      }
      lotteryBgm.next(true);
    };
  }
}

// --- 14. RESULT MODAL ACTIONS ---
function initResultActions() {
  const closeBtn = document.getElementById('btn-close-result');
  const acceptBtn = document.getElementById('btn-accept-result');
  const retryBtn = document.getElementById('btn-retry-result');

  closeBtn.onclick = hideResultModal;
  acceptBtn.onclick = () => {
    audio.playMeow();
    hideResultModal();
  };
  retryBtn.onclick = () => {
    audio.playPop();
    hideResultModal();
    setTimeout(() => {
      const newPick = getRandomItem();
      showResultModal(newPick);
    }, 250);
  };
}

// --- 15. BOOTSTRAP ---
function triggerUserAudioUnlock() {
  audio.init();
  if (!audio.muted && lotteryBgm.shouldPlay && !lotteryBgm.isActuallyPlaying) {
    lotteryBgm.play();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadMealTags();
  loadPlaceTags();
  loadFoods();
  loadPlaces();
  loadCoupleWishlist();
  loadSuggestions();

  // Initialize Firebase Realtime Cloud Sync (Đồng bộ nhóm 4-5 người)
  initFirebaseSync();

  const badgeCount = document.getElementById('foods-badge-count');
  if (badgeCount) badgeCount.textContent = foods.length;

  initPawCursor();
  initTabs();
  initDualFilters();
  initPlaceFilters();
  initModeSwitcher();
  initSoundToggle();
  initConfirmModal();
  initFoodManager();
  initCoupleWishlist();
  updateAdminBranding();
  initSuggestionModal();
  initPublicMenuModal();
  initResultActions();
  setupClawMachine();
  setupSlotMachine();
  setupOmikuji();

  // Initialize SoundCloud Background Player
  lotteryBgm.init();

  // Tự động bật nhạc ngay khi Sen chạm hoặc click chuột bất kỳ đâu
  ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
    window.addEventListener(evt, triggerUserAudioUnlock, { passive: true });
  });
});

