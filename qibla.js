// ========================================
// بوصلة القبلة 🧭
// ========================================

let userLatitude = 60.343;
let userLongitude = 16.514;

let qiblaDirection = 0;
let currentHeading = null;

const arrow = document.getElementById("qiblaArrow");
const degree = document.getElementById("degree");
const status = document.getElementById("status");
const distance =
  document.getElementById("distance");
  const turnDirection =
    document.getElementById("turnDirection");
const locationText = document.getElementById("locationText");
const startButton = document.getElementById("startCompass");
const backButton = document.getElementById("backButton");
const backHome = document.getElementById("backHome");

// ========================================
// حساب اتجاه القبلة
// ========================================

function calculateQibla(latitude, longitude) {

  const kaabaLatitude = 21.4225;
  const kaabaLongitude = 39.8262;

  const lat1 = latitude * Math.PI / 180;
  const lon1 = longitude * Math.PI / 180;

  const lat2 = kaabaLatitude * Math.PI / 180;
  const lon2 = kaabaLongitude * Math.PI / 180;

  const deltaLongitude = lon2 - lon1;

  const y =
    Math.sin(deltaLongitude) *
    Math.cos(lat2);

  const x =
    Math.cos(lat1) *
      Math.sin(lat2) -
    Math.sin(lat1) *
      Math.cos(lat2) *
      Math.cos(deltaLongitude);

  let bearing =
    Math.atan2(y, x) *
    180 /
    Math.PI;

  return (bearing + 360) % 360;
}
// ========================================
// حساب المسافة إلى مكة 📏
// ========================================

function calculateDistanceToMakkah() {

  const kaabaLatitude =
    21.4225;

  const kaabaLongitude =
    39.8262;

  const earthRadius =
    6371;

  const lat1 =
    userLatitude *
    Math.PI /
    180;

  const lon1 =
    userLongitude *
    Math.PI /
    180;

  const lat2 =
    kaabaLatitude *
    Math.PI /
    180;

  const lon2 =
    kaabaLongitude *
    Math.PI /
    180;

  const deltaLat =
    lat2 - lat1;

  const deltaLon =
    lon2 - lon1;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
    Math.cos(lat2) *
    Math.sin(deltaLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  const kilometers =
    earthRadius * c;

  if (distance) {

    distance.textContent =
      "📏 المسافة إلى مكة: " +
      Math.round(kilometers) +
      " كم";
  }
}

// ========================================
// الحصول على الموقع
// ========================================

function getLocation() {

  if (!navigator.geolocation) {

    locationText.textContent =
      "📍 Krylbo, Sweden";

    qiblaDirection =
      calculateQibla(
        userLatitude,
        userLongitude
      );

    showQiblaDirection();

    return;
  }

  navigator.geolocation.getCurrentPosition(

    function(position) {

      userLatitude =
        position.coords.latitude;

      userLongitude =
        position.coords.longitude;

      locationText.textContent =
        "📍 تم تحديد موقعك";

      qiblaDirection =
        calculateQibla(
          userLatitude,
          userLongitude
        );

      showQiblaDirection();
    },

    function() {

      locationText.textContent =
        "📍 Krylbo, Sweden";

      qiblaDirection =
        calculateQibla(
          userLatitude,
          userLongitude
        );

      showQiblaDirection();
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

// ========================================
// عرض اتجاه القبلة
// ========================================

function showQiblaDirection() {

  degree.textContent =
    Math.round(qiblaDirection) + "°";

    calculateDistanceToMakkah();

  status.textContent =
    "اتجاه القبلة محسوب من موقعك";

  updateArrow();
}

// ========================================
// تطبيع الزوايا
// ========================================

function normalizeAngle(angle) {

  return (
    (angle + 360) % 360
  );
}

// ========================================
// أقصر فرق بين زاويتين
// ========================================

function angleDifference(
  target,
  current
) {

  return (
    (target - current + 540) % 360
    - 180
  );
}

// ========================================
// تحديث السهم
// ========================================

function updateArrow() {

  if (!arrow) {
    return;
  }

  if (currentHeading === null) {

    arrow.style.transform =
      "rotate(" +
      qiblaDirection +
      "deg)";

    return;
  }

  const difference =
    angleDifference(
      qiblaDirection,
      currentHeading
    );

  arrow.style.transform =
    "rotate(" +
    difference +
    "deg)";
}

// ========================================
// قراءة بوصلة الهاتف
// ========================================

function handleOrientation(event) {

  let heading = null;

  // iPhone / بعض الأجهزة
  if (
    typeof event.webkitCompassHeading ===
    "number"
  ) {

    heading =
      event.webkitCompassHeading;
  }

  // Android مع absolute
  else if (
    event.absolute === true &&
    typeof event.alpha === "number"
  ) {

    heading =
      360 - event.alpha;
  }

  // Android fallback
  else if (
    typeof event.alpha === "number"
  ) {

    heading =
      360 - event.alpha;
  }

  if (
    heading === null ||
    Number.isNaN(heading)
  ) {
    return;
  }

  heading =
    normalizeAngle(heading);

  currentHeading =
    heading;

  updateArrow();

updateTurnDirection();

  status.textContent =
    "🧭 البوصلة تعمل — حرّك الهاتف ببطء";
}
// ========================================
// معرفة الاتجاه المتبقي للقبلة 🎯
// ========================================

function updateTurnDirection() {

  if (
    currentHeading === null ||
    !turnDirection
  ) {
    return;
  }

  const difference =
    angleDifference(
      qiblaDirection,
      currentHeading
    );

  const rounded =
    Math.round(
      Math.abs(difference)
    );

  if (rounded <= 3) {

    turnDirection.textContent =
      "🕋 أنت باتجاه القبلة تمامًا!";

    turnDirection.classList.add(
      "correct"
    );

    if (
      navigator.vibrate &&
      !window.qiblaVibrated
    ) {

      navigator.vibrate(200);

      window.qiblaVibrated =
        true;
    }

    return;
  }

  window.qiblaVibrated =
    false;

  turnDirection.classList.remove(
    "correct"
  );

  if (difference > 0) {

    turnDirection.textContent =
      "↪️ لف يمين " +
      rounded +
      "°";

  } else {

    turnDirection.textContent =
      "↩️ لف يسار " +
      rounded +
      "°";
  }
}

// ========================================
// تشغيل البوصلة
// ========================================

async function startCompass() {

  try {

    // طلب إذن الحساس إذا كان الجهاز يحتاجه
    if (
      typeof DeviceOrientationEvent !==
        "undefined" &&
      typeof DeviceOrientationEvent
        .requestPermission ===
        "function"
    ) {

      const permission =
        await DeviceOrientationEvent
          .requestPermission();

      if (
        permission !==
        "granted"
      ) {

        status.textContent =
          "⚠️ يجب السماح باستخدام البوصلة";

        return;
      }
    }

    currentHeading = null;

    // إزالة أي مستمع قديم
    window.removeEventListener(
      "deviceorientationabsolute",
      handleOrientation,
      true
    );

    window.removeEventListener(
      "deviceorientation",
      handleOrientation,
      true
    );

    // المستشعر الأساسي
    window.addEventListener(
      "deviceorientationabsolute",
      handleOrientation,
      true
    );

    // مستشعر احتياطي
    window.addEventListener(
      "deviceorientation",
      handleOrientation,
      true
    );

    startButton.textContent =
      "🧭 البوصلة تعمل";

    status.textContent =
      "🧭 حرّك الهاتف ببطء حتى يستقر السهم";

  } catch (error) {

    console.error(
      "Compass error:",
      error
    );

    status.textContent =
      "⚠️ تعذر تشغيل بوصلة الهاتف";
  }
}

// ========================================
// الأزرار
// ========================================

startButton.addEventListener(
  "click",
  startCompass
);

backButton.addEventListener(
  "click",
  function() {

    window.location.href =
      "./index.html";
  }
);

backHome.addEventListener(
  "click",
  function() {

    window.location.href =
      "./index.html";
  }
);

// ========================================
// بدء الصفحة
// ========================================

getLocation();
// ========================================
// تطوير شكل البوصلة 🧭✨
// ========================================

(function enhanceCompass() {

  const compass =
    document.getElementById("compass");

  if (!compass) {
    return;
  }

  if (
    document.getElementById("compassDegrees")
  ) {
    return;
  }

  const degreeRing =
    document.createElement("div");

  degreeRing.id =
    "compassDegrees";

  degreeRing.style.position =
    "absolute";

  degreeRing.style.inset =
    "0";

  degreeRing.style.borderRadius =
    "50%";

  degreeRing.style.pointerEvents =
    "none";

  degreeRing.style.zIndex =
    "4";

  compass.appendChild(
    degreeRing
  );

  const radius =
    compass.clientWidth / 2;

  // العلامات
  for (
    let angle = 0;
    angle < 360;
    angle += 10
  ) {

    const tick =
      document.createElement("div");

    const isMajor =
      angle % 30 === 0;

    tick.style.position =
      "absolute";

    tick.style.width =
      isMajor ? "3px" : "1px";

    tick.style.height =
      isMajor ? "13px" : "7px";

    tick.style.background =
      "rgba(255,255,255,0.65)";

    tick.style.borderRadius =
      "5px";

    tick.style.left =
      "50%";

    tick.style.top =
      "50%";

    const distance =
      radius - 18;

    const radians =
      angle *
      Math.PI /
      180;

    const x =
      Math.sin(radians) *
      distance;

    const y =
      -Math.cos(radians) *
      distance;

    tick.style.transform =
      "translate(" +
      (x - 1.5) +
      "px, " +
      (y - (isMajor ? 6.5 : 3.5)) +
      "px)";

    degreeRing.appendChild(
      tick
    );
  }

  // أرقام الدرجات
  for (
    let angle = 0;
    angle < 360;
    angle += 30
  ) {

    const label =
      document.createElement("div");

    label.textContent =
      angle + "°";

    label.style.position =
      "absolute";

    label.style.left =
      "50%";

    label.style.top =
      "50%";

    label.style.color =
      "rgba(255,255,255,0.65)";

    label.style.fontSize =
      "10px";

    label.style.fontWeight =
      "bold";

    label.style.width =
      "35px";

    label.style.height =
      "20px";

    label.style.textAlign =
      "center";

    label.style.lineHeight =
      "20px";

    const distance =
      radius - 38;

    const radians =
      angle *
      Math.PI /
      180;

    const x =
      Math.sin(radians) *
      distance;

    const y =
      -Math.cos(radians) *
      distance;

    label.style.transform =
      "translate(" +
      (x - 17.5) +
      "px, " +
      (y - 10) +
      "px)";

    degreeRing.appendChild(
      label
    );
  }

})();