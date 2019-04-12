;(function () {
  const showButton = document.querySelector('.menu-button--show');
  const closeButton = document.querySelector('.menu-button--close');
  const menu = document.querySelector('.menu-list');
  const logo = document.querySelector('.menu-button__wrapper');

  const menuHider = function (evt) {
    evt.preventDefault();
    closeButton.classList.add('hide');
    showButton.classList.remove('hide');
    menu.classList.add('hide');
    logo.classList.add('menu-shower');
  };

  const menuShower = function (evt) {
    evt.preventDefault();
    showButton.classList.add('hide');
    closeButton.classList.remove('hide');
    logo.classList.remove('menu-shower');
    menu.classList.remove('hide');
  };

  const closeButtonClickHandler = function () {
    closeButton.addEventListener('click', menuHider);
  };

  const showButtonClickHandler = function () {
    showButton.addEventListener('click', menuShower);
  };

  closeButtonClickHandler();
  showButtonClickHandler();

})();
