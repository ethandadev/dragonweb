const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 200) {
    navbar.classList.add('visible');
  } else {
    navbar.classList.remove('visible');
  }
});
