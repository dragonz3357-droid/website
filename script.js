document.addEventListener('DOMContentLoaded', () => {
  const eventList = document.getElementById('eventList');
  const searchInput = document.getElementById('searchInput');
  const genreFilter = document.getElementById('genreFilter');
  const dateFilter = document.getElementById('dateFilter');
  const noResults = document.getElementById('noResults');

  let events = [];

  // Fetch events from JSON
  fetch('events.json')
    .then(response => response.json())
    .then(data => {
      events = data;
      renderEvents(events);
    })
    .catch(error => {
      console.error('Error loading events:', error);
      eventList.innerHTML = '<p style="color:red;">Failed to load events.</p>';
    });

  // Render events to DOM
  function renderEvents(eventsToRender) {
    eventList.innerHTML = '';
    
    if (eventsToRender.length === 0) {
      noResults.style.display = 'block';
      return;
    } else {
      noResults.style.display = 'none';
    }

    eventsToRender.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      
      // Format date nicely
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short'
      });

      card.innerHTML = `
        <div class="event-image" style="background-image: url('${event.image}')"></div>
        <div class="event-content">
          <div class="event-date">${formattedDate} • ${event.time}</div>
          <h3 class="event-title">${event.title}</h3>
          <div class="event-meta">📍 ${event.venue}, ${event.city}</div>
          <div class="event-meta">🎵 ${event.genre}</div>
          <span class="event-price">${event.price}</span>
          <a href="${event.ticketLink}" target="_blank" class="btn-ticket">Get Tickets</a>
        </div>
      `;
      eventList.appendChild(card);
    });
  }

  // Filter Logic
  function filterEvents() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;
    const selectedDate = dateFilter.value;

    const filtered = events.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm) ||
        event.venue.toLowerCase().includes(searchTerm) ||
        event.city.toLowerCase().includes(searchTerm);
      
      const matchesGenre = selectedGenre ? event.genre === selectedGenre : true;
      
      const matchesDate = selectedDate ? event.date === selectedDate : true;

      return matchesSearch && matchesGenre && matchesDate;
    });

    renderEvents(filtered);
  }

  // Event Listeners
  searchInput.addEventListener('input', filterEvents);
  genreFilter.addEventListener('change', filterEvents);
  dateFilter.addEventListener('change', filterEvents);
});
