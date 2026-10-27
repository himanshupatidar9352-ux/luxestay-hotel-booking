/**
 * LuxeStay - E-Commerce Hotel Booking Platform
 * Modern Client Application Logic
 */

(function () {
  'use strict';

  // State Management
  const state = {
    hotels: [],
    destinations: (window.LUXE_DATA && window.LUXE_DATA.destinations) || [],
    currencies: (window.LUXE_DATA && window.LUXE_DATA.currencies) || {
      USD: { symbol: "$", rate: 1.0 },
      EUR: { symbol: "€", rate: 0.92 },
      GBP: { symbol: "£", rate: 0.79 },
      INR: { symbol: "₹", rate: 86.5 }
    },
    currentCurrency: localStorage.getItem("luxestay_currency") || "USD",
    theme: localStorage.getItem("luxestay_theme") || "light",
    wishlist: JSON.parse(localStorage.getItem("luxestay_wishlist") || "[]"),
    viewMode: localStorage.getItem("luxestay_view") || "grid",
    activeHotel: null,
    activeRoom: null,
    searchParams: {
      destination: "",
      checkIn: "",
      checkOut: "",
      adults: 2,
      children: 0,
      rooms: 1,
      nights: 3
    },
    filters: {
      minPrice: 0,
      maxPrice: 2000,
      propertyType: "All",
      minRating: 0,
      amenity: "",
      sortBy: "recommended"
    },
    appliedCoupon: null
  };

  // Helper: Format Currency
  function formatMoney(amountUSD) {
    const curr = state.currencies[state.currentCurrency] || { symbol: "$", rate: 1.0 };
    const converted = Math.round(amountUSD * curr.rate);
    return `${curr.symbol}${converted.toLocaleString()}`;
  }

  // Helper: Toast Notifications
  function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // Initialize Dates
  function initDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const depart = new Date(tomorrow);
    depart.setDate(depart.getDate() + 3);

    const checkInInput = document.getElementById("search-checkin");
    const checkOutInput = document.getElementById("search-checkout");

    const fmt = d => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    
    if (checkInInput && checkOutInput) {
      checkInInput.min = fmt(today);
      checkInInput.value = fmt(tomorrow);
      checkOutInput.min = fmt(tomorrow);
      checkOutInput.value = fmt(depart);

      state.searchParams.checkIn = checkInInput.value;
      state.searchParams.checkOut = checkOutInput.value;
      calculateNights();

      checkInInput.addEventListener("change", () => {
        if (checkInInput.value >= checkOutInput.value) {
          const nextDay = new Date(checkInInput.value);
          nextDay.setDate(nextDay.getDate() + 1);
          checkOutInput.value = fmt(nextDay);
        }
        checkOutInput.min = checkInInput.value;
        state.searchParams.checkIn = checkInInput.value;
        state.searchParams.checkOut = checkOutInput.value;
        calculateNights();
        renderHotels();
      });

      checkOutInput.addEventListener("change", () => {
        state.searchParams.checkOut = checkOutInput.value;
        calculateNights();
        renderHotels();
      });
    }
  }

  function calculateNights() {
    if (!state.searchParams.checkIn || !state.searchParams.checkOut) {
      state.searchParams.nights = 1;
      return;
    }
    const d1 = new Date(state.searchParams.checkIn);
    const d2 = new Date(state.searchParams.checkOut);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    state.searchParams.nights = diff > 0 ? diff : 1;
    const nightBadge = document.getElementById("night-count-badge");
    if (nightBadge) {
      nightBadge.textContent = `${state.searchParams.nights} night${state.searchParams.nights > 1 ? 's' : ''}`;
    }
  }

  // Fetch Hotels from REST API with Fallback
  async function fetchHotels() {
    const params = new URLSearchParams();
    if (state.searchParams.destination) params.append("city", state.searchParams.destination);
    if (state.filters.minPrice > 0) params.append("minPrice", state.filters.minPrice);
    if (state.filters.maxPrice < 2000) params.append("maxPrice", state.filters.maxPrice);
    if (state.filters.minRating > 0) params.append("minRating", state.filters.minRating);
    if (state.filters.propertyType && state.filters.propertyType !== "All") params.append("propertyType", state.filters.propertyType);
    if (state.filters.amenity) params.append("amenity", state.filters.amenity);
    if (state.filters.sortBy) params.append("sortBy", state.filters.sortBy);

    try {
      const res = await fetch(`/api/hotels?${params.toString()}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      state.hotels = data.hotels || [];
    } catch (e) {
      console.warn("Using offline fallback catalog:", e);
      let list = (window.LUXE_DATA && window.LUXE_DATA.fallbackHotels) || [];
      if (state.searchParams.destination) {
        const q = state.searchParams.destination.toLowerCase();
        list = list.filter(h => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.country.toLowerCase().includes(q));
      }
      if (state.filters.maxPrice < 2000) {
        list = list.filter(h => h.price_per_night <= state.filters.maxPrice);
      }
      if (state.filters.minRating > 0) {
        list = list.filter(h => h.guest_rating >= state.filters.minRating);
      }
      if (state.filters.propertyType && state.filters.propertyType !== "All") {
        list = list.filter(h => h.property_type.includes(state.filters.propertyType));
      }
      state.hotels = list;
    }
    renderHotels();
  }

  // Render Hotel Listings
  function renderHotels() {
    const container = document.getElementById("hotels-grid");
    const countEl = document.getElementById("results-count-num");
    if (!container) return;

    if (countEl) countEl.textContent = state.hotels.length;

    if (state.hotels.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <svg class="icon" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 14px;" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3 style="font-size: 1.3rem; margin-bottom: 8px;">No luxury sanctuaries match your criteria</h3>
          <p style="color: var(--text-muted); margin-bottom: 18px;">Try clearing some filters or searching for another dream destination.</p>
          <button id="reset-filter-empty-btn" class="explore-btn" style="padding: 10px 24px;">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById("reset-filter-empty-btn");
      if (resetBtn) resetBtn.addEventListener("click", resetFilters);
      return;
    }

    container.className = `hotels-container ${state.viewMode}-view`;

    container.innerHTML = state.hotels.map(h => {
      const isWishlisted = state.wishlist.includes(h.id);
      const stayTotal = Math.round(h.price_per_night * state.searchParams.nights);
      
      const amenityHtml = (h.amenities || []).slice(0, 3).map(a => 
        `<span class="amenity-pill">${a}</span>`
      ).join("");

      return `
        <div class="hotel-card" data-id="${h.id}">
          <div class="hotel-card-media">
            <img src="${h.image_url}" alt="${h.name}" loading="lazy" />
            <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-wishlist-id="${h.id}" title="Save to favorites">
              <svg class="icon" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <span class="card-badge">${h.property_type || '5-Star Resort'}</span>
          </div>

          <div class="hotel-card-body">
            <div>
              <div class="hotel-location">
                <svg class="icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>${h.city}, ${h.country}</span>
              </div>
              <h3 class="hotel-name" data-hotel-click="${h.id}">${h.name}</h3>
              <p class="hotel-tagline">${h.tagline || ''}</p>
            </div>

            <div>
              <div class="rating-badge-container">
                <span class="rating-score">${h.guest_rating || 9.5}</span>
                <span class="rating-text">Exceptional</span>
                <span class="rating-reviews">(${h.review_count || 120} reviews)</span>
              </div>

              <div class="amenity-pills">
                ${amenityHtml}
              </div>
            </div>

            <div class="hotel-card-footer">
              <div class="price-block">
                <span class="price-label">Starting from</span>
                <div class="price-amount">
                  ${formatMoney(h.price_per_night)} <span class="price-night">/ night</span>
                </div>
                <div class="price-total-est">
                  ${formatMoney(stayTotal)} for ${state.searchParams.nights} night${state.searchParams.nights > 1 ? 's' : ''} (taxes included)
                </div>
              </div>

              <button class="explore-btn" data-hotel-click="${h.id}">
                Select Rooms
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Bind card clicks
    container.querySelectorAll("[data-hotel-click]").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-hotel-click");
        openHotelModal(id);
      });
    });

    container.querySelectorAll("[data-wishlist-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute("data-wishlist-id"));
        toggleWishlist(id, btn);
      });
    });
  }

  // Wishlist Handling
  function toggleWishlist(id, btn) {
    const idx = state.wishlist.indexOf(id);
    if (idx > -1) {
      state.wishlist.splice(idx, 1);
      btn.classList.remove("active");
      btn.querySelector("svg").setAttribute("fill", "none");
      showToast("Removed from your saved wishlist");
    } else {
      state.wishlist.push(id);
      btn.classList.add("active");
      btn.querySelector("svg").setAttribute("fill", "currentColor");
      showToast("Added to your saved wishlist! ❤️");
    }
    localStorage.setItem("luxestay_wishlist", JSON.stringify(state.wishlist));
    updateWishlistBadge();
  }

  function updateWishlistBadge() {
    const badge = document.getElementById("wishlist-counter-badge");
    if (badge) {
      badge.textContent = state.wishlist.length;
      badge.style.display = state.wishlist.length > 0 ? "inline-block" : "none";
    }
  }

  // Open Hotel Detail Modal
  async function openHotelModal(id) {
    try {
      const res = await fetch(`/api/hotels/${id}`);
      if (!res.ok) throw new Error("Failed to load hotel details");
      const data = await res.json();
      state.activeHotel = data.hotel;
      renderHotelModalContent(state.activeHotel);
      document.getElementById("hotel-details-modal").classList.add("open");
    } catch (e) {
      console.warn("Using offline fallback hotel details:", e);
      const fallback = (window.LUXE_DATA && window.LUXE_DATA.fallbackHotels || []).find(h => h.id == id);
      if (fallback) {
        state.activeHotel = fallback;
        renderHotelModalContent(fallback);
        document.getElementById("hotel-details-modal").classList.add("open");
      } else {
        showToast("Failed to load hotel details", "error");
      }
    }
  }

  function renderHotelModalContent(hotel) {
    const modal = document.getElementById("hotel-details-modal");
    if (!modal) return;

    // Gallery
    const gallery = hotel.gallery && hotel.gallery.length > 0 ? hotel.gallery : [hotel.image_url];
    const mainImg = modal.querySelector(".modal-main-img");
    mainImg.src = gallery[0];

    const thumbsRow = modal.querySelector(".modal-thumbs-row");
    thumbsRow.innerHTML = gallery.map((img, i) => `
      <img src="${img}" class="modal-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" alt="Thumbnail" />
    `).join("");

    thumbsRow.querySelectorAll(".modal-thumb").forEach(thumb => {
      thumb.addEventListener("click", () => {
        thumbsRow.querySelectorAll(".modal-thumb").forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
        mainImg.src = thumb.src;
      });
    });

    // Info
    document.getElementById("modal-hotel-title").textContent = hotel.name;
    document.getElementById("modal-hotel-city").textContent = `${hotel.address}, ${hotel.city}, ${hotel.country}`;
    document.getElementById("modal-hotel-rating").textContent = hotel.guest_rating || "9.5";
    document.getElementById("modal-hotel-reviews-count").textContent = `(${hotel.review_count || 0} verified guest reviews)`;
    document.getElementById("modal-hotel-desc").textContent = hotel.description;

    // Amenities list
    const amenList = document.getElementById("modal-amenities-list");
    amenList.innerHTML = (hotel.amenities || []).map(a => `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; padding: 8px 12px; background: var(--bg-subtle); border-radius: var(--radius-sm);">
        <svg class="icon" style="color: var(--primary);" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${a}</span>
      </div>
    `).join("");

    // Rooms list
    const roomsContainer = document.getElementById("modal-rooms-container");
    if (hotel.rooms && hotel.rooms.length > 0) {
      roomsContainer.innerHTML = hotel.rooms.map(room => {
        const roomStayTotal = Math.round(room.price_per_night * state.searchParams.nights);
        return `
          <div class="room-card">
            <img src="${room.image_url || hotel.image_url}" class="room-card-img" alt="${room.name}" />
            <div class="room-card-details">
              <h4>${room.name}</h4>
              <div class="room-specs">
                <span><svg class="icon" viewBox="0 0 24 24"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"></path><path d="M3 10V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path></svg> ${room.bed_type || '1 King Bed'}</span>
                <span><svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg> Up to ${room.max_guests} guests</span>
                <span><svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg> ${room.size_sqm || 45} m²</span>
              </div>
              <p class="room-desc">${room.description || ''}</p>
              <div class="amenity-pills">
                ${(room.amenities || []).map(am => `<span class="amenity-pill">${am}</span>`).join("")}
              </div>
            </div>
            <div class="room-card-price-action">
              <span class="price-label">Nightly rate</span>
              <div class="price-amount">${formatMoney(room.price_per_night)}</div>
              <span style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">
                ${formatMoney(roomStayTotal)} total for ${state.searchParams.nights} nights
              </span>
              <button class="reserve-room-btn" data-room-id="${room.id}">
                Book Suite
              </button>
            </div>
          </div>
        `;
      }).join("");

      roomsContainer.querySelectorAll("[data-room-id]").forEach(btn => {
        btn.addEventListener("click", () => {
          const roomId = parseInt(btn.getAttribute("data-room-id"));
          const selectedRoom = hotel.rooms.find(r => r.id === roomId);
          modal.classList.remove("open");
          openCheckout(hotel, selectedRoom);
        });
      });
    } else {
      roomsContainer.innerHTML = `<p style="color: var(--text-muted);">No rooms currently available for this property.</p>`;
    }

    // Reviews list
    const reviewsContainer = document.getElementById("modal-reviews-list");
    if (hotel.reviews && hotel.reviews.length > 0) {
      reviewsContainer.innerHTML = hotel.reviews.map(rev => `
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary); color: #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">
                ${rev.author_name ? rev.author_name.charAt(0) : 'G'}
              </span>
              <div>
                <strong style="font-size: 0.9rem;">${rev.author_name}</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 6px;">${rev.country || 'International'} • ${rev.stay_type || 'Verified Stay'}</span>
              </div>
            </div>
            <span class="rating-score">${rev.rating}</span>
          </div>
          <div style="font-weight: 700; font-size: 0.92rem; margin-top: 4px;">${rev.title || ''}</div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">${rev.comment || ''}</p>
        </div>
      `).join("");
    } else {
      reviewsContainer.innerHTML = `<p style="color: var(--text-muted);">Be the first verified guest to review this luxury property.</p>`;
    }
  }

  // Open Checkout Modal
  function openCheckout(hotel, room) {
    state.activeHotel = hotel;
    state.activeRoom = room;
    state.appliedCoupon = null;

    const modal = document.getElementById("checkout-modal");
    if (!modal) return;

    // Hotel summary info
    document.getElementById("checkout-hotel-img").src = hotel.image_url;
    document.getElementById("checkout-hotel-name").textContent = hotel.name;
    document.getElementById("checkout-room-name").textContent = room.name;
    document.getElementById("checkout-dates-display").textContent = `${state.searchParams.checkIn} to ${state.searchParams.checkOut} (${state.searchParams.nights} Nights, ${state.searchParams.adults} Guests)`;

    updateCheckoutPricing();
    modal.classList.add("open");
  }

  function updateCheckoutPricing() {
    if (!state.activeHotel || !state.activeRoom) return;

    const nights = state.searchParams.nights;
    const roomRate = state.activeRoom.price_per_night;
    const subtotal = roomRate * nights;
    
    // Meal plan adjustment
    const mealSelect = document.getElementById("checkout-meal-plan");
    let mealFeePerNight = 0;
    if (mealSelect && mealSelect.value === "half-board") {
      mealFeePerNight = 95;
    }
    const mealTotal = mealFeePerNight * nights;

    // Taxes & Fees (10% VAT + $40 Resort fee)
    const resortFee = 40;
    const taxes = Math.round((subtotal + mealTotal) * 0.10);

    // Coupon discount calculation
    let discount = 0;
    if (state.appliedCoupon) {
      if (state.appliedCoupon.discount_percent > 0) {
        discount = Math.round((subtotal * state.appliedCoupon.discount_percent) / 100);
      } else if (state.appliedCoupon.discount_amount > 0) {
        discount = state.appliedCoupon.discount_amount;
      }
    }

    const total = Math.max(0, subtotal + mealTotal + resortFee + taxes - discount);

    document.getElementById("chk-subtotal-val").textContent = formatMoney(subtotal);
    document.getElementById("chk-meal-val").textContent = formatMoney(mealTotal);
    document.getElementById("chk-resort-val").textContent = formatMoney(resortFee);
    document.getElementById("chk-taxes-val").textContent = formatMoney(taxes);
    
    const discountRow = document.getElementById("chk-discount-row");
    if (discount > 0) {
      discountRow.style.display = "flex";
      document.getElementById("chk-discount-val").textContent = `-${formatMoney(discount)}`;
    } else {
      discountRow.style.display = "none";
    }

    document.getElementById("chk-total-val").textContent = formatMoney(total);
    document.getElementById("chk-pay-btn-amount").textContent = formatMoney(total);

    // Save calculated totals for payload
    state.checkoutCalc = {
      subtotal,
      mealPlan: mealSelect ? mealSelect.options[mealSelect.selectedIndex].text : "Breakfast Included",
      taxAndFees: resortFee + taxes,
      discount,
      total
    };
  }

  // Handle Coupon Apply
  async function applyCouponCode() {
    const input = document.getElementById("coupon-code-input");
    const msg = document.getElementById("coupon-feedback-msg");
    const code = input ? input.value.trim().toUpperCase() : "";

    if (!code) return;

    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok && data.coupon) {
        state.appliedCoupon = data.coupon;
        msg.style.color = "var(--success)";
        msg.textContent = `Promo code "${data.coupon.code}" applied! ${data.coupon.description}`;
        updateCheckoutPricing();
        showToast(`Coupon ${code} applied successfully! 🎉`);
      } else {
        state.appliedCoupon = null;
        msg.style.color = "var(--danger)";
        msg.textContent = data.error || "Invalid promo code.";
        updateCheckoutPricing();
      }
    } catch (e) {
      const match = (window.LUXE_DATA && window.LUXE_DATA.popularCoupons || []).find(c => c.code === code);
      if (match) {
        state.appliedCoupon = match;
        msg.style.color = "var(--success)";
        msg.textContent = `Promo code "${match.code}" applied! ${match.description}`;
        updateCheckoutPricing();
        showToast(`Coupon ${code} applied successfully! 🎉`);
      } else {
        msg.style.color = "var(--danger)";
        msg.textContent = "Invalid or expired promo code.";
      }
    }
  }

  // Submit Booking
  async function submitBooking(e) {
    e.preventDefault();

    const form = document.getElementById("checkout-form");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payBtn = document.getElementById("complete-booking-btn");
    payBtn.disabled = true;
    payBtn.innerHTML = `<span>Processing Secure Reservation...</span>`;

    const payload = {
      hotel_id: state.activeHotel.id,
      room_id: state.activeRoom.id,
      first_name: document.getElementById("guest-fname").value,
      last_name: document.getElementById("guest-lname").value,
      email: document.getElementById("guest-email").value,
      phone: document.getElementById("guest-phone").value,
      special_requests: document.getElementById("guest-requests").value,
      check_in: state.searchParams.checkIn,
      check_out: state.searchParams.checkOut,
      nights: state.searchParams.nights,
      guests: state.searchParams.adults + state.searchParams.children,
      meal_plan: state.checkoutCalc.mealPlan,
      subtotal: state.checkoutCalc.subtotal,
      discount: state.checkoutCalc.discount,
      coupon_code: state.appliedCoupon ? state.appliedCoupon.code : "",
      tax_and_fees: state.checkoutCalc.taxAndFees,
      total_price: state.checkoutCalc.total,
      currency: state.currentCurrency,
      payment_method: document.getElementById("payment-type").value
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        document.getElementById("checkout-modal").classList.remove("open");
        showToast("Reservation Confirmed! Welcome to LuxeStay.", "success");
        openVoucherModal(data.booking);
      } else {
        showToast(data.error || "Booking failed", "error");
      }
    } catch (e) {
      console.warn("Offline fallback booking voucher generation:", e);
      // Generate client-side voucher
      const mockRef = `LX-${Math.floor(10000 + Math.random() * 90000)}`;
      const offlineBooking = {
        booking_ref: mockRef,
        hotel_name: state.activeHotel.name,
        room_name: state.activeRoom.name,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        check_in: payload.check_in,
        check_out: payload.check_out,
        nights: payload.nights,
        guests: payload.guests,
        meal_plan: payload.meal_plan,
        total_price: payload.total_price,
        created_at: new Date().toLocaleString()
      };
      document.getElementById("checkout-modal").classList.remove("open");
      showToast("Reservation Confirmed! (Demo Mode)", "success");
      openVoucherModal(offlineBooking);
    } finally {
      payBtn.disabled = false;
      payBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Complete Reservation (<span id="chk-pay-btn-amount">${formatMoney(state.checkoutCalc.total)}</span>)`;
    }
  }

  // Open Confirmation Voucher Modal
  function openVoucherModal(booking) {
    const modal = document.getElementById("voucher-modal");
    if (!modal) return;

    document.getElementById("voucher-ref-code").textContent = booking.booking_ref;
    document.getElementById("voucher-hotel-name").textContent = booking.hotel_name;
    document.getElementById("voucher-room-name").textContent = booking.room_name;
    document.getElementById("voucher-guest-name").textContent = `${booking.first_name} ${booking.last_name}`;
    document.getElementById("voucher-guest-email").textContent = booking.email;
    document.getElementById("voucher-checkin").textContent = booking.check_in;
    document.getElementById("voucher-checkout").textContent = booking.check_out;
    document.getElementById("voucher-nights-guests").textContent = `${booking.nights} Nights • ${booking.guests} Guests`;
    document.getElementById("voucher-meal-plan").textContent = booking.meal_plan;
    document.getElementById("voucher-total-paid").textContent = formatMoney(booking.total_price);
    document.getElementById("voucher-booking-date").textContent = booking.created_at;

    modal.classList.add("open");
  }

  // Open "My Bookings" Customer Portal
  async function openMyBookings(emailQuery = "") {
    const modal = document.getElementById("my-bookings-modal");
    if (!modal) return;

    const email = emailQuery || document.getElementById("my-bookings-email-input").value.trim();
    const listContainer = document.getElementById("my-bookings-list");

    listContainer.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--text-muted);">Loading reservations...</p>`;
    modal.classList.add("open");

    try {
      const url = email ? `/api/bookings?email=${encodeURIComponent(email)}` : `/api/bookings`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.bookings && data.bookings.length > 0) {
        listContainer.innerHTML = `
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Hotel & Suite</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.bookings.map(b => `
                  <tr>
                    <td><strong>${b.booking_ref}</strong></td>
                    <td>
                      <div><strong>${b.hotel_name}</strong></div>
                      <div style="font-size: 0.78rem; color: var(--text-muted);">${b.room_name}</div>
                    </td>
                    <td>
                      <div>${b.check_in} → ${b.check_out}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${b.nights} nights, ${b.guests} guests</div>
                    </td>
                    <td><strong>${formatMoney(b.total_price)}</strong></td>
                    <td>
                      <span class="status-badge ${b.booking_status.toLowerCase()}">${b.booking_status}</span>
                    </td>
                    <td>
                      <button class="nav-btn" style="padding: 4px 10px; font-size: 0.75rem; margin-bottom: 4px;" data-view-voucher="${b.booking_ref}">
                        View Voucher
                      </button>
                      ${b.booking_status === 'CONFIRMED' ? `
                        <button class="nav-btn" style="padding: 4px 10px; font-size: 0.75rem; color: var(--danger); border-color: rgba(239,68,68,0.3);" data-cancel-ref="${b.booking_ref}">
                          Cancel
                        </button>
                      ` : ''}
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `;

        listContainer.querySelectorAll("[data-view-voucher]").forEach(btn => {
          btn.addEventListener("click", () => {
            const ref = btn.getAttribute("data-view-voucher");
            const b = data.bookings.find(item => item.booking_ref === ref);
            if (b) openVoucherModal(b);
          });
        });

        listContainer.querySelectorAll("[data-cancel-ref]").forEach(btn => {
          btn.addEventListener("click", () => {
            const ref = btn.getAttribute("data-cancel-ref");
            cancelBooking(ref);
          });
        });
      } else {
        listContainer.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <svg class="icon" style="width: 40px; height: 40px; margin-bottom: 10px;" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <p>No reservations found for ${email || 'this session'}.</p>
          </div>
        `;
      }
    } catch (e) {
      listContainer.innerHTML = `<p style="padding: 20px; color: var(--danger); text-align: center;">Error loading bookings.</p>`;
    }
  }

  // Cancel Booking
  async function cancelBooking(ref) {
    if (!confirm(`Are you sure you want to cancel booking reference ${ref}? A full refund will be initiated immediately.`)) return;

    try {
      const res = await fetch(`/api/bookings/${ref}/cancel`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Booking ${ref} cancelled`, "info");
        openMyBookings();
        fetchHotels();
      } else {
        showToast(data.error || "Could not cancel booking", "error");
      }
    } catch (e) {
      showToast("Network error cancelling reservation", "error");
    }
  }

  // Open Admin Dashboard Modal
  async function openAdminDashboard() {
    const modal = document.getElementById("admin-modal");
    if (!modal) return;
    modal.classList.add("open");

    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok && data.stats) {
        document.getElementById("admin-stat-revenue").textContent = formatMoney(data.stats.total_revenue);
        document.getElementById("admin-stat-bookings").textContent = data.stats.total_bookings;
        document.getElementById("admin-stat-hotels").textContent = data.stats.total_hotels;
        document.getElementById("admin-stat-rating").textContent = `${data.stats.avg_rating} / 10`;

        const recentTbody = document.getElementById("admin-recent-bookings-tbody");
        recentTbody.innerHTML = (data.stats.recent_bookings || []).map(b => `
          <tr>
            <td><strong>${b.booking_ref}</strong></td>
            <td>${b.first_name} ${b.last_name}</td>
            <td>${b.hotel_name}</td>
            <td>${b.check_in}</td>
            <td>${formatMoney(b.total_price)}</td>
            <td><span class="status-badge ${b.booking_status.toLowerCase()}">${b.booking_status}</span></td>
          </tr>
        `).join("");
      }
    } catch (e) {
      console.warn("Could not load admin stats:", e);
    }
  }

  // Add New Hotel via Admin
  async function handleAddHotel(e) {
    e.preventDefault();
    const name = document.getElementById("new-hotel-name").value;
    const city = document.getElementById("new-hotel-city").value;
    const country = document.getElementById("new-hotel-country").value;
    const price = parseFloat(document.getElementById("new-hotel-price").value);
    const propType = document.getElementById("new-hotel-type").value;
    const imgUrl = document.getElementById("new-hotel-image").value || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

    const payload = {
      name,
      city,
      country,
      price_per_night: price,
      property_type: propType,
      image_url: imgUrl,
      tagline: `Exclusive 5-star haven in ${city}`,
      description: `Experience unparalleled hospitality, bespoke suites, and panoramic views at ${name}.`
    };

    try {
      const res = await fetch("/api/admin/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast("New hotel successfully added to catalog!", "success");
        document.getElementById("add-hotel-form").reset();
        openAdminDashboard();
        fetchHotels();
      } else {
        showToast(data.error || "Failed to add hotel", "error");
      }
    } catch (e) {
      showToast("Error creating hotel", "error");
    }
  }

  // Reset Filters
  function resetFilters() {
    state.filters = {
      minPrice: 0,
      maxPrice: 2000,
      propertyType: "All",
      minRating: 0,
      amenity: "",
      sortBy: "recommended"
    };

    const slider = document.getElementById("price-slider");
    if (slider) slider.value = 2000;
    const priceDisplay = document.getElementById("max-price-display");
    if (priceDisplay) priceDisplay.textContent = formatMoney(2000);

    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) sortSelect.value = "recommended";

    document.querySelectorAll(".filter-checkbox-label input").forEach(input => {
      input.checked = input.value === "All" || input.value === "0";
    });
    document.querySelectorAll(".amenity-cb").forEach(cb => {
      cb.checked = false;
    });

    fetchHotels();
  }

  // Bind Event Listeners
  function bindEvents() {
    // Theme toggle
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      document.documentElement.setAttribute("data-theme", state.theme);
      themeBtn.addEventListener("click", () => {
        state.theme = state.theme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", state.theme);
        localStorage.setItem("luxestay_theme", state.theme);
        themeBtn.innerHTML = state.theme === "dark" 
          ? `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
          : `<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      });
    }

    // Currency Switcher
    const currSelect = document.getElementById("currency-select");
    if (currSelect) {
      currSelect.value = state.currentCurrency;
      currSelect.addEventListener("change", () => {
        state.currentCurrency = currSelect.value;
        localStorage.setItem("luxestay_currency", state.currentCurrency);
        renderHotels();
        updateCheckoutPricing();
      });
    }

    // Guest popover toggle
    const guestBtn = document.getElementById("guest-picker-btn");
    const guestPopover = document.getElementById("guest-popover");
    if (guestBtn && guestPopover) {
      guestBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        guestPopover.classList.toggle("active");
      });

      document.addEventListener("click", (e) => {
        if (!guestPopover.contains(e.target) && e.target !== guestBtn) {
          guestPopover.classList.remove("active");
        }
      });

      // Steppers
      document.querySelectorAll("[data-stepper]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const target = btn.getAttribute("data-stepper");
          const dir = parseInt(btn.getAttribute("data-dir"));
          if (target === "adults") {
            state.searchParams.adults = Math.max(1, Math.min(10, state.searchParams.adults + dir));
            document.getElementById("adults-val").textContent = state.searchParams.adults;
          } else if (target === "children") {
            state.searchParams.children = Math.max(0, Math.min(8, state.searchParams.children + dir));
            document.getElementById("children-val").textContent = state.searchParams.children;
          } else if (target === "rooms") {
            state.searchParams.rooms = Math.max(1, Math.min(5, state.searchParams.rooms + dir));
            document.getElementById("rooms-val").textContent = state.searchParams.rooms;
          }

          const guestSummary = `${state.searchParams.adults + state.searchParams.children} Guests, ${state.searchParams.rooms} Room${state.searchParams.rooms > 1 ? 's' : ''}`;
          document.getElementById("guest-display-text").textContent = guestSummary;
        });
      });
    }

    // Search button
    const searchBtn = document.getElementById("hero-search-btn");
    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        state.searchParams.destination = document.getElementById("search-destination").value.trim();
        fetchHotels();
        const listingsSec = document.getElementById("listings-section");
        if (listingsSec) {
          listingsSec.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    // Sort select
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        state.filters.sortBy = sortSelect.value;
        fetchHotels();
      });
    }

    // View mode toggle
    const gridViewBtn = document.getElementById("grid-view-btn");
    const listViewBtn = document.getElementById("list-view-btn");
    if (gridViewBtn && listViewBtn) {
      gridViewBtn.addEventListener("click", () => {
        state.viewMode = "grid";
        localStorage.setItem("luxestay_view", "grid");
        gridViewBtn.classList.add("active");
        listViewBtn.classList.remove("active");
        renderHotels();
      });
      listViewBtn.addEventListener("click", () => {
        state.viewMode = "list";
        localStorage.setItem("luxestay_view", "list");
        listViewBtn.classList.add("active");
        gridViewBtn.classList.remove("active");
        renderHotels();
      });
    }

    // Price Slider Filter
    const priceSlider = document.getElementById("price-slider");
    const maxPriceDisplay = document.getElementById("max-price-display");
    if (priceSlider && maxPriceDisplay) {
      priceSlider.addEventListener("input", () => {
        state.filters.maxPrice = parseFloat(priceSlider.value);
        maxPriceDisplay.textContent = formatMoney(state.filters.maxPrice);
      });
      priceSlider.addEventListener("change", () => {
        fetchHotels();
      });
    }

    // Property Type Filter
    document.querySelectorAll("input[name='prop_type']").forEach(radio => {
      radio.addEventListener("change", () => {
        state.filters.propertyType = radio.value;
        fetchHotels();
      });
    });

    // Rating Filter
    document.querySelectorAll("input[name='star_rating']").forEach(radio => {
      radio.addEventListener("change", () => {
        state.filters.minRating = parseFloat(radio.value);
        fetchHotels();
      });
    });

    // Curated Perks / Amenities Filter
    document.querySelectorAll(".amenity-cb").forEach(cb => {
      cb.addEventListener("change", () => {
        const checked = Array.from(document.querySelectorAll(".amenity-cb:checked")).map(c => c.value);
        state.filters.amenity = checked.join(",");
        fetchHotels();
      });
    });

    // Reset Filters Button
    const resetFilterBtn = document.getElementById("reset-filters-btn");
    if (resetFilterBtn) {
      resetFilterBtn.addEventListener("click", resetFilters);
    }

    // Modal Close Buttons
    document.querySelectorAll(".modal-close-btn, [data-modal-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("open"));
      });
    });

    // Close on backdrop click
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) backdrop.classList.remove("open");
      });
    });

    // Hotel Modal Tabs
    document.querySelectorAll(".modal-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tabTarget = btn.getAttribute("data-tab");
        document.querySelectorAll(".modal-tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        const activePane = document.getElementById(`tab-pane-${tabTarget}`);
        if (activePane) activePane.classList.add("active");
      });
    });

    // Coupon Code Apply
    const couponBtn = document.getElementById("apply-coupon-btn");
    if (couponBtn) {
      couponBtn.addEventListener("click", applyCouponCode);
    }

    // Fill Test Card Button
    const fillCardBtn = document.getElementById("fill-test-card-btn");
    if (fillCardBtn) {
      fillCardBtn.addEventListener("click", () => {
        document.getElementById("card-number-input").value = "4532 •••• •••• 8892";
        document.getElementById("card-holder-input").value = "ALEXANDER HAMILTON";
        document.getElementById("card-exp-input").value = "12/28";
        document.getElementById("card-cvv-input").value = "889";
        document.getElementById("card-preview-num").textContent = "4532 8901 2345 8892";
        document.getElementById("card-preview-name").textContent = "ALEXANDER HAMILTON";
        document.getElementById("card-preview-exp").textContent = "12/28";
        showToast("Test VIP card loaded for checkout testing! 💳");
      });
    }

    // Card Input Sync with live preview
    const cardNumInp = document.getElementById("card-number-input");
    if (cardNumInp) {
      cardNumInp.addEventListener("input", () => {
        document.getElementById("card-preview-num").textContent = cardNumInp.value || "•••• •••• •••• ••••";
      });
    }
    const cardHolderInp = document.getElementById("card-holder-input");
    if (cardHolderInp) {
      cardHolderInp.addEventListener("input", () => {
        document.getElementById("card-preview-name").textContent = (cardHolderInp.value || "CARDHOLDER NAME").toUpperCase();
      });
    }
    const cardExpInp = document.getElementById("card-exp-input");
    if (cardExpInp) {
      cardExpInp.addEventListener("input", () => {
        document.getElementById("card-preview-exp").textContent = cardExpInp.value || "MM/YY";
      });
    }

    // Meal Plan Change in Checkout
    const mealSelect = document.getElementById("checkout-meal-plan");
    if (mealSelect) {
      mealSelect.addEventListener("change", updateCheckoutPricing);
    }

    // Checkout Form Submit
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", submitBooking);
    }

    // Navigation Buttons: My Bookings, Wishlist, Admin
    const myBookingsNavBtn = document.getElementById("nav-my-bookings-btn");
    if (myBookingsNavBtn) {
      myBookingsNavBtn.addEventListener("click", () => openMyBookings());
    }

    const myBookingsSearchBtn = document.getElementById("my-bookings-search-btn");
    if (myBookingsSearchBtn) {
      myBookingsSearchBtn.addEventListener("click", () => {
        const email = document.getElementById("my-bookings-email-input").value;
        openMyBookings(email);
      });
    }

    const wishlistNavBtn = document.getElementById("nav-wishlist-btn");
    if (wishlistNavBtn) {
      wishlistNavBtn.addEventListener("click", () => {
        if (state.wishlist.length === 0) {
          showToast("Your wishlist is empty. Tap the heart on any property to save it!");
        } else {
          // Filter to wishlisted
          state.hotels = state.hotels.filter(h => state.wishlist.includes(h.id));
          renderHotels();
          showToast(`Displaying your ${state.wishlist.length} saved luxury retreats.`);
          const listingsSec = document.getElementById("listings-section");
          if (listingsSec) listingsSec.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    const adminNavBtn = document.getElementById("nav-admin-btn");
    if (adminNavBtn) {
      adminNavBtn.addEventListener("click", openAdminDashboard);
    }

    // Add Hotel Form Submit
    const addHotelForm = document.getElementById("add-hotel-form");
    if (addHotelForm) {
      addHotelForm.addEventListener("submit", handleAddHotel);
    }

    // Destination Cards Click to search
    document.querySelectorAll("[data-dest-city]").forEach(card => {
      card.addEventListener("click", () => {
        const city = card.getAttribute("data-dest-city");
        const destInput = document.getElementById("search-destination");
        if (destInput) destInput.value = city;
        state.searchParams.destination = city;
        fetchHotels();
        const listingsSec = document.getElementById("listings-section");
        if (listingsSec) listingsSec.scrollIntoView({ behavior: "smooth" });
      });
    });

    // Print Voucher Button
    const printVoucherBtn = document.getElementById("print-voucher-btn");
    if (printVoucherBtn) {
      printVoucherBtn.addEventListener("click", () => {
        window.print();
      });
    }
  }

  // App Initialization
  function init() {
    initDates();
    bindEvents();
    updateWishlistBadge();
    fetchHotels();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
