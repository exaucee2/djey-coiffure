// Réservation.js
document.addEventListener('DOMContentLoaded', () => {
    const btn       = document.getElementById('btn-reserve');
    const dateInput = document.getElementById('res-date');
    const timeInput = document.getElementById('res-time');
    const serviceI  = document.getElementById('res-service');
  
    // 1) Date min = demain
    const t = new Date();
    t.setDate(t.getDate() + 1);
    dateInput.min = t.toISOString().slice(0,10);
  
    // 2) Prérenseigner le service
    const srv = new URLSearchParams(window.location.search).get('service');
    if (srv) serviceI.value = decodeURIComponent(srv);
  
    // 3) Listeners
    btn.addEventListener('click', envoyerReservation);
    dateInput.addEventListener('change', updateTimeOptions);
    updateTimeOptions();
  });
  
  function updateTimeOptions() {
    const DATE = document.getElementById('res-date').value;
    const sel  = document.getElementById('res-time');
    sel.innerHTML = '';           // vide la liste
  
    if (!DATE) {
      sel.disabled = true;
      return;
    } else sel.disabled = false;
  
    // 4) Récupérer les RDV déjà pris (stockés en ISO)
    const taken = JSON.parse(localStorage.getItem('appointments') || '[]')
      .filter(dt => dt.slice(0,10) === DATE)
      .map(dt => new Date(dt));
  
    // 5) Générer tous les créneaux possibles
    const slots = [];
    for (let h = 9; h <= 22; h++) {
      const start = new Date(`${DATE}T${String(h).padStart(2,'0')}:00`);
      const end   = new Date(start.getTime() + 6 * 3600_000);
      if (end.getHours() <= 22) slots.push(start);
    }
  
    // 6) Filtrer ceux qui chevauchent un RDV existant
    function overlaps(s, takenAppt) {
      const sEnd = new Date(s.getTime() + 6 * 3600_000);
      return takenAppt < sEnd && s < new Date(takenAppt.getTime() + 6 * 3600_000);
    }
  
    slots.forEach(s => {
      if (!taken.some(t => overlaps(s,t))) {
        const hhmm = `${String(s.getHours()).padStart(2,'0')}:${String(s.getMinutes()).padStart(2,'0')}`;
        const opt = document.createElement('option');
        opt.value = hhmm;
        opt.textContent = hhmm;
        sel.appendChild(opt);
      }
    });
  
    if (!sel.options.length) {
      sel.innerHTML = `<option>Aucun créneau dispo</option>`;
      document.getElementById('btn-reserve').disabled = true;
    } else {
      document.getElementById('btn-reserve').disabled = false;
    }
  }
  
  function envoyerReservation() {
    const DATE  = document.getElementById('res-date').value;
    const TIME  = document.getElementById('res-time').value;
    const SRV   = document.getElementById('res-service').value;
    const NAME  = document.getElementById('res-name').value.trim();
    const PHONE = document.getElementById('res-phone').value.trim();
    const PHOTO = document.getElementById('res-photo').files[0];
  
    if (!DATE || !TIME || !SRV || !NAME || !PHONE) {
      return alert('Merci de remplir tous les champs.');
    }
  
    // 1) Sauvegarder ce RDV pour bloquer le créneau
    const iso = `${DATE}T${TIME}`;
    const list = JSON.parse(localStorage.getItem('appointments') || '[]');
    list.push(iso);
    localStorage.setItem('appointments', JSON.stringify(list));
  
    // 2) Construire et ouvrir le mail
    let body = `Bonjour,\n\nService : ${SRV}.\nNom : ${NAME}.\nTel : ${PHONE}.\nRDV le ${DATE} à ${TIME}.\n\n`;
    if (PHOTO) body += `Photo : ${PHOTO.name}\n→ à joindre manuellement.\n\n`;
    body += 'Merci !\n';
  
    const link = 'https://mail.google.com/mail/?view=cm&fs=1'
      + `&to=${encodeURIComponent('exauceemkabamba@gmail.com')}`
      + `&su=${encodeURIComponent('Réservation coiffure')}`
      + `&body=${encodeURIComponent(body)}`
      + `&tf=1`;
    window.open(link, '_blank');
  
    // 3) Met à jour immédiatement les options
    updateTimeOptions();
  }
  
  
  function envoyerReservation() {
    const service = document.getElementById('res-service').value.trim();
    const name    = document.getElementById('res-name').value.trim();
    const phone   = document.getElementById('res-phone').value.trim();
    const date    = document.getElementById('res-date').value;
    const time    = document.getElementById('res-time').value;
    const photo   = document.getElementById('res-photo').files[0];
  
    // validation
    if (!service || !name || !phone || !date || !time) {
      alert('Merci de remplir tous les champs (service, nom, téléphone, date, heure).');
      return;
    }
  
    // enregistrer ce RDV pour la contrainte suivante
    const appt = new Date(`${date}T${time}`);
    localStorage.setItem('lastAppointment', appt.toISOString());
  
    // construire le mail
    let body =
      `Bonjour,\n\n` +
      `Service choisi : ${service}.\n` +
      `Nom : ${name}.\n` +
      `Téléphone : ${phone}.\n` +
      `Rendez-vous souhaité le ${date} à ${time}.\n\n`;
  
    if (photo) {
      body +=
        `Photo souhaitée : ${photo.name}\n` +
        `→ Merci de joindre cette photo avant envoi.\n\n`;
    }
  
    body += `Merci et à bientôt !\n`;
  
    const email   = 'exauceemkabamba@gmail.com';
    const subject = 'Demande de réservation coiffure';
    const gmailLink =
      'https://mail.google.com/mail/?view=cm&fs=1' +
      `&to=${encodeURIComponent(email)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}` +
      `&tf=1`;
  
    window.open(gmailLink, '_blank');
    updateTimeConstraints();
  }
  
  function disableBookingDay() {
    document.getElementById('btn-reserve').disabled = true;
    alert('Plus de créneaux disponibles pour cette journée.');
  }
  
  function enableBooking() {
    document.getElementById('btn-reserve').disabled = false;
  }
  