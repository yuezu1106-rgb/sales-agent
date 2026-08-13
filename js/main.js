/* 拾客 Shike AI 智能获客助手 · 宣传网站交互脚本 */

(function () {
  "use strict";

  /* ---------- 移动端导航 ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navToggle.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
    // 点击链接后自动收起
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navToggle.classList.remove("open");
        navLinks.classList.remove("open");
      });
    });
  }

  /* ---------- FAQ 手风琴 ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if (!btn || !panel) return;

    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");

      // 关闭其他项
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          var p = other.querySelector(".faq-a");
          if (p) p.style.maxHeight = "0px";
        }
      });

      if (isOpen) {
        item.classList.remove("open");
        panel.style.maxHeight = "0px";
      } else {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ---------- 滚动渐显动画 ---------- */
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // 降级：直接显示
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- 回到顶部 ---------- */
  var backTop = document.getElementById("backTop");
  if (backTop) {
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 500) {
          backTop.classList.add("show");
        } else {
          backTop.classList.remove("show");
        }
      },
      { passive: true },
    );

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- GitHub Star 数（Hero 徽章） ---------- */
  var badgeStars = document.getElementById("badgeStars");
  if (badgeStars) {
    var REPO_API = "https://api.github.com/repos/yuezu1026/sales-agent";
    var CACHE_KEY = "sales_agent_repo_stars";
    var CACHE_TTL = 6 * 60 * 60 * 1000; // 缓存 6 小时，避免触发 GitHub 限流

    var renderStars = function (count) {
      if (typeof count !== "number") return;
      var text =
        count >= 1000
          ? (count / 1000).toFixed(1).replace(/\.0$/, "") + "k"
          : String(count);
      badgeStars.textContent = "⭐ " + text;
      badgeStars.classList.add("show");
    };

    var cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    } catch (e) {
      cached = null;
    }

    if (cached && Date.now() - cached.time < CACHE_TTL) {
      // 命中缓存直接渲染，不发请求
      renderStars(cached.count);
    } else {
      fetch(REPO_API, { headers: { Accept: "application/vnd.github+json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (data) {
          renderStars(data.stargazers_count);
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                count: data.stargazers_count,
                time: Date.now(),
              }),
            );
          } catch (e) {
            /* 忽略存储失败 */
          }
        })
        .catch(function () {
          // 仓库未公开 / 网络失败 / 限流：静默隐藏 Star 数，徽章不受影响
        });
    }
  }

  /* ---------- 导航滚动加深背景 ---------- */
  var nav = document.getElementById("nav");
  if (nav) {
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 40) {
          nav.style.background = "rgba(13, 31, 24, 0.95)";
        } else {
          nav.style.background = "rgba(13, 31, 24, 0.75)";
        }
      },
      { passive: true },
    );
  }
})();
