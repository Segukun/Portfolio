const THEME_STORAGE_KEY = "portfolio-theme";

const applyTheme = (theme) => {
  document.body.classList.toggle("dark", theme === "dark");
  const toggleButton = document.querySelector(".theme-toggle");

  if (toggleButton) {
    toggleButton.classList.toggle("active", theme === "dark");
    toggleButton.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }
};

const getStoredTheme = () => localStorage.getItem(THEME_STORAGE_KEY);

const toggleTheme = () => {
  const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
};

const setupProjectPreviewModal = () => {
  const previewImages = document.querySelectorAll(".project-preview img");

  if (!previewImages.length) {
    return;
  }

  const modal = document.createElement("div");
  modal.className = "project-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "project-modal-title");
  modal.innerHTML = `
    <div class="project-modal-panel">
      <button class="project-modal-close" type="button" aria-label="Close project preview">Close</button>
      <div class="project-modal-media">
        <img class="project-modal-img" alt="">
      </div>
      <aside class="project-modal-details">
        <h2 id="project-modal-title"></h2>
        <p class="project-modal-type"></p>
        <p class="project-modal-date"></p>
        <p class="project-modal-description"></p>
        <div class="project-modal-section">
          <p class="project-block-label">Technologies Used</p>
          <div class="tech project-modal-tech" aria-label="Technologies used"></div>
        </div>
        <div class="project-modal-section">
          <p class="project-block-label project-modal-link-label">Project Links</p>
          <p class="repository-note project-modal-note"></p>
          <div class="project-actions project-modal-actions"></div>
        </div>
      </aside>
    </div>
  `;
  document.body.appendChild(modal);

  const panel = modal.querySelector(".project-modal-panel");
  const modalImage = modal.querySelector(".project-modal-img");
  const closeButton = modal.querySelector(".project-modal-close");
  const typeText = modal.querySelector(".project-modal-type");
  const titleText = modal.querySelector("#project-modal-title");
  const dateText = modal.querySelector(".project-modal-date");
  const descriptionText = modal.querySelector(".project-modal-description");
  const techList = modal.querySelector(".project-modal-tech");
  const noteText = modal.querySelector(".project-modal-note");
  const actions = modal.querySelector(".project-modal-actions");
  let activePreviewImage = null;

  const getFocusableElements = () => [
    ...modal.querySelectorAll("a[href], button, [tabindex]:not([tabindex='-1'])"),
  ].filter((element) => !element.disabled && element.offsetParent !== null);

  const closeModal = () => {
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
    modalImage.removeAttribute("src");
    modalImage.alt = "";
    techList.replaceChildren();
    actions.replaceChildren();

    if (activePreviewImage) {
      activePreviewImage.focus();
      activePreviewImage = null;
    }
  };

  const openModal = (image) => {
    const projectCard = image.closest(".project-post");
    const projectTitle = projectCard?.querySelector(".project-meta h2")?.textContent.trim() || "Project preview";
    const projectType = projectCard?.querySelector(".project-type-value")?.textContent.trim()
      || projectCard?.querySelector(".project-type")?.textContent.trim()
      || "";
    const projectDate = projectCard?.querySelector(".project-date")?.textContent.trim() || "";
    const projectDescription = projectCard?.querySelector(".project-description")?.textContent.trim() || "";
    const projectNote = projectCard?.querySelector(".repository-note")?.textContent.trim() || "";
    const projectTech = projectCard?.querySelectorAll(".project-block .tech span") || [];
    const projectLinks = projectCard?.querySelectorAll(".project-actions a") || [];

    activePreviewImage = image;
    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt || `${projectTitle} screenshot`;
    typeText.textContent = projectType ? `Work type: ${projectType}` : "";
    titleText.textContent = projectTitle;
    dateText.textContent = projectDate;
    descriptionText.textContent = projectDescription;
    noteText.textContent = projectNote;

    projectTech.forEach((tech) => {
      const techItem = document.createElement("span");
      techItem.textContent = tech.textContent.trim();
      techList.appendChild(techItem);
    });

    projectLinks.forEach((link) => {
      const modalLink = link.cloneNode(true);
      actions.appendChild(modalLink);
    });

    modal.classList.add("active");
    document.body.classList.add("modal-open");
    closeButton.focus();
  };

  previewImages.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Open project preview: ${image.alt}`);

    image.addEventListener("click", () => openModal(image));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(image);
      }
    });
  });

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (!panel.contains(event.target)) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("active")) {
      return;
    }

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key === "Tab") {
      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = getStoredTheme();

  if (savedTheme === "dark") {
    applyTheme("dark");
  }

  const toggleButton = document.querySelector(".theme-toggle");

  if (toggleButton) {
    toggleButton.addEventListener("click", toggleTheme);
  }

  setupProjectPreviewModal();
});
