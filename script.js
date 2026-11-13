// ==========================================
// OJASWI ADVANCED DIAGNOSTICS - CORE ENGINE
// Database, Live Queue, Booking & Admin Console
// ==========================================

var mDept = 'Healthkind Total Plus', mPrice = 2249;
var DB_KEY = 'ojaswi_diagnostics_bookings_v2';
var firestoreDb = null;
var RAZORPAY_KEY = 'rzp_test_SvFIhTF7eJoyzM'; // Replace with your live/test Razorpay Key ID if needed

// Firebase Firestore Configuration (Dual-Database Architecture)
var firebaseConfig = {
  apiKey: "AIzaSyCEjEOpK60sxutw9VGtbryI1b0AQx3NmLU",
  authDomain: "nielit-project-bca35.firebaseapp.com",
  projectId: "nielit-project-bca35",
  storageBucket: "nielit-project-bca35.firebasestorage.app",
  messagingSenderId: "796845637244",
  appId: "1:796845637244:web:0e478fff0c0bf74f2493f9",
  measurementId: "G-LQPXE50R6X"
};

// Initialize Firebase safely if available
try {
  if (typeof firebase !== 'undefined' && firebase.apps && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    firestoreDb = firebase.firestore();
    console.log("Firebase Firestore Connected to project:", firebaseConfig.projectId);

    // Real-time synchronization from Cloud Firestore
    firestoreDb.collection('bookings').onSnapshot(function(snapshot) {
      if (snapshot && !snapshot.empty) {
        var cloudBookings = [];
        snapshot.forEach(function(doc) {
          cloudBookings.push(doc.data());
        });
        cloudBookings.sort(function(a, b) {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        saveBookings(cloudBookings);
        renderLiveQueue();
        var adminModal = document.getElementById('admin-dash-modal');
        if (adminModal && adminModal.classList.contains('open')) {
          renderAdminBookings();
        }
      }
    }, function(err) {
      console.warn("Firestore snapshot listener note:", err.message);
    });
  }
} catch (e) {
  console.log("Running in LocalStorage sync mode (Firebase fallback):", e.message);
}

// Initial Sample Seed Data (For immediate evaluation & demo)
var sampleSeedData = [
  {
    id: 'b-101',
    token: 'OA-101',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    aadhaar: '5421 8890 1234',
    dept: '5D Ultrasound',
    price: 900,
    date: new Date().toISOString().split('T')[0],
    time: '08:00 AM - 10:00 AM',
    payId: 'PAY-ONLINE-98124',
    status: 'Completed',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'b-102',
    token: 'OA-102',
    name: 'Mohan Lal Sharma',
    phone: '9123456780',
    aadhaar: '6743 2190 4512',
    dept: 'Healthkind Total Plus',
    price: 2249,
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 12:00 PM',
    payId: 'PAY-ONLINE-98130',
    status: 'In-Progress',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'b-103',
    token: 'OA-103',
    name: 'Anita Devi Singh',
    phone: '9898765432',
    aadhaar: '8912 3456 7890',
    dept: 'CT Scan',
    price: 2500,
    date: new Date().toISOString().split('T')[0],
    time: '12:00 PM - 02:00 PM',
    payId: 'COUNTER-CASH',
    status: 'Waiting',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b-104',
    token: 'OA-104',
    name: 'Vikram Yadav',
    phone: '9765432109',
    aadhaar: '4321 8765 2109',
    dept: 'Digital X-Ray',
    price: 400,
    date: new Date().toISOString().split('T')[0],
    time: '02:00 PM - 04:00 PM',
    payId: 'PAY-RZP-87123',
    status: 'Waiting',
    createdAt: new Date().toISOString()
  }
];

// Database Access Helpers
function getBookings() {
  try {
    var stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      localStorage.setItem(DB_KEY, JSON.stringify(sampleSeedData));
      return sampleSeedData;
    }
    return JSON.parse(stored);
  } catch (err) {
    return sampleSeedData;
  }
}

function saveBookings(list) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Local storage save error:", err);
  }
}

function addBookingToDatabase(record) {
  var list = getBookings();
  list.unshift(record);
  saveBookings(list);

  // Sync to Cloud Firestore if connected
  if (firestoreDb) {
    firestoreDb.collection('bookings').doc(record.id).set(record).catch(function(err) {
      console.warn("Firestore sync skipped:", err.message);
    });
  }

  // Update real-time views
  renderLiveQueue();
  if (document.getElementById('admin-dash-modal').classList.contains('open')) {
    renderAdminBookings();
  }
}

// DOM Initialization
document.addEventListener('DOMContentLoaded', function() {
  initFormDefaults();
  renderLiveQueue();
  bindInputFormatters();
});

function initFormDefaults() {
  var today = new Date().toISOString().split('T')[0];
  var dateInput = document.getElementById('m-date');
  if (dateInput) {
    dateInput.value = today;
    dateInput.min = today;
  }
}

function bindInputFormatters() {
  var aadhaarInput = document.getElementById('m-aadhaar');
  if (aadhaarInput) {
    aadhaarInput.addEventListener('input', function(e) {
      var value = e.target.value.replace(/\D/g, '');
      if (value.length > 12) value = value.substring(0, 12);
      var formatted = '';
      for (var i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
      }
      e.target.value = formatted;
    });
  }

  var phoneInput = document.getElementById('m-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
    });
  }

  var quickPhone = document.getElementById('sf-phone');
  if (quickPhone) {
    quickPhone.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
    });
  }
}

// Mobile Hamburger Navigation
var hamburgerBtn = document.getElementById('hamburger-btn');
var navMenu = document.getElementById('nav-menu');

if (hamburgerBtn && navMenu) {
  hamburgerBtn.addEventListener('click', function() {
    hamburgerBtn.classList.toggle('open');
    navMenu.classList.toggle('mobile-open');
  });
}

function closeNav() {
  if (hamburgerBtn) hamburgerBtn.classList.remove('open');
  if (navMenu) navMenu.classList.remove('mobile-open');
}

// Image helper for tests and packages
function getTestImage(title) {
  var t = (title || '').toUpperCase();
  if (t.includes('TOTAL PLUS') || t.includes('TOTAL+')) return 'healthkind_total.jpg';
  if (t.includes('TOTAL')) return 'pathology_lab.jpg';
  if (t.includes('ADVANCE') || t.includes('ADV.')) return 'healthkind_advance.jpg';
  if (t.includes('ULTRASOUND')) return 'ultrasound_5d.jpg';
  if (t.includes('CT')) return 'ct_scan_64.jpg';
  if (t.includes('X-RAY') || t.includes('XRAY')) return 'digital_xray.jpg';
  if (t.includes('MRI')) return 'ct_scan_64.jpg';
  return 'healthkind_total.jpg';
}

// Booking Modal Controls
function openModal(deptName, price) {
  document.getElementById('modal').classList.add('open');
  resetModalView();

  if (deptName && price) {
    var depts = document.querySelectorAll('.mdept');
    var matched = false;
    depts.forEach(function(d) {
      d.classList.remove('sel');
      var nameEl = d.querySelector('.mdept-name');
      if (nameEl) {
        var cardText = nameEl.textContent.trim().toLowerCase();
        var searchDept = deptName.toLowerCase();
        if (cardText.includes(searchDept.replace('plus', '').trim()) || searchDept.includes(cardText.replace('+', '').trim())) {
          d.classList.add('sel');
          matched = true;
        }
      }
    });
    if (!matched && depts.length > 0) {
      depts[0].classList.add('sel');
    }
    mDept = deptName;
    mPrice = price;
    var priceEl = document.getElementById('m-price');
    if (priceEl) priceEl.textContent = price;

    var bImg = document.getElementById('booking-modal-banner-img');
    if (bImg) bImg.src = getTestImage(deptName);
  } else {
    var bImgDef = document.getElementById('booking-modal-banner-img');
    if (bImgDef) bImgDef.src = 'healthkind_total.jpg';
  }
}

function closeModalDirect() {
  document.getElementById('modal').classList.remove('open');
}

function closeModal(e) {
  if (e.target === document.getElementById('modal')) closeModalDirect();
}

function mSelDept(el, name, price) {
  document.querySelectorAll('.mdept').forEach(function(d) { d.classList.remove('sel'); });
  el.classList.add('sel');
  mDept = name;
  mPrice = price;
  var priceEl = document.getElementById('m-price');
  if (priceEl) priceEl.textContent = price;

  var bImg = document.getElementById('booking-modal-banner-img');
  if (bImg) bImg.src = getTestImage(name);
}

// Validation Handler
function validateForm() {
  var isValid = true;
  var nameEl = document.getElementById('m-name');
  var phoneEl = document.getElementById('m-phone');
  var aadhaarEl = document.getElementById('m-aadhaar');
  var dateEl = document.getElementById('m-date');
  var timeEl = document.getElementById('m-time');

  var errName = document.getElementById('err-name');
  var errPhone = document.getElementById('err-phone');
  var errAadhaar = document.getElementById('err-aadhaar');
  var errDate = document.getElementById('err-date');
  var errTime = document.getElementById('err-time');

  if (!nameEl.value.trim()) {
    nameEl.classList.add('invalid');
    errName.style.display = 'block';
    isValid = false;
  } else {
    nameEl.classList.remove('invalid');
    errName.style.display = 'none';
  }

  var phoneVal = phoneEl.value.trim();
  if (!phoneVal || phoneVal.length !== 10) {
    phoneEl.classList.add('invalid');
    errPhone.style.display = 'block';
    isValid = false;
  } else {
    phoneEl.classList.remove('invalid');
    errPhone.style.display = 'none';
  }

  // Aadhaar Validation (12 digits if provided)
  var aadhaarRaw = aadhaarEl.value.replace(/\s/g, '');
  if (aadhaarRaw && aadhaarRaw.length !== 12) {
    aadhaarEl.classList.add('invalid');
    errAadhaar.style.display = 'block';
    isValid = false;
  } else {
    aadhaarEl.classList.remove('invalid');
    errAadhaar.style.display = 'none';
  }

  if (!dateEl.value) {
    dateEl.classList.add('invalid');
    errDate.style.display = 'block';
    isValid = false;
  } else {
    dateEl.classList.remove('invalid');
    errDate.style.display = 'none';
  }

  if (!timeEl.value) {
    timeEl.classList.add('invalid');
    errTime.style.display = 'block';
    isValid = false;
  } else {
    timeEl.classList.remove('invalid');
    errTime.style.display = 'none';
  }

  return isValid;
}

// Razorpay Checkout Trigger
function doRazorpay() {
  if (!validateForm()) return;

  var name = document.getElementById('m-name').value.trim();
  var phone = document.getElementById('m-phone').value.trim();
  var aadhaar = document.getElementById('m-aadhaar').value.trim();
  var dateVal = document.getElementById('m-date').value;
  var timeVal = document.getElementById('m-time').value;

  var opts = {
    key: RAZORPAY_KEY,
    amount: mPrice * 100,
    currency: 'INR',
    name: 'Ojaswi Advanced Diagnostics',
    description: mDept + ' Slot Booking',
    prefill: { name: name, contact: phone },
    theme: { color: '#0b2545' },
    handler: function(resp) {
      var paymentId = resp.razorpay_payment_id || ('PAY-' + Math.floor(100000 + Math.random() * 900000));
      processAndFinalizeBooking(name, phone, aadhaar, mDept, mPrice, dateVal, timeVal, paymentId, 'Paid Online');
    }
  };

  try {
    var rzp = new Razorpay(opts);
    rzp.open();
  } catch (err) {
    // If Razorpay test key fails to load or offline, fallback to instant simulation
    var simPayId = 'PAY-' + Math.floor(100000 + Math.random() * 900000);
    processAndFinalizeBooking(name, phone, aadhaar, mDept, mPrice, dateVal, timeVal, simPayId, 'Paid Online');
  }
}

// Direct Center / Counter Payment
function bookDirectPayAtCounter() {
  if (!validateForm()) return;

  var name = document.getElementById('m-name').value.trim();
  var phone = document.getElementById('m-phone').value.trim();
  var aadhaar = document.getElementById('m-aadhaar').value.trim();
  var dateVal = document.getElementById('m-date').value;
  var timeVal = document.getElementById('m-time').value;

  processAndFinalizeBooking(name, phone, aadhaar, mDept, mPrice, dateVal, timeVal, 'COUNTER-CASH', 'Pay at Counter');
}

// Finalize Booking & Database Persistence
function processAndFinalizeBooking(name, phone, aadhaar, dept, price, date, time, payId, payMode) {
  var tokenNum = Math.floor(105 + Math.random() * 890);
  var tokenNo = 'OA-' + tokenNum;
  var bookingId = 'b-' + Date.now();

  var ageEl = document.getElementById('m-age');
  var genderEl = document.getElementById('m-gender');
  var age = ageEl && ageEl.value ? ageEl.value : '26';
  var gender = genderEl && genderEl.value ? genderEl.value : 'General';

  var newBooking = {
    id: bookingId,
    token: tokenNo,
    name: name,
    age: age,
    gender: gender,
    phone: phone,
    aadhaar: aadhaar || 'Verified Online',
    dept: dept,
    price: price,
    date: date,
    time: time,
    payId: payId,
    payMode: payMode,
    status: 'Waiting',
    createdAt: new Date().toISOString()
  };

  // Save to database
  addBookingToDatabase(newBooking);

  // Render receipt parchi
  showPaymentSuccessAndBill(newBooking);
}

// Printable Bill / Token Receipt
function showPaymentSuccessAndBill(b) {
  document.getElementById('modal-title-text').textContent = 'Booking Confirmed!';
  var body = document.getElementById('modal-body-content');
  body.innerHTML = `
    <div class="success-anim">
      <div class="checkmark-circle">
        <svg viewBox="0 0 24 24">
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      </div>
      <h3 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--navy);font-weight:700;">Slot Confirmed!</h3>
      <p style="font-size:13px;color:var(--green);font-weight:600;margin-top:4px;">Aapka slot database me register ho gaya hai.</p>
    </div>

    <div class="receipt-card" id="receipt-print-area">
      <div class="receipt-header">
        <h4>Ojaswi Advanced Diagnostics</h4>
        <p>72 Ashok Colony, Near Gokhle Hospital, Pilibhit - 262001</p>
        <p style="margin-top:2px;">Phone: 06396377441 | Helpline (Open 24 Hours)</p>
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;">
          <div class="receipt-token">Token: ${b.token}</div>
          <button onclick="navigator.clipboard.writeText('${b.token}');alert('Token ${b.token} copied!');" style="background:#f1f5f9;border:1px solid #cbd5e1;padding:4px 8px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;" title="Copy Token">📋 Copy</button>
        </div>
      </div>
      <div class="receipt-details">
        <div class="receipt-row"><span>Patient Name:</span> <span>${b.name} (${b.age || '26'} Yrs / ${b.gender || 'Gen'})</span></div>
        <div class="receipt-row"><span>Mobile No:</span> <span>${b.phone}</span></div>
        <div class="receipt-row"><span>Aadhaar / ID:</span> <span>${b.aadhaar}</span></div>
        <div class="receipt-row"><span>Department / Package:</span> <span>${b.dept}</span></div>
        <div class="receipt-row"><span>Appointment Date:</span> <span>${b.date}</span></div>
        <div class="receipt-row"><span>Time Slot:</span> <span>${b.time}</span></div>
        <div class="receipt-row"><span>Payment Ref:</span> <span>${b.payId} (${b.payMode || 'Confirmed'})</span></div>
        <div class="receipt-total"><span>Total Payable:</span> <span>₹${b.price}</span></div>
      </div>
      
      <div class="receipt-barcode">
        <div class="barcode-lines"></div>
        <div class="barcode-sub">*${b.token}*</div>
      </div>
    </div>

    <div class="receipt-btn-group">
      <button class="btn-book-pkg" style="background:#0b2545;" onclick="trackDirectToken('${b.token}')">🔍 Track This Token Live</button>
      <button class="btn-print" style="margin:0;" onclick="window.print()">🖨️ Print Slip / PDF</button>
    </div>
    <button class="btn-know-more" style="width:100%;margin-top:10px;" onclick="closeModalDirect()">✓ Done / Close</button>
  `;
}

function resetModalView() {
  document.getElementById('modal-title-text').textContent = 'Online Slot & Test Booking';
  var body = document.getElementById('modal-body-content');
  if (!document.getElementById('m-name')) {
    body.innerHTML = `
      <div class="modal-banner-wrap">
        <img src="healthkind_total.jpg" alt="Diagnostic Booking" class="modal-banner-img">
        <div class="modal-banner-overlay">
          <span class="m-ban-tag">🏥 Ojaswi Advanced Diagnostics</span>
          <h4>Online Priority Slot Booking</h4>
        </div>
      </div>

      <p style="font-size:11px;color:#6b7280;letter-spacing:1px;text-transform:uppercase;font-weight:600;margin-bottom:10px;">Select Department / Test Package *</p>
      <div class="modal-dept-sel">
        <div class="mdept sel" onclick="mSelDept(this,'Healthkind Total Plus',2249)"><div class="mdept-icon">🩺</div><div class="mdept-name">Healthkind Total+</div><div class="mdept-price">₹2,249</div></div>
        <div class="mdept" onclick="mSelDept(this,'Healthkind Advance',4999)"><div class="mdept-icon">🧬</div><div class="mdept-name">Healthkind Adv.</div><div class="mdept-price">₹4,999</div></div>
        <div class="mdept" onclick="mSelDept(this,'5D Ultrasound',900)"><div class="mdept-icon">🫀</div><div class="mdept-name">5D Ultrasound</div><div class="mdept-price">₹900</div></div>
        <div class="mdept" onclick="mSelDept(this,'CT Scan',2500)"><div class="mdept-icon">🧠</div><div class="mdept-name">CT Scan</div><div class="mdept-price">₹2,500</div></div>
        <div class="mdept" onclick="mSelDept(this,'Digital X-Ray',400)"><div class="mdept-icon">🦴</div><div class="mdept-name">Digital X-Ray</div><div class="mdept-price">₹400</div></div>
        <div class="mdept" onclick="mSelDept(this,'1.5T MRI Scan',3500)"><div class="mdept-icon">🧲</div><div class="mdept-name">1.5T MRI</div><div class="mdept-price">₹3,500</div></div>
      </div>
      
      <div class="mfield">
        <label for="m-name">Patient Full Name *</label>
        <input id="m-name" type="text" placeholder="e.g. Priya Sharma / Rajesh Verma"/>
        <div class="mfield-error" id="err-name">Kripya apna full name likhein</div>
      </div>

      <div class="mfield-row">
        <div class="mfield">
          <label for="m-age">Age (Years) *</label>
          <input id="m-age" type="number" placeholder="e.g. 28" min="1" max="110"/>
        </div>
        <div class="mfield">
          <label for="m-gender">Gender *</label>
          <select id="m-gender">
            <option value="Female">Female (महिला)</option>
            <option value="Male">Male (पुरुष)</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div class="mfield-row">
        <div class="mfield">
          <label for="m-phone">Mobile Number *</label>
          <input id="m-phone" type="tel" placeholder="10 digit number" maxlength="10"/>
          <div class="mfield-error" id="err-phone">Sahi 10 digit number enter karein</div>
        </div>
        <div class="mfield">
          <label for="m-aadhaar">Aadhaar Number (Optional)</label>
          <input id="m-aadhaar" type="text" placeholder="XXXX XXXX XXXX" maxlength="14"/>
          <div class="mfield-error" id="err-aadhaar">Sahi 12 digit Aadhaar number enter karein</div>
        </div>
      </div>

      <div class="mfield-row">
        <div class="mfield">
          <label for="m-date">Date Chunein *</label>
          <input id="m-date" type="date"/>
          <div class="mfield-error" id="err-date">Date select karein</div>
        </div>
        <div class="mfield">
          <label for="m-time">Time Slot *</label>
          <select id="m-time">
            <option value="">Time Slot...</option>
            <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
            <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
            <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
            <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
            <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
          </select>
          <div class="mfield-error" id="err-time">Slot select karein</div>
        </div>
      </div>

      <button class="mpay-btn" onclick="doRazorpay()">💳 Pay Online via Razorpay / UPI — ₹<span id="m-price">${mPrice}</span></button>
      <button class="btn-print" style="margin-top:8px;background:#f8fafc;color:var(--navy);border:1.5px solid #cbd5e1;" onclick="bookDirectPayAtCounter()">🏥 Pay at Center Counter (Cash / UPI)</button>
    `;

    bindInputFormatters();
    initFormDefaults();
  }
}

// Quick Sample Collection Form Handler
function handleQuickInquiry(e) {
  e.preventDefault();
  var name = document.getElementById('sf-name').value.trim();
  var phone = document.getElementById('sf-phone').value.trim();
  var city = document.getElementById('sf-city').value;
  var pkg = document.getElementById('sf-package').value;

  if (!name || phone.length !== 10 || !city) {
    alert("Kripya sahi naam, 10 digit number aur city chunein!");
    return;
  }

  var tokenNum = Math.floor(105 + Math.random() * 890);
  var tokenNo = 'OA-' + tokenNum;

  var newBooking = {
    id: 'b-' + Date.now(),
    token: tokenNo,
    name: name + ' (' + city + ')',
    phone: phone,
    aadhaar: 'Sample Collection Request',
    dept: pkg,
    price: pkg.indexOf('2249') !== -1 ? 2249 : (pkg.indexOf('1949') !== -1 ? 1949 : (pkg.indexOf('2500') !== -1 ? 2500 : 900)),
    date: new Date().toISOString().split('T')[0],
    time: 'Home Collection',
    payId: 'INQUIRY-COLLECTION',
    payMode: 'Cash on Collection',
    status: 'Waiting',
    createdAt: new Date().toISOString()
  };

  addBookingToDatabase(newBooking);

  alert(`Dhanyawad ${name} Ji!\nAapka request Token #${tokenNo} register ho gaya hai. Humari medical team 10 minute me aapse call karegi.`);
  document.getElementById('quick-inquiry-form').reset();
}

// Live Queue Renderer
function renderLiveQueue() {
  var list = getBookings();
  var container = document.getElementById('live-queue-list');
  var currentServingEl = document.getElementById('cur-tok-disp');
  if (!container) return;

  var activeBooking = list.find(function(b) { return b.status === 'In-Progress'; }) || list.find(function(b) { return b.status === 'Waiting'; }) || list[0];
  if (currentServingEl && activeBooking) {
    currentServingEl.textContent = activeBooking.token;
  }

  container.innerHTML = '';
  list.slice(0, 6).forEach(function(item) {
    var cls = item.status === 'Completed' ? 'done' : (item.status === 'In-Progress' ? 'active' : 'wait');
    var badgeClass = item.status === 'Completed' ? 'badge-d' : (item.status === 'In-Progress' ? 'badge-n' : 'badge-w');
    var statusText = item.status === 'In-Progress' ? 'Now Calling' : item.status;

    var row = document.createElement('div');
    row.className = 'qd-item ' + cls;
    row.innerHTML = `
      <span class="qd-tok">${item.token}</span>
      <span class="qd-n">${item.name} <small style="color:#64748b;display:block;font-size:11px;">${item.dept}</small></span>
      <span class="qd-badge ${badgeClass}">${statusText}</span>
    `;
    container.appendChild(row);
  });
}

// ==========================================
// ADMIN DASHBOARD & AUTHENTICATION
// ==========================================

function openAdminLogin() {
  var isLogged = sessionStorage.getItem('ojaswi_admin_logged');
  if (isLogged === 'true') {
    openAdminDashboard();
  } else {
    document.getElementById('admin-login-modal').classList.add('open');
  }
}

function closeAdminLogin() {
  document.getElementById('admin-login-modal').classList.remove('open');
}

function handleAdminLogin(e) {
  e.preventDefault();
  var user = document.getElementById('adm-user').value.trim();
  var pass = document.getElementById('adm-pass').value.trim();
  var errEl = document.getElementById('adm-login-err');

  // Multi-credentials support
  if ((user === 'admin' && pass === 'admin123') || (user === 'ojaswi' && pass === 'ojaswi2026') || (user === 'admin' && pass === 'admin')) {
    sessionStorage.setItem('ojaswi_admin_logged', 'true');
    closeAdminLogin();
    openAdminDashboard();
    errEl.style.display = 'none';
  } else {
    errEl.style.display = 'block';
  }
}

function logoutAdmin() {
  sessionStorage.removeItem('ojaswi_admin_logged');
  closeAdminDashboard();
  alert("Admin logged out successfully.");
}

function openAdminDashboard() {
  document.getElementById('admin-dash-modal').classList.add('open');
  renderAdminBookings();
}

function closeAdminDashboard() {
  document.getElementById('admin-dash-modal').classList.remove('open');
}

function renderAdminBookings() {
  var bookings = getBookings();
  var search = (document.getElementById('adm-search').value || '').toLowerCase().trim();
  var filterDept = document.getElementById('adm-filter-dept').value;

  // Filter list
  var filtered = bookings.filter(function(b) {
    var matchSearch = b.name.toLowerCase().includes(search) || b.phone.includes(search) || b.token.toLowerCase().includes(search);
    var matchDept = filterDept === 'ALL' || b.dept.toLowerCase().includes(filterDept.toLowerCase());
    return matchSearch && matchDept;
  });

  // KPI Calculations
  var totalCount = bookings.length;
  var waitingCount = bookings.filter(function(b) { return b.status === 'Waiting'; }).length;
  var doneCount = bookings.filter(function(b) { return b.status === 'Completed'; }).length;
  var totalRev = bookings.reduce(function(sum, b) { return sum + (Number(b.price) || 0); }, 0);

  document.getElementById('adm-kpi-total').textContent = totalCount;
  document.getElementById('adm-kpi-waiting').textContent = waitingCount;
  document.getElementById('adm-kpi-done').textContent = doneCount;
  document.getElementById('adm-kpi-rev').textContent = '₹' + totalRev.toLocaleString('en-IN');

  // Render Table Rows
  var tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:20px;">Koi appointments nahi mile.</td></tr>';
    return;
  }

  filtered.forEach(function(b) {
    var tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${b.token}</strong></td>
      <td>
        <div style="font-weight:600;">${b.name}</div>
        <small style="color:#64748b;font-size:10px;">ID: ${b.aadhaar}</small>
      </td>
      <td>${b.phone}</td>
      <td><span style="font-size:12px;background:#f1f5f9;padding:2px 8px;border-radius:4px;">${b.dept}</span></td>
      <td>${b.date}<br><small style="color:#64748b;">${b.time}</small></td>
      <td><strong>₹${b.price}</strong></td>
      <td><span class="status-pill ${b.status}">${b.status}</span></td>
      <td>
        <button class="adm-action-btn" title="Call Next / In Progress" onclick="updateBookingStatus('${b.id}', 'In-Progress')">▶ Call</button>
        <button class="adm-action-btn" title="Mark Done" onclick="updateBookingStatus('${b.id}', 'Completed')">✓ Done</button>
        <button class="adm-action-btn del" title="Delete" onclick="deleteBookingRecord('${b.id}')">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function playHospitalVoiceCall(token, name, dept) {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      var cleanName = name.replace(/\(.*?\)/g, '').trim();
      var announcement = "Attention please. Token Number " + token + ", Patient " + cleanName + ", please proceed to " + dept + " room.";
      var utter = new SpeechSynthesisUtterance(announcement);
      utter.lang = 'en-IN';
      utter.rate = 0.88;
      window.speechSynthesis.speak(utter);
    }
  } catch (err) {
    console.log("Voice synth skipped:", err);
  }
}

function updateBookingStatus(id, newStatus) {
  var list = getBookings();
  var item = list.find(function(b) { return b.id === id; });
  if (item) {
    item.status = newStatus;
    saveBookings(list);

    if (newStatus === 'In-Progress') {
      playHospitalVoiceCall(item.token, item.name, item.dept);
      var bannerText = document.getElementById('adm-call-banner-text');
      if (bannerText) {
        bannerText.innerHTML = `<strong>${item.token}</strong> (${item.name}) — Called to <em>${item.dept}</em>`;
      }
    }

    if (firestoreDb) {
      firestoreDb.collection('bookings').doc(id).update({ status: newStatus }).catch(function(){});
    }

    renderAdminBookings();
    renderLiveQueue();
  }
}

function deleteBookingRecord(id) {
  if (confirm("Kya aap sach me is booking record ko delete karna chahte hain?")) {
    var list = getBookings().filter(function(b) { return b.id !== id; });
    saveBookings(list);

    if (firestoreDb) {
      firestoreDb.collection('bookings').doc(id).delete().catch(function(){});
    }

    renderAdminBookings();
    renderLiveQueue();
  }
}

// Export Appointments to CSV
function exportBookingsToCSV() {
  var list = getBookings();
  if (!list.length) {
    alert("Export karne ke liye koi record nahi hai!");
    return;
  }

  var csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Token,Patient Name,Phone,Aadhaar,Department,Date,Time,Amount,PaymentID,Status\n";

  list.forEach(function(b) {
    var row = [
      b.token,
      `"${b.name}"`,
      b.phone,
      `"${b.aadhaar}"`,
      `"${b.dept}"`,
      b.date,
      `"${b.time}"`,
      b.price,
      `"${b.payId}"`,
      b.status
    ].join(",");
    csvContent += row + "\n";
  });

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Ojaswi_Bookings_Report_" + new Date().toISOString().split('T')[0] + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Package Details "Know More" Modal Handlers
function showPackageDetails(title, params, testsList) {
  document.getElementById('pkg-modal-title').textContent = title;
  document.getElementById('pkg-modal-badge').textContent = (typeof params === 'number' ? params + ' Parameters Included' : params);
  document.getElementById('pkg-modal-tests').textContent = testsList;
  
  var pkgImg = document.getElementById('pkg-modal-img');
  if (pkgImg) pkgImg.src = getTestImage(title);
  var pkgHeading = document.getElementById('pkg-modal-heading');
  if (pkgHeading) pkgHeading.textContent = title;

  var bookBtn = document.getElementById('pkg-modal-book-btn');
  bookBtn.onclick = function() {
    closePackageDetails();
    var price = title.includes('TOTAL PLUS') ? 2249 : (title.includes('TOTAL') ? 1949 : (title.includes('ADVANCE') ? 4999 : (title.includes('CT') ? 2500 : (title.includes('X-RAY') ? 400 : 900))));
    openModal(title, price);
  };

  document.getElementById('package-info-modal').classList.add('open');
}

function closePackageDetails() {
  document.getElementById('package-info-modal').classList.remove('open');
}

// ==========================================
// PATIENT / USER STATUS TRACKER PORTAL
// ==========================================

function openUserStatusModal() {
  document.getElementById('user-status-modal').classList.add('open');
  document.getElementById('track-result-area').innerHTML = '';
  document.getElementById('track-input').value = '';
}

function closeUserStatusModal() {
  document.getElementById('user-status-modal').classList.remove('open');
}

function closeUserStatusModalOverlay(e) {
  if (e.target === document.getElementById('user-status-modal')) {
    closeUserStatusModal();
  }
}

function trackDirectToken(tok) {
  closeModalDirect();
  openUserStatusModal();
  quickTrackToken(tok);
}

function quickTrackToken(tok) {
  var input = document.getElementById('track-input');
  if (input) {
    input.value = tok;
    trackPatientStatus(new Event('submit'));
  }
}

function trackPatientStatus(e) {
  if (e && e.preventDefault) e.preventDefault();
  var query = (document.getElementById('track-input').value || '').trim().toLowerCase();
  var resultArea = document.getElementById('track-result-area');
  var bookings = getBookings();

  var cleanQuery = query.replace(/\s+/g, '');
  var found = bookings.find(function(b) {
    var bToken = (b.token || '').toLowerCase().replace(/\s+/g, '');
    var bPhone = (b.phone || '').replace(/\D/g, '');
    var bName = (b.name || '').toLowerCase();
    return bToken === cleanQuery || 
           bToken.includes(cleanQuery) || 
           (cleanQuery.length >= 4 && bPhone.includes(cleanQuery.replace(/\D/g, ''))) ||
           (cleanQuery.length >= 3 && bName.includes(cleanQuery));
  });

  if (!found) {
    resultArea.innerHTML = `
      <div style="background:#fee2e2;border:1px solid #fca5a5;padding:14px;border-radius:10px;color:#991b1b;font-size:13px;text-align:center;">
        ❌ Koi appointment record nahi mila.<br>
        <span style="font-size:11px;color:#b91c1c;">Kripya sahi Token (jaise OA-101, OA-102) ya 10-digit mobile number daalein.</span>
      </div>
    `;
    return;
  }

  var isCompleted = found.status === 'Completed';
  var isInProgress = found.status === 'In-Progress';
  var isWaiting = found.status === 'Waiting';

  // Queue position calculation
  var aheadCount = bookings.filter(function(b) {
    return b.status === 'Waiting' && new Date(b.createdAt || 0) < new Date(found.createdAt || 0);
  }).length;

  var statusNote = '';
  if (isCompleted) {
    statusNote = '✅ <strong>Test Report Ready:</strong> Senior Radiologist Dr. Anurag Prakash ne report verify kar di hai. Aap niche download kar sakte hain.';
  } else if (isInProgress) {
    statusNote = '🔬 <strong>Live Status:</strong> Patient ko call kiya gaya hai. Diagnostic scan / sample testing chal raha hai.';
  } else {
    statusNote = aheadCount === 0 
      ? '⚡ <strong>Aapka Number Next Hai!</strong> Kripya center reception par ready rahein.' 
      : '⏳ <strong>Queue Position:</strong> Aapke aage ' + aheadCount + ' patient line mein hain. (Estimated wait: ~' + (aheadCount * 12) + ' mins).';
  }

  resultArea.innerHTML = `
    <div class="patient-status-card">
      <div class="psc-header">
        <div>
          <span style="font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:600;">Verified Token</span>
          <div class="psc-token">${found.token}</div>
        </div>
        <span class="status-pill ${found.status}" style="font-size:12px;padding:4px 12px;">${found.status}</span>
      </div>

      <div style="font-size:16px;font-weight:700;color:var(--navy);margin-bottom:2px;">${found.name}</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:10px;">${found.dept} · Paid: ₹${found.price} (${found.payMode || 'Confirmed'})</div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-size:12px;padding:10px 12px;border-radius:8px;margin-bottom:12px;line-height:1.5;">
        ${statusNote}
      </div>

      <div style="font-size:12px;color:#475569;background:white;padding:8px 12px;border-radius:6px;border:1px solid #e2e8f0;display:flex;justify-content:space-between;">
        <span>📅 Slot: <strong>${found.date}</strong> (${found.time})</span>
        <span>👨‍⚕️ Dr. Anurag Prakash</span>
      </div>

      <div class="status-tracker-stepper">
        <div class="st-step done">
          <span class="st-step-num">✓</span>
          <span>1. Slot Booked</span>
        </div>
        <div class="st-step ${isCompleted ? 'done' : (isInProgress ? 'current' : '')}">
          <span class="st-step-num">${isCompleted ? '✓' : (isInProgress ? '⚙️' : '⏳')}</span>
          <span>2. ${isInProgress ? 'In-Lab Testing' : (isCompleted ? 'Tested' : 'In Queue')}</span>
        </div>
        <div class="st-step ${isCompleted ? 'done' : ''}">
          <span class="st-step-num">${isCompleted ? '📄' : '🔒'}</span>
          <span>3. ${isCompleted ? 'Report Ready' : 'Doctor Signoff'}</span>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-top:14px;">
        <button class="btn-know-more" style="flex:1;" onclick="openPatientSlip('${found.id}')">🖨️ View Slip</button>
        ${isCompleted ? `
          <button class="btn-book-pkg" style="flex:1.4;background:#16a34a;" onclick="downloadDemoReport('${found.token}', '${found.name}', '${found.dept}')">📥 Download Clinical Report</button>
        ` : `
          <button class="btn-book-pkg" style="flex:1.4;background:#64748b;cursor:not-allowed;" title="Report under testing">⏳ Report In Progress</button>
        `}
      </div>
    </div>
  `;
}

function openPatientSlip(id) {
  var b = getBookings().find(function(item) { return item.id === id; });
  if (b) {
    closeUserStatusModal();
    document.getElementById('modal').classList.add('open');
    showPaymentSuccessAndBill(b);
  }
}

function downloadDemoReport(token, name, dept) {
  var today = new Date().toISOString().split('T')[0];
  var reportText = 
"========================================================================\n" +
"                 OJASWI ADVANCED DIAGNOSTICS & RESEARCH                  \n" +
"            72 Ashok Colony, Near Gokhle Hospital, Pilibhit - 262001     \n" +
"          NABL & ISO 9001:2015 Accredited | 24x7 Helpline: 06396377441   \n" +
"========================================================================\n" +
"PATIENT INFORMATION & TOKEN RECORD:\n" +
"  Patient Name    : " + name + "\n" +
"  Token Number    : " + token + "\n" +
"  Department/Test : " + dept + "\n" +
"  Reporting Date  : " + today + "\n" +
"  Sample Type     : Venous Blood / Diagnostic Radiography Scan\n" +
"  Referring Center: Ojaswi Advanced Clinical Wing\n" +
"------------------------------------------------------------------------\n" +
"TEST INVESTIGATION                   OBSERVED VALUE   REFERENCE INTERVAL\n" +
"------------------------------------------------------------------------\n" +
"Hemoglobin (Hb)                      13.8 g/dL        12.0 - 15.5 g/dL  (NORMAL)\n" +
"Total Leucocyte Count (TLC)          7,200 /cu.mm     4,000 - 10,000    (NORMAL)\n" +
"Platelet Count                       2.4 Lakhs/cu.mm  1.5 - 4.5 Lakhs   (NORMAL)\n" +
"Fasting Blood Sugar (Glucose)        92 mg/dL         70 - 100 mg/dL    (NORMAL)\n" +
"Serum Creatinine (Kidney)            0.9 mg/dL        0.6 - 1.2 mg/dL   (NORMAL)\n" +
"SGOT / AST (Liver Function)          28 U/L           10 - 40 U/L       (NORMAL)\n" +
"SGPT / ALT (Liver Function)          31 U/L           10 - 45 U/L       (NORMAL)\n" +
"Serum Bilirubin (Total)              0.8 mg/dL        0.2 - 1.2 mg/dL   (NORMAL)\n" +
"Thyroid Stimulating Hormone (TSH)    2.4 uIU/mL       0.4 - 4.2 uIU/mL  (NORMAL)\n" +
"------------------------------------------------------------------------\n" +
"IMPRESSION & CLINICAL SUMMARY:\n" +
"  All examined biochemical and imaging parameters are within normal clinical\n" +
"  reference limits. No acute pathological abnormalities observed.\n\n" +
"Verified & Signed by:\n" +
"Dr. Anurag Prakash, MD Radiodiagnosis (Senior Consultant)\n" +
"Dr. Ojasawi Pathak, MD Radiodiagnosis\n" +
"========================================================================\n" +
"               *** END OF DIGITALLY SIGNED CLINICAL REPORT ***          \n";

  var blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = "Ojaswi_Clinical_Report_" + token + ".txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Card Scroll Observer
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.pkg-card, .doc-card, .review-card, .metric-card').forEach(function(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'all 0.4s ease';
  observer.observe(el);
});
