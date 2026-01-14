const toggleButton = document.getElementById("themeToggle");

const applyTheme = (theme) => {
  document.body.classList.toggle("theme-dark", theme === "dark");
  localStorage.setItem("theme", theme);
};

if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    const current = localStorage.getItem("theme") || "light";
    applyTheme(current === "light" ? "dark" : "light");
  });
}

const storedTheme = localStorage.getItem("theme") || "light";
applyTheme(storedTheme);
