document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".section-animate");
  const checkVisibility = () => {
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      const sectionBottom = section.getBoundingClientRect().bottom;
      if (sectionTop < window.innerHeight && sectionBottom > 0) {
        section.classList.add("visible");
      } else {
        section.classList.remove("visible");
      }
    });
  };
  window.addEventListener("load", checkVisibility);
  window.addEventListener("scroll", checkVisibility);

  const text = "به صرافی ارز دیجیتال دلری خوش آمدید";
  const h2Element = document.getElementById("auto-typing");
  let index = 0;
  function typeText() {
    if (index < text.length) {
      h2Element.textContent += text.charAt(index);
      index++;
      setTimeout(typeText, 100);
    }
  }
  typeText();

  const hamburger = document.getElementById("hamburger");
  const navMenu = document.querySelector("#navbar ul");
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll("#navbar ul li a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

const coinTableBody = document.querySelector("#coin-table tbody");
const loadMoreBtn = document.getElementById("load-more");
let showAllCoins = false;
const initialDisplayCount = 5;

function displayCoins(coins) {
  coinTableBody.innerHTML = ''; 
  
  const coinsToDisplay = showAllCoins ? coins : coins.slice(0, initialDisplayCount);
  
  coinsToDisplay.forEach((coin) => {
      const row = document.createElement("tr");
      const changeClass = coin.change_24h >= 0 ? "positive-change" : "negative-change";
      const changeIcon = coin.change_24h >= 0 ? "↑" : "↓";
      row.innerHTML = `
          <td><img src="${coin.image_url}" style="width: 24px; height: 24px; vertical-align: middle; margin-left: 8px;" />${coin.name_fa}</td>
          <td>${coin.name_en} (${coin.symbol})</td>
          <td>$${coin.price_usd.toLocaleString()}</td>
          <td class="${changeClass}">${changeIcon} ${Math.abs(coin.change_24h)}%</td>
          <td>
              <button class="buy-btn">خرید</button>
              <button class="sell-btn">فروش</button>
          </td>
      `;
      coinTableBody.appendChild(row);
      
      row.querySelector(".buy-btn").addEventListener("click", function() {
          document.getElementById("from-coin").value = coin.symbol;
          document.getElementById("to-coin").value = "IRR";
          document.getElementById("convert-box").scrollIntoView({ behavior: "smooth" });
          
          Swal.fire({
              title: `خرید ${coin.symbol}`,
              text: `ارز ${coin.symbol} برای خرید انتخاب شد. لطفاً مقدار مورد نظر را وارد کنید.`,
              icon: "info",
              confirmButtonText: "متوجه شدم",
          });
      });
      
      row.querySelector(".sell-btn").addEventListener("click", function() {
          document.getElementById("from-coin").value = coin.symbol;
          document.getElementById("to-coin").value = "IRR";
          document.getElementById("convert-box").scrollIntoView({ behavior: "smooth" });
          
          Swal.fire({
              title: `فروش ${coin.symbol}`,
              text: `ارز ${coin.symbol} برای فروش انتخاب شد. لطفاً مقدار مورد نظر را وارد کنید.`,
              icon: "info",
              confirmButtonText: "متوجه شدم",
          });
      });
  });
  
  loadMoreBtn.textContent = showAllCoins ? "کمتر" : "بیشتر";
}
loadMoreBtn.addEventListener("click", () => {
    showAllCoins = !showAllCoins;
    displayCoins(coins);
});

  const usdToIrrRate = 1000000;

  function populateCoinDropdowns(coins) {
    const fromCoinSelect = document.getElementById("from-coin");
    const toCoinSelect = document.getElementById("to-coin");

    fromCoinSelect.innerHTML = '<option value="">از ارز</option>';
    toCoinSelect.innerHTML = '<option value="">به ارز</option>';

    const irrOption = document.createElement("option");
    irrOption.value = "IRR";
    irrOption.textContent = "ریال ایران (IRR)";
    toCoinSelect.appendChild(irrOption);

    coins.forEach((coin) => {
      const option1 = document.createElement("option");
      option1.value = coin.symbol;
      option1.textContent = `${coin.name_fa} (${coin.symbol})`;
      fromCoinSelect.appendChild(option1.cloneNode(true));
    });
  }

  function convertCurrency(fromSymbol, toSymbol, amount = 1) {
    if (!fromSymbol || !toSymbol) {
      Swal.fire({
        title: "خطا",
        text: "لطفاً هر دو ارز را انتخاب کنید",
        icon: "error",
        confirmButtonText: "متوجه شدم",
      });
      return;
    }

    fetch("cryptocurrencies.json")
      .then((response) => response.json())
      .then((data) => {
        const coins = data.cryptocurrencies;

        if (toSymbol === "IRR") {
          const fromCoin = coins.find((c) => c.symbol === fromSymbol);
          if (fromCoin) {
            const result = (fromCoin.price_usd * usdToIrrRate * amount).toLocaleString();
            Swal.fire({
              title: "نتیجه تبدیل",
              html: `<p> ${fromSymbol} = ${result} ریال</p>
                   <p>نرخ : ${usdToIrrRate.toLocaleString()} ریال</p>`,
              icon: "success",
              confirmButtonText: "متوجه شدم",
            });
          }
        } else if (fromSymbol === "IRR") {
          const toCoin = coins.find((c) => c.symbol === toSymbol);
          if (toCoin) {
            const result = (amount / (toCoin.price_usd * usdToIrrRate)).toFixed(8);
            Swal.fire({
              title: "نتیجه تبدیل",
              html: `<p>${amount.toLocaleString()} ریال = ${result} ${toSymbol}</p>
                   <p>نرخ : ${usdToIrrRate.toLocaleString()} ریال</p>`,
              icon: "success",
              confirmButtonText: "متوجه شدم",
            });
          }
        } else {
          const fromCoin = coins.find((c) => c.symbol === fromSymbol);
          const toCoin = coins.find((c) => c.symbol === toSymbol);
          if (fromCoin && toCoin) {
            const result = ((fromCoin.price_usd / toCoin.price_usd) * amount).toFixed(8);
            Swal.fire({
              title: "نتیجه تبدیل",
              html: `<p> ${fromSymbol} = ${result} ${toSymbol}</p>`,
              icon: "success",
              confirmButtonText: "متوجه شدم",
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          title: "خطا",
          text: "مشکلی در تبدیل ارز پیش آمد",
          icon: "error",
          confirmButtonText: "متوجه شدم",
        });
      });
  }

  fetch("cryptocurrencies.json")
    .then((response) => response.json())
    .then((data) => {
      coins = data.cryptocurrencies;
      populateCoinDropdowns(coins);
      displayCoins(coins); 
        
      document.querySelectorAll(".buy-btn, .sell-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const row = this.closest("tr");
          const symbol = row.cells[1].textContent.match(/\(([^)]+)\)/)[1];
          const action = this.classList.contains("buy-btn") ? "خرید" : "فروش";

          document.getElementById("from-coin").value = symbol;
          document.getElementById("to-coin").value = "IRR";
          document.getElementById("convert-box").scrollIntoView({ behavior: "smooth" });

          Swal.fire({
            title: `${action} ${symbol}`,
            text: `ارز ${symbol} برای ${action} انتخاب شد. لطفاً مقدار مورد نظر را وارد کنید.`,
            icon: "info",
            confirmButtonText: "متوجه شدم",
          });
        });
      });
    })
    .catch((error) => {
      console.error("Error loading cryptocurrency data:", error);
      coinTableBody.innerHTML = `<tr><td colspan="5">خطا در بارگذاری داده‌ها</td></tr>`;
    });

  document.getElementById("convert-btn").addEventListener("click", () => {
    const from = document.getElementById("from-coin");
    const to = document.getElementById("to-coin");
    const temp = from.value;
    from.value = to.value;
    to.value = temp;
  });

  document.getElementById("convert-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const fromSymbol = document.getElementById("from-coin").value;
    const toSymbol = document.getElementById("to-coin").value;
    const amount = document.getElementById("amount-input").value || 1;
    convertCurrency(fromSymbol, toSymbol, amount);
  });

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (isLoggedIn) {
    const username = localStorage.getItem("username");
    const authBtn = document.getElementById("auth-btn");
    const profileBtn = document.getElementById("profile-btn");
    const loginBtn = document.getElementById("login-btn");
    profileBtn.textContent = username;
    authBtn.style.display = "none";
    profileBtn.style.display = "inline-block";
    loginBtn.style.display = "none";
  } else {
    document.getElementById("login-btn").style.display = "inline-block";
    document.getElementById("profile-btn").style.display = "none";
  }
});
