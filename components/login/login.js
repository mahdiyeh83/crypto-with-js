const $ = document;
const username = $.querySelector(".username");
const email = $.querySelector(".email");
const password = $.querySelector(".password");
const form = $.querySelector("#form");
const loginForm = $.querySelector("#loginForm");
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

function showError(elementId, message) {
  const errorElement = $.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function clearError(elementId) {
  const errorElement = $.getElementById(elementId);
  errorElement.textContent = "";
  errorElement.style.display = "none";
}

async function checkDuplicateUser(username, email) {
  try {
    const response = await fetch("https://delryregister-default-rtdb.firebaseio.com/users.json");
    const users = await response.json();
    
    if (!users) return false;
    
    for (const key in users) {
      const user = users[key];
      if (user.username === username) {
        return { isDuplicate: true, field: "نام کاربری" };
      }
      if (user.email === email) {
        return { isDuplicate: true, field: "ایمیل" };
      }
    }
    
    return { isDuplicate: false };
  } catch (error) {
    console.error("Error checking duplicate users:", error);
    return { isDuplicate: false };
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let isValid = true;
  
  if (username.value.length < 3) {
    showError("username-error", "نام کاربری باید حداقل 3 کاراکتر باشد");
    isValid = false;
  } else if (username.value.length > 15) {
    showError("username-error", "نام کاربری نباید بیشتر از 15 کاراکتر باشد");
    isValid = false;
  }
  
  if (!isValidEmail(email.value)) {
    showError("email-error", "لطفاً یک ایمیل معتبر وارد کنید");
    isValid = false;
  }
  
  if (password.value.length < 6) {
    showError("password-error", "رمز عبور باید حداقل 6 کاراکتر باشد");
    isValid = false;
  }
  
  clearError("username-error");
  clearError("email-error");
  clearError("password-error");

  if (isValid) {
    const { isDuplicate, field } = await checkDuplicateUser(username.value, email.value);
    
    if (isDuplicate) {
      showError(field === "نام کاربری" ? "username-error" : "email-error", 
               `${field} وارد شده قبلاً ثبت شده است`);
      return;
    }

    let userData = {
      username: username.value,
      email: email.value,
      password: password.value,
    };

    fetch("https://delryregister-default-rtdb.firebaseio.com/users.json", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(userData),
    })
      .then((res) => {
        if (res.ok) {
          Toast.fire({
            icon: "success",
            title: "ثبت نام با موفقیت انجام شد",
            background: "#26de81",
            color: "#fff",
          }).then(() => {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username.value);
            window.location.href = "/index.html";
          });
        } else {
          throw new Error("خطا در ثبت نام");
        }
      })
      .catch((err) => {
        Toast.fire({
          icon: "error",
          title: "خطا در ثبت نام",
          background: "#fc5c65",
          color: "#fff",
        });
        console.log(err);
      });
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loginEmail = loginForm.querySelector('input[type="email"]');
  const loginPassword = loginForm.querySelector('input[type="password"]');

  clearError("login-email-error");
  clearError("login-password-error");

  let isValid = true;
  if (!isValidEmail(loginEmail.value)) {
    showError("login-email-error", "لطفاً یک ایمیل معتبر وارد کنید");
    isValid = false;
  }
  if (loginPassword.value.length < 6) {
    showError("login-password-error", "رمز عبور باید حداقل 6 کاراکتر باشد");
    isValid = false;
  }

  if (isValid) {
    try {
      const response = await fetch("https://delryregister-default-rtdb.firebaseio.com/users.json");
      const users = await response.json();
      
      let userFound = false;
      let correctPassword = false;
      let username = "";

      if (users) {
        for (const key in users) {
          const user = users[key];
          if (user.email === loginEmail.value) {
            userFound = true;
            if (user.password === loginPassword.value) {
              correctPassword = true;
              username = user.username;
              break;
            }
          }
        }
      }

      if (!userFound) {
        showError("login-email-error", "کاربری با این ایمیل ثبت‌نام نکرده است");
        return;
      }

      if (!correctPassword) {
        showError("login-password-error", "رمز عبور اشتباه است");
        return;
      }

      Toast.fire({
        icon: "success",
        title: "ورود با موفقیت انجام شد",
        background: "#26de81",
        color: "#fff",
      }).then(() => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        window.location.href = "/index.html";
      });

    } catch (error) {
      console.error("Error during login:", error);
      Toast.fire({
        icon: "error",
        title: "خطا در سیستم ورود",
        background: "#fc5c65",
        color: "#fff",
      });
    }
  }
});

function clearData() {
  username.value = "";
  email.value = "";
  password.value = "";
}

