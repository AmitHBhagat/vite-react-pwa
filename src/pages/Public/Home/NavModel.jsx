import React from "react";
import { Modal } from "rsuite";

const NavModel = ({ isOpen, onClose }) => {
  const navigationMenu = [
    { navTitle: "Home", navigateTo: "home" },
    { navTitle: "About", navigateTo: "about" },
    { navTitle: "Features", navigateTo: "features" },
    { navTitle: "Contact", navigateTo: "footer" },
  ];
  const scrollToSection = (id) => {
    onClose();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header>
        <button className="rs-modal-close-btn" onClick={onClose}></button>
      </Modal.Header>
      <Modal.Body>
        <ul className="nav-list modal-nav">
          {navigationMenu.map((menu) => (
            <li
              key={menu.navTitle}
              onClick={() => scrollToSection(menu.navigateTo)}
              className="cursor-pointer "
            >
              {menu.navTitle}
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  ) : (
    <></>
  );
};

export default NavModel;
