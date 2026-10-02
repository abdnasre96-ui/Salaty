// ========================================
// صلاتي 🕌
// ========================================

let prayerTimes = [];

let notificationTimers = [];
let scheduledNotificationDate = "";
let userLatitude = 60.343;
let userLongitude = 16.514;

// ========================================
// التاريخ
// ========================================

function updateDates() {
  const now = new Date();

  const gregorian = new Intl.DateTimeFormat("ar-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(now);

  const gregorianElement =
    document.getElementById("gregorianDate");

  if (gregorianElement) {
    gregorianElement.textContent = gregorian;
  }

  const hijriElement =
    document.getElementById("hijriDate");

  if (hijriElement) {
    try {
      const hijri = new Intl.DateTimeFormat(
        "ar-SA-u-ca-islamic",
        {
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      ).format(now);

      hijriElement.textContent = hijri;
    } catch {
      hijriElement.textContent = "التاريخ الهجري";
    }
  }
}

// ========================================
// الموقع
// ========================================

function getLocation() {
  const locationElement =
    document.getElementById("location");

  if (!navigator.geolocation) {
    if (locationElement) {
      locationElement.textContent =
        "📍 Krylbo, Sweden";
    }

    loadPrayerTimes();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {

      userLatitude =
        position.coords.latitude;

      userLongitude =
        position.coords.longitude;

      if (locationElement) {
        locationElement.textContent =
          "📍 موقعك الحالي";
      }

      loadPrayerTimes();
    },

    function () {

      userLatitude = 60.343;
      userLongitude = 16.514;

      if (locationElement) {
        locationElement.textContent =
          "📍 Krylbo, Sweden";
      }

      loadPrayerTimes();
    }
  );
}

// ========================================
// تنظيف الوقت
// ========================================

function cleanTime(time) {
  if (!time) {
    return "--:--";
  }

  return time.split(" ")[0];
}

// ========================================
// تحميل أوقات الصلاة
// ========================================

async function loadPrayerTimes() {

  try {

    const now = new Date();

    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const url =
      "https://api.aladhan.com/v1/timings/" +
      day +
      "-" +
      month +
      "-" +
      year +
      "?latitude=" +
      userLatitude +
      "&longitude=" +
      userLongitude +
      "&method=3";

    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        "API connection failed"
      );
    }

    const result =
      await response.json();

    if (
      !result ||
      result.code !== 200 ||
      !result.data ||
      !result.data.timings
    ) {
      throw new Error(
        "Invalid prayer data"
      );
    }

    const timings =
      result.data.timings;

    const fajr =
      cleanTime(timings.Fajr);

    const sunrise =
      cleanTime(timings.Sunrise);

    const dhuhr =
      cleanTime(timings.Dhuhr);

    const asr =
      cleanTime(timings.Asr);

    const maghrib =
      cleanTime(timings.Maghrib);

    const isha =
      cleanTime(timings.Isha);

    document.getElementById("fajr").textContent =
      fajr;

    document.getElementById("sunrise").textContent =
      sunrise;

    document.getElementById("dhuhr").textContent =
      dhuhr;

    document.getElementById("asr").textContent =
      asr;

    document.getElementById("maghrib").textContent =
      maghrib;

    document.getElementById("isha").textContent =
      isha;

    prayerTimes = [
      {
        name: "الفجر",
        time: fajr,
        id: "prayer-fajr"
      },
      {
        name: "الظهر",
        time: dhuhr,
        id: "prayer-dhuhr"
      },
      {
        name: "العصر",
        time: asr,
        id: "prayer-asr"
      },
      {
        name: "المغرب",
        time: maghrib,
        id: "prayer-maghrib"
      },
      {
        name: "العشاء",
        time: isha,
        id: "prayer-isha"
      }
    ];

    updateNextPrayer();
    schedulePrayerNotifications();

  } catch (error) {

    console.error(
      "Prayer times error:",
      error
    );

    const locationElement =
      document.getElementById("location");

    if (locationElement) {
      locationElement.textContent =
        "⚠️ تعذر تحميل أوقات الصلاة";
    }
  }
}

// ========================================
// الصلاة القادمة
// ========================================

function updateNextPrayer() {

  if (prayerTimes.length === 0) {
    return;
  }

  const now = new Date();

  document
    .querySelectorAll(".prayer")
    .forEach(function (element) {
      element.classList.remove("active");
    });

  for (
    let i = 0;
    i < prayerTimes.length;
    i++
  ) {

    const prayer =
      prayerTimes[i];

    const parts =
      prayer.time.split(":");

    const hours =
      Number(parts[0]);

    const minutes =
      Number(parts[1]);

    const prayerDate =
      new Date();

    prayerDate.setHours(
      hours,
      minutes,
      0,
      0
    );

    if (prayerDate > now) {

      showNextPrayer(
        prayer,
        prayerDate
      );

      return;
    }
  }

  const tomorrow =
    new Date();

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  const firstPrayer =
    prayerTimes[0];

  const parts =
    firstPrayer.time.split(":");

  tomorrow.setHours(
    Number(parts[0]),
    Number(parts[1]),
    0,
    0
  );

  document.getElementById(
    "nextPrayer"
  ).textContent =
    firstPrayer.name;

  document.getElementById(
    "nextTime"
  ).textContent =
    firstPrayer.time;

  updateCountdown(tomorrow);
}

// ========================================
// عرض الصلاة القادمة
// ========================================

function showNextPrayer(
  prayer,
  prayerDate
) {

  document.getElementById(
    "nextPrayer"
  ).textContent =
    prayer.name;

  document.getElementById(
    "nextTime"
  ).textContent =
    prayer.time;

  const element =
    document.getElementById(
      prayer.id
    );

  if (element) {
    element.classList.add("active");
  }

  updateCountdown(
    prayerDate
  );
}

// ========================================
// العد التنازلي
// ========================================

function updateCountdown(
  target
) {

  const now =
    new Date();

  const difference =
    target.getTime() -
    now.getTime();

  if (difference <= 0) {

    document.getElementById(
      "countdown"
    ).textContent =
      "حان وقت الصلاة 🕌";

    return;
  }

  const hours =
    Math.floor(
      difference / 3600000
    );

  const minutes =
    Math.floor(
      (difference % 3600000) / 60000
    );

  const seconds =
    Math.floor(
      (difference % 60000) / 1000
    );

  document.getElementById(
    "countdown"
  ).textContent =
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
}

  // ========================================
  // فتح صفحة القبلة 🧭
  // ========================================

  function openQibla() {
    window.location.href = "./qibla.html";
    }

// ========================================
// الإشعارات
// ========================================

async function enableNotifications() {

  if (!("Notification" in window)) {

    alert(
      "هذا المتصفح لا يدعم الإشعارات."
    );

    return;
  }

  try {

    const permission =
      await Notification.requestPermission();

    if (permission === "granted") {

      new Notification(
        "🕌 صلاتي",
        {
          body:
            "تم تفعيل الإشعارات بنجاح ❤️"
        }
      );

      document.getElementById(
        "notifications"
      ).innerHTML =
        "✅ <span>الإشعارات مفعّلة</span>";

    } else {

      alert(
        "لم يتم السماح بالإشعارات."
      );
    }

  } catch (error) {

    console.error(
      "Notification error:",
      error
    );
  }
}

// ========================================
// تشغيل التطبيق
// ========================================

function startApp() {

  updateDates();

  getLocation();

  const qiblaButton =
    document.getElementById("qibla");

  if (qiblaButton) {

    qiblaButton.addEventListener(
      "click",
      openQibla
    );
  }

  const notificationButton =
    document.getElementById(
      "notifications"
    );

  if (notificationButton) {

    notificationButton.addEventListener(
      "click",
      enableNotifications
    );
  }

  setInterval(
    updateNextPrayer,
    1000
  );

  setInterval(
    updateDates,
    60000
  );

  setInterval(
    loadPrayerTimes,
    3600000
  );
}

// ========================================
// بدء التطبيق بعد تحميل الصفحة
// ========================================

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startApp
  );

} else {

  startApp();
}
// ========================================
// إعدادات التنبيه 🔔
// ========================================

(function setupNotificationSettings() {

  const settingsButton =
    document.getElementById(
      "notificationSettings"
    );

  const panel =
    document.getElementById(
      "notificationPanel"
    );

  const closeButton =
    document.getElementById(
      "closeNotificationPanel"
    );

  if (
    !settingsButton ||
    !panel ||
    !closeButton
  ) {
    return;
  }

  // ========================================
  // فتح اللوحة
  // ========================================

  settingsButton.addEventListener(
    "click",
    function() {

      panel.style.display =
        "block";
    }
  );

  // ========================================
  // إغلاق اللوحة
  // ========================================

  closeButton.addEventListener(
    "click",
    function() {

      panel.style.display =
        "none";
    }
  );

  // ========================================
  // حفظ الإعدادات
  // ========================================

  const options = [
    "prayerNotification",
    "beforePrayerNotification",
    "fajrNotification",
    "adhanNotification"
  ];

  options.forEach(
    function(id) {

      const checkbox =
        document.getElementById(id);

      if (!checkbox) {
        return;
      }

      const saved =
        localStorage.getItem(id);

      if (saved !== null) {

        checkbox.checked =
          saved === "true";
      }

      checkbox.addEventListener(
        "change",
        function() {

          localStorage.setItem(
            id,
            checkbox.checked
          );
        }
      );
    }
  );

})();
// ========================================
// تشغيل Service Worker للـ PWA
// ========================================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js")
      .then(function () {
        console.log("✅ صلاتي: Service Worker يعمل");
      })
      .catch(function (error) {
        console.error(
          "❌ Service Worker error:",
          error
        );
      });
  });
}
// ========================================
// جدولة تنبيهات الصلاة 🔔
// ========================================

function schedulePrayerNotifications() {

  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  notificationTimers.forEach(function(timer) {
    clearTimeout(timer);
  });

  notificationTimers = [];

  const now = new Date();

  prayerTimes.forEach(function(prayer) {

    const parts = prayer.time.split(":");

    const prayerDate = new Date();

    prayerDate.setHours(
      Number(parts[0]),
      Number(parts[1]),
      0,
      0
    );

    if (prayerDate <= now) {
      return;
    }

    const delay =
      prayerDate.getTime() -
      now.getTime();

    const timer =
      setTimeout(function() {

        const enabled =
          localStorage.getItem(
            "prayerNotification"
          );

        if (enabled !== "false") {

          new Notification(
            "🕌 حان وقت الصلاة",
            {
              body:
                "حان الآن وقت صلاة " +
                prayer.name
            }
          );
        }

      }, delay);

    notificationTimers.push(timer);

    // تنبيه قبل الصلاة بـ 10 دقائق
    const beforeEnabled =
      localStorage.getItem(
        "beforePrayerNotification"
      );

    if (beforeEnabled === "true") {

      const beforeDelay =
        delay - (10 * 60 * 1000);

      if (beforeDelay > 0) {

        const beforeTimer =
          setTimeout(function() {

            new Notification(
              "⏰ الصلاة بعد 10 دقائق",
              {
                body:
                  "اقترب وقت صلاة " +
                  prayer.name
              }
            );

          }, beforeDelay);

        notificationTimers.push(
          beforeTimer
        );
      }
    }

  });

  scheduledNotificationDate =
    now.toDateString();
}
