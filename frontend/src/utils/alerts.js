import Swal from 'sweetalert2';

export const skuyAlert = (title, text, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });

  return Toast.fire({
    icon: icon,
    // Format: JUDUL (Bold Purple) + Pesan (Normal)
    title: `<div class="skuy-toast-content"><b>${title}</b> <span>${text}</span></div>`,
    customClass: { popup: 'skuy-slim-toast' },
    showClass: { popup: 'animate__animated animate__bounceInRight animate__fast' },
    hideClass: { popup: 'animate__animated animate__fadeOutRight animate__faster' }
  });
};