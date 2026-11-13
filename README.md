# Ojaswi Advanced Diagnostics & Imaging — Healthcare Web Portal

A modern, responsive, and full-featured diagnostic center web application built for **Ojaswi Advanced Diagnostics**, Pilibhit, Uttar Pradesh.

## 🚀 Key Features

- **Online Appointment & Slot Booking**: Instant scheduling for Pathology tests, 5D Ultrasound, 64-Slice CT Scan, and Digital X-Ray with age, gender, and date/slot selection.
- **Dual Payment Integration**:
  - Secure Online Payment via **Razorpay / UPI / NetBanking / Cards**
  - Offline Cash / Counter Pay at diagnostic center
- **Real-Time Patient Tracker Portal**: Patients can enter their Token Number to track live status (`Under Processing`, `Sample Collected`, `Completed & Ready`).
- **Clinical Certified Receipt & Report Download**: Dynamic printable/downloadable certified diagnostic parchi with automated QR Code and clinical verification stamp.
- **Admin Control Center**:
  - Protected admin dashboard (`/admin`)
  - Live appointments queue with status update controls
  - Interactive SpeechSynthesis live audio calling announcements
  - Instant One-Click Export to Excel / CSV
- **Live Cloud Database**: Integrated with **Google Cloud Firebase Firestore** for real-time document persistence.
- **Vercel Ready**: Configured with `vercel.json` for one-click static deployment.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Modern Flexbox/Grid, Glassmorphism), Vanilla JavaScript (ES6+)
- **Cloud Database**: Google Cloud Firebase Firestore REST API
- **Payment Gateway**: Razorpay Checkout SDK
- **Speech Synthesis**: Web Speech API for token audio announcements
- **Deployment**: Vercel

## 📂 Project Structure

```text
├── index.html            # Main web application entry point
├── style.css             # Complete custom styling and responsiveness
├── script.js             # Core business logic, Firebase sync, and Admin portal
├── vercel.json           # Vercel deployment configuration
├── ojaswi_center.jpg     # Hero architectural center reception visual
├── ojaswi_doctors.jpg    # Senior medical specialists visual
├── healthkind_total.jpg  # Total package consultation visual
├── pathology_lab.jpg     # Pathology lab imaging
├── healthkind_advance.jpg# Advanced health checkup visual
├── ultrasound_5d.jpg     # 5D Ultrasound imaging
├── ct_scan_64.jpg        # 64-Slice CT scan imaging
└── digital_xray.jpg      # Digital HD X-Ray imaging
```

## 👨‍💻 Author

- **Veermonee** ([@veermonee](https://github.com/veermonee))
