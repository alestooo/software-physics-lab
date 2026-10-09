const toggleButton =
  document.querySelector<HTMLButtonElement>(
    "#mobile-menu-toggle"
  );

const backdrop =
  document.querySelector<HTMLButtonElement>(
    "#mobile-sidebar-backdrop"
  );

const sidebar =
  document.querySelector<HTMLElement>(
    "#site-sidebar"
  );

const sidebarLinks =
  document.querySelectorAll<HTMLAnchorElement>(
    "#site-sidebar a"
  );

const mobileMedia =
  window.matchMedia(
    "(max-width: 1023px)"
  );


const isOpen = (): boolean => {
  return document.body.classList.contains(
    "mobile-menu-open"
  );
};


const openMenu = (): void => {
  if (!mobileMedia.matches) {
    return;
  }

  document.body.classList.add(
    "mobile-menu-open"
  );

  if (toggleButton) {
    toggleButton.setAttribute(
      "aria-expanded",
      "true"
    );

    toggleButton.setAttribute(
      "aria-label",
      "Cerrar menú"
    );
  }
};


const closeMenu = (): void => {
  document.body.classList.remove(
    "mobile-menu-open"
  );

  if (toggleButton) {
    toggleButton.setAttribute(
      "aria-expanded",
      "false"
    );

    toggleButton.setAttribute(
      "aria-label",
      "Abrir menú"
    );
  }
};


const toggleMenu = (): void => {
  if (isOpen()) {
    closeMenu();
  } else {
    openMenu();
  }
};


if (toggleButton) {
  toggleButton.addEventListener(
    "click",
    toggleMenu
  );
}


if (backdrop) {
  backdrop.addEventListener(
    "click",
    closeMenu
  );
}


sidebarLinks.forEach(
  (link) => {
    link.addEventListener(
      "click",
      () => {
        if (mobileMedia.matches) {
          closeMenu();
        }
      }
    );
  }
);


document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      isOpen()
    ) {
      closeMenu();

      toggleButton?.focus();
    }
  }
);


mobileMedia.addEventListener(
  "change",
  (event) => {
    /*
      Si pasamos de móvil a PC,
      aseguramos que no quede el estado
      del drawer activado.
    */
    if (!event.matches) {
      closeMenu();
    }
  }
);


/*
  Evita que el navegador recuerde
  un menú abierto después de volver
  mediante navegación histórica.
*/
window.addEventListener(
  "pageshow",
  () => {
    closeMenu();
  }
);


export {};