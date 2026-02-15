// app.js - Booking System with OOP

// ============= ENUMS & CONSTANTS =============

const SeatStatus = {
    AVAILABLE: 'available',
    SELECTED: 'selected',
    OCCUPIED: 'occupied'
};

const RoomStatus = {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance'
};

const BookingStatus = {
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled'
};

// ============= CLASSES DE BASE =============

/**
 * Classe Seat - Représente un siège de cinéma
 */
class Seat {
    #row;
    #number;
    #status;
    #price;

    constructor(row, number, price = 12.00) {
        this.#row = row;
        this.#number = number;
        this.#status = SeatStatus.AVAILABLE;
        this.#price = price;
    }

    // Getters
    getRow() {
        return this.#row;
    }

    getNumber() {
        return this.#number;
    }

    getStatus() {
        return this.#status;
    }

    getPrice() {
        return this.#price;
    }

    getId() {
        return `${this.#row}${this.#number}`;
    }

    // État
    isAvailable() {
        return this.#status === SeatStatus.AVAILABLE;
    }

    isSelected() {
        return this.#status === SeatStatus.SELECTED;
    }

    isOccupied() {
        return this.#status === SeatStatus.OCCUPIED;
    }

    // Actions
    select() {
        if (!this.isAvailable()) {
            throw new Error('Ce siège n\'est pas disponible');
        }
        this.#status = SeatStatus.SELECTED;
    }

    deselect() {
        if (!this.isSelected()) {
            throw new Error('Ce siège n\'est pas sélectionné');
        }
        this.#status = SeatStatus.AVAILABLE;
    }

    occupy() {
        this.#status = SeatStatus.OCCUPIED;
    }

    release() {
        this.#status = SeatStatus.AVAILABLE;
    }

    toJSON() {
        return {
            row: this.#row,
            number: this.#number,
            status: this.#status,
            price: this.#price
        };
    }
}

/**
 * Classe Showtime - Représente une séance de cinéma
 */
class Showtime {
    #id;
    #movieId;
    #time;
    #date;
    #seats;
    #theater;

    constructor(data) {
        this.#id = data.id;
        this.#movieId = data.movieId;
        this.#time = data.time;
        this.#date = data.date;
        this.#theater = data.theater || 1;
        this.#seats = this.#initializeSeats(data.rows || 8, data.seatsPerRow || 12);
    }

    #initializeSeats(rows, seatsPerRow) {
        const seats = new Map();
        const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let r = 0; r < rows; r++) {
            for (let s = 1; s <= seatsPerRow; s++) {
                const row = rowLetters[r];
                const seat = new Seat(row, s);
                seats.set(seat.getId(), seat);
            }
        }

        return seats;
    }

    // Getters
    getId() {
        return this.#id;
    }

    getMovieId() {
        return this.#movieId;
    }

    getTime() {
        return this.#time;
    }

    getDate() {
        return this.#date;
    }

    getTheater() {
        return this.#theater;
    }

    getSeat(seatId) {
        return this.#seats.get(seatId);
    }

    getAllSeats() {
        return Array.from(this.#seats.values());
    }

    // Disponibilité
    getAvailableSeats() {
        return this.getAllSeats().filter(seat => seat.isAvailable());
    }

    getSelectedSeats() {
        return this.getAllSeats().filter(seat => seat.isSelected());
    }

    getAvailableCount() {
        return this.getAvailableSeats().length;
    }

    // Actions
    selectSeat(seatId) {
        const seat = this.getSeat(seatId);
        if (!seat) {
            throw new Error('Siège non trouvé');
        }
        seat.select();
    }

    deselectSeat(seatId) {
        const seat = this.getSeat(seatId);
        if (!seat) {
            throw new Error('Siège non trouvé');
        }
        seat.deselect();
    }

    clearSelections() {
        this.getSelectedSeats().forEach(seat => seat.deselect());
    }

    confirmSeats() {
        this.getSelectedSeats().forEach(seat => seat.occupy());
    }

    releaseSeats(seatIds) {
        seatIds.forEach(seatId => {
            const seat = this.getSeat(seatId);
            if (seat) {
                seat.release();
            }
        });
    }
}

/**
 * Classe Room - Représente une chambre d'hôtel
 */
class Room {
    #number;
    #type;
    #price;
    #capacity;
    #features;
    #bookings;
    #status;

    constructor(data) {
        this.#number = data.number;
        this.#type = data.type;
        this.#price = data.price;
        this.#capacity = data.capacity;
        this.#features = data.features || [];
        this.#bookings = [];
        this.#status = RoomStatus.AVAILABLE;
    }

    // Getters
    getNumber() {
        return this.#number;
    }

    getType() {
        return this.#type;
    }

    getPrice() {
        return this.#price;
    }

    getCapacity() {
        return this.#capacity;
    }

    getFeatures() {
        return [...this.#features];
    }

    getStatus() {
        return this.#status;
    }

    // Disponibilité
    isAvailable(checkIn, checkOut) {
        if (this.#status !== RoomStatus.AVAILABLE) {
            return false;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Vérifier les conflits avec les réservations existantes
        return !this.#bookings.some(booking => {
            if (booking.status === BookingStatus.CANCELLED) {
                return false;
            }

            const bookingCheckIn = new Date(booking.checkIn);
            const bookingCheckOut = new Date(booking.checkOut);

            // Détection de chevauchement
            return (
                (checkInDate >= bookingCheckIn && checkInDate < bookingCheckOut) ||
                (checkOutDate > bookingCheckIn && checkOutDate <= bookingCheckOut) ||
                (checkInDate <= bookingCheckIn && checkOutDate >= bookingCheckOut)
            );
        });
    }

    // Gestion des réservations
    addBooking(booking) {
        if (!this.isAvailable(booking.checkIn, booking.checkOut)) {
            throw new Error('Chambre non disponible pour ces dates');
        }
        this.#bookings.push(booking);
    }

    removeBooking(bookingId) {
        const index = this.#bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            this.#bookings.splice(index, 1);
        }
    }

    setStatus(status) {
        this.#status = status;
    }

    toJSON() {
        return {
            number: this.#number,
            type: this.#type,
            price: this.#price,
            capacity: this.#capacity,
            features: this.#features,
            status: this.#status
        };
    }
}

/**
 * Classe Booking - Représente une réservation
 */
class Booking {
    #id;
    #type;
    #customerName;
    #customerEmail;
    #customerPhone;
    #date;
    #status;
    #details;
    #totalPrice;

    constructor(data) {
        this.#id = this.#generateId();
        this.#type = data.type; // 'cinema' ou 'hotel'
        this.#customerName = data.customerName;
        this.#customerEmail = data.customerEmail;
        this.#customerPhone = data.customerPhone || '';
        this.#date = new Date();
        this.#status = BookingStatus.CONFIRMED;
        this.#details = data.details;
        this.#totalPrice = data.totalPrice;
    }

    #generateId() {
        return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    // Getters
    getId() {
        return this.#id;
    }

    getType() {
        return this.#type;
    }

    getCustomerName() {
        return this.#customerName;
    }

    getCustomerEmail() {
        return this.#customerEmail;
    }

    getCustomerPhone() {
        return this.#customerPhone;
    }

    getDate() {
        return this.#date;
    }

    getStatus() {
        return this.#status;
    }

    getDetails() {
        return { ...this.#details };
    }

    getTotalPrice() {
        return this.#totalPrice;
    }

    // État
    isConfirmed() {
        return this.#status === BookingStatus.CONFIRMED;
    }

    isCancelled() {
        return this.#status === BookingStatus.CANCELLED;
    }

    // Actions
    cancel() {
        if (this.isCancelled()) {
            throw new Error('Cette réservation est déjà annulée');
        }
        this.#status = BookingStatus.CANCELLED;
    }

    toJSON() {
        return {
            id: this.#id,
            type: this.#type,
            customerName: this.#customerName,
            customerEmail: this.#customerEmail,
            customerPhone: this.#customerPhone,
            date: this.#date,
            status: this.#status,
            details: this.#details,
            totalPrice: this.#totalPrice
        };
    }
}

/**
 * Classe Cinema - Gère les films et séances
 */
class Cinema {
    #movies;
    #showtimes;

    constructor() {
        this.#movies = new Map();
        this.#showtimes = new Map();
        this.#initializeMovies();
        this.#initializeShowtimes();
    }

    #initializeMovies() {
        const movies = [
            { id: 1, title: 'Avatar 3', duration: 180, genre: 'Science-Fiction' },
            { id: 2, title: 'Mission Impossible 8', duration: 150, genre: 'Action' },
            { id: 3, title: 'Le Dernier Maître de l\'Air', duration: 120, genre: 'Aventure' }
        ];

        movies.forEach(movie => this.#movies.set(movie.id, movie));
    }

    #initializeShowtimes() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const showtimes = [
            { id: 1, movieId: 1, time: '14:00', date: today.toISOString().split('T')[0], theater: 1 },
            { id: 2, movieId: 1, time: '18:00', date: today.toISOString().split('T')[0], theater: 1 },
            { id: 3, movieId: 1, time: '21:30', date: today.toISOString().split('T')[0], theater: 2 },
            { id: 4, movieId: 2, time: '15:00', date: today.toISOString().split('T')[0], theater: 2 },
            { id: 5, movieId: 2, time: '20:00', date: today.toISOString().split('T')[0], theater: 1 },
            { id: 6, movieId: 3, time: '16:30', date: today.toISOString().split('T')[0], theater: 3 },
            { id: 7, movieId: 1, time: '14:00', date: tomorrow.toISOString().split('T')[0], theater: 1 },
            { id: 8, movieId: 2, time: '19:00', date: tomorrow.toISOString().split('T')[0], theater: 2 }
        ];

        showtimes.forEach(data => {
            const showtime = new Showtime(data);
            this.#showtimes.set(showtime.getId(), showtime);
        });
    }

    getMovies() {
        return Array.from(this.#movies.values());
    }

    getMovie(id) {
        return this.#movies.get(id);
    }

    getShowtimesByMovie(movieId, date) {
        return Array.from(this.#showtimes.values())
            .filter(st => st.getMovieId() === movieId && st.getDate() === date);
    }

    getShowtime(id) {
        return this.#showtimes.get(id);
    }
}

/**
 * Classe Hotel - Gère les chambres
 */
class Hotel {
    #rooms;

    constructor() {
        this.#rooms = new Map();
        this.#initializeRooms();
    }

    #initializeRooms() {
        const roomsData = [
            { number: 101, type: 'single', price: 89, capacity: 1, features: ['WiFi', 'TV', 'Climatisation'] },
            { number: 102, type: 'single', price: 89, capacity: 1, features: ['WiFi', 'TV', 'Climatisation'] },
            { number: 103, type: 'double', price: 129, capacity: 2, features: ['WiFi', 'TV', 'Mini-bar', 'Climatisation'] },
            { number: 104, type: 'double', price: 129, capacity: 2, features: ['WiFi', 'TV', 'Mini-bar', 'Climatisation'] },
            { number: 105, type: 'double', price: 139, capacity: 2, features: ['WiFi', 'TV', 'Mini-bar', 'Climatisation', 'Balcon'] },
            { number: 201, type: 'suite', price: 249, capacity: 4, features: ['WiFi', 'TV', 'Mini-bar', 'Climatisation', 'Jacuzzi', 'Vue mer'] },
            { number: 202, type: 'suite', price: 249, capacity: 4, features: ['WiFi', 'TV', 'Mini-bar', 'Climatisation', 'Jacuzzi', 'Vue mer'] },
            { number: 203, type: 'double', price: 129, capacity: 2, features: ['WiFi', 'TV', 'Mini-bar', 'Climatisation'] }
        ];

        roomsData.forEach(data => {
            const room = new Room(data);
            this.#rooms.set(room.getNumber(), room);
        });
    }

    getRooms() {
        return Array.from(this.#rooms.values());
    }

    getRoom(number) {
        return this.#rooms.get(number);
    }

    getAvailableRooms(checkIn, checkOut, type = 'all') {
        return this.getRooms().filter(room => {
            if (type !== 'all' && room.getType() !== type) {
                return false;
            }
            return room.isAvailable(checkIn, checkOut);
        });
    }
}

/**
 * Classe BookingSystem - Système principal de réservation
 */
class BookingSystem {
    #cinema;
    #hotel;
    #bookings;

    constructor() {
        this.#cinema = new Cinema();
        this.#hotel = new Hotel();
        this.#bookings = [];
        this.#loadBookings();
    }

    // Cinema operations
    getCinema() {
        return this.#cinema;
    }

    bookCinemaSeats(showtimeId, seatIds, customerInfo) {
        const showtime = this.#cinema.getShowtime(showtimeId);
        if (!showtime) {
            throw new Error('Séance non trouvée');
        }

        // Vérifier que tous les sièges sont sélectionnés
        const selectedSeats = showtime.getSelectedSeats();
        if (selectedSeats.length !== seatIds.length) {
            throw new Error('Veuillez sélectionner vos sièges');
        }

        // Calculer le total
        const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.getPrice(), 0);

        // Confirmer les sièges
        showtime.confirmSeats();

        // Créer la réservation
        const movie = this.#cinema.getMovie(showtime.getMovieId());
        const booking = new Booking({
            type: 'cinema',
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            totalPrice: totalPrice,
            details: {
                movie: movie.title,
                showtime: showtime.getTime(),
                date: showtime.getDate(),
                theater: showtime.getTheater(),
                seats: seatIds
            }
        });

        this.#bookings.push(booking);
        this.#saveBookings();

        return booking;
    }

    cancelCinemaBooking(bookingId) {
        const booking = this.#bookings.find(b => b.getId() === bookingId);
        if (!booking || booking.getType() !== 'cinema') {
            throw new Error('Réservation non trouvée');
        }

        booking.cancel();

        // Libérer les sièges
        const details = booking.getDetails();
        const showtimes = this.#cinema.getShowtimesByMovie(
            this.#cinema.getMovies().find(m => m.title === details.movie).id,
            details.date
        );
        const showtime = showtimes.find(st => st.getTime() === details.showtime);
        if (showtime) {
            showtime.releaseSeats(details.seats);
        }

        this.#saveBookings();
    }

    // Hotel operations
    getHotel() {
        return this.#hotel;
    }

    bookRoom(roomNumber, checkIn, checkOut, customerInfo) {
        const room = this.#hotel.getRoom(roomNumber);
        if (!room) {
            throw new Error('Chambre non trouvée');
        }

        if (!room.isAvailable(checkIn, checkOut)) {
            throw new Error('Chambre non disponible pour ces dates');
        }

        // Calculer le nombre de nuits et le total
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * room.getPrice();

        // Créer la réservation
        const booking = new Booking({
            type: 'hotel',
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            totalPrice: totalPrice,
            details: {
                roomNumber: room.getNumber(),
                roomType: room.getType(),
                checkIn: checkIn,
                checkOut: checkOut,
                nights: nights,
                pricePerNight: room.getPrice()
            }
        });

        // Ajouter la réservation à la chambre
        room.addBooking({
            id: booking.getId(),
            checkIn: checkIn,
            checkOut: checkOut,
            status: booking.getStatus()
        });

        this.#bookings.push(booking);
        this.#saveBookings();

        return booking;
    }

    cancelHotelBooking(bookingId) {
        const booking = this.#bookings.find(b => b.getId() === bookingId);
        if (!booking || booking.getType() !== 'hotel') {
            throw new Error('Réservation non trouvée');
        }

        booking.cancel();

        // Retirer la réservation de la chambre
        const room = this.#hotel.getRoom(booking.getDetails().roomNumber);
        if (room) {
            room.removeBooking(bookingId);
        }

        this.#saveBookings();
    }

    // Bookings management
    getBookings(filter = 'all') {
        let bookings = this.#bookings.filter(b => b.isConfirmed());
        
        if (filter !== 'all') {
            bookings = bookings.filter(b => b.getType() === filter);
        }

        return bookings.sort((a, b) => b.getDate() - a.getDate());
    }

    #saveBookings() {
        const data = this.#bookings.map(b => b.toJSON());
        localStorage.setItem('bookings', JSON.stringify(data));
    }

    #loadBookings() {
        // Note: Pour une vraie application, il faudrait reconstruire
        // les objets Booking et synchroniser avec les chambres/sièges
        const data = localStorage.getItem('bookings');
        if (data) {
            // Pour cette démo, on ne charge pas les anciennes réservations
            // car cela nécessiterait de synchroniser l'état des sièges/chambres
        }
    }
}

/**
 * Classe BookingUI - Interface utilisateur
 */
class BookingUI {
    constructor(system) {
        this.system = system;
        this.currentMode = 'cinema';
        this.selectedShowtime = null;
        this.selectedRoom = null;

        this.initializeElements();
        this.attachEventListeners();
        this.setMinDates();
        this.renderMovies();
        this.renderBookings();
    }

    initializeElements() {
        // Mode buttons
        this.modeBtns = document.querySelectorAll('.mode-btn');
        this.cinemaMode = document.getElementById('cinemaMode');
        this.hotelMode = document.getElementById('hotelMode');

        // Cinema elements
        this.movieSelect = document.getElementById('movieSelect');
        this.cinemaDate = document.getElementById('cinemaDate');
        this.showtimeSelect = document.getElementById('showtimeSelect');
        this.seatingChart = document.getElementById('seatingChart');
        this.selectedSeatsDisplay = document.getElementById('selectedSeatsDisplay');
        this.cinemaTotal = document.getElementById('cinemaTotal');
        this.cinemaCustomerName = document.getElementById('cinemaCustomerName');
        this.cinemaCustomerEmail = document.getElementById('cinemaCustomerEmail');
        this.cinemaBookBtn = document.getElementById('cinemaBookBtn');

        // Hotel elements
        this.checkInDate = document.getElementById('checkInDate');
        this.checkOutDate = document.getElementById('checkOutDate');
        this.roomTypeFilter = document.getElementById('roomTypeFilter');
        this.searchRoomsBtn = document.getElementById('searchRoomsBtn');
        this.roomsList = document.getElementById('roomsList');
        this.selectedRoomInfo = document.getElementById('selectedRoomInfo');
        this.selectedRoomDetails = document.getElementById('selectedRoomDetails');
        this.hotelNights = document.getElementById('hotelNights');
        this.hotelNightPrice = document.getElementById('hotelNightPrice');
        this.hotelTotal = document.getElementById('hotelTotal');
        this.hotelCustomerName = document.getElementById('hotelCustomerName');
        this.hotelCustomerEmail = document.getElementById('hotelCustomerEmail');
        this.hotelCustomerPhone = document.getElementById('hotelCustomerPhone');
        this.hotelBookBtn = document.getElementById('hotelBookBtn');

        // Bookings
        this.bookingFilter = document.getElementById('bookingFilter');
        this.bookingsList = document.getElementById('bookingsList');

        // Modal
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmModalBody = document.getElementById('confirmModalBody');
        this.confirmModalClose = document.getElementById('confirmModalClose');
    }

    attachEventListeners() {
        // Mode switching
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
        });

        // Cinema
        this.movieSelect.addEventListener('change', () => this.onMovieChange());
        this.cinemaDate.addEventListener('change', () => this.onMovieChange());
        this.showtimeSelect.addEventListener('change', () => this.onShowtimeChange());
        this.cinemaBookBtn.addEventListener('click', () => this.bookCinema());

        // Hotel
        this.searchRoomsBtn.addEventListener('click', () => this.searchRooms());
        this.hotelBookBtn.addEventListener('click', () => this.bookHotel());

        // Bookings
        this.bookingFilter.addEventListener('change', () => this.renderBookings());

        // Modal
        this.confirmModalClose.addEventListener('click', () => this.hideModal());
    }

    setMinDates() {
        const today = new Date().toISOString().split('T')[0];
        this.cinemaDate.min = today;
        this.cinemaDate.value = today;
        this.checkInDate.min = today;
        this.checkOutDate.min = today;
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        this.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        if (mode === 'cinema') {
            this.cinemaMode.style.display = 'block';
            this.hotelMode.style.display = 'none';
        } else {
            this.cinemaMode.style.display = 'none';
            this.hotelMode.style.display = 'block';
        }
    }

    // Cinema methods
    renderMovies() {
        const movies = this.system.getCinema().getMovies();
        this.movieSelect.innerHTML = '<option value="">Choisir un film...</option>' +
            movies.map(m => `<option value="${m.id}">${m.title} (${m.duration}min - ${m.genre})</option>`).join('');
    }

    onMovieChange() {
        const movieId = parseInt(this.movieSelect.value);
        const date = this.cinemaDate.value;

        if (!movieId || !date) {
            this.showtimeSelect.disabled = true;
            this.showtimeSelect.innerHTML = '<option value="">Choisir une séance...</option>';
            this.seatingChart.innerHTML = '<p class="empty-message">Veuillez sélectionner un film et une séance</p>';
            return;
        }

        const showtimes = this.system.getCinema().getShowtimesByMovie(movieId, date);
        
        if (showtimes.length === 0) {
            this.showtimeSelect.disabled = true;
            this.showtimeSelect.innerHTML = '<option value="">Aucune séance disponible</option>';
            return;
        }

        this.showtimeSelect.disabled = false;
        this.showtimeSelect.innerHTML = '<option value="">Choisir une séance...</option>' +
            showtimes.map(st => 
                `<option value="${st.getId()}">${st.getTime()} - Salle ${st.getTheater()} (${st.getAvailableCount()} places)</option>`
            ).join('');
    }

    onShowtimeChange() {
        const showtimeId = parseInt(this.showtimeSelect.value);
        
        if (!showtimeId) {
            this.seatingChart.innerHTML = '<p class="empty-message">Veuillez sélectionner une séance</p>';
            this.cinemaBookBtn.disabled = true;
            return;
        }

        const showtime = this.system.getCinema().getShowtime(showtimeId);
        this.selectedShowtime = showtime;
        
        if (showtime) {
            showtime.clearSelections();
            this.renderSeatingChart(showtime);
            this.updateCinemaTotal();
        }
    }

    renderSeatingChart(showtime) {
        const seats = showtime.getAllSeats();
        const rows = {};

        seats.forEach(seat => {
            if (!rows[seat.getRow()]) {
                rows[seat.getRow()] = [];
            }
            rows[seat.getRow()].push(seat);
        });

        this.seatingChart.innerHTML = Object.keys(rows).sort().map(row => {
            const rowSeats = rows[row].sort((a, b) => a.getNumber() - b.getNumber());
            return `
                <div class="seat-row">
                    <span class="row-label">${row}</span>
                    ${rowSeats.map(seat => `
                        <div class="seat ${seat.getStatus()}" 
                             data-seat-id="${seat.getId()}">
                            ${seat.getNumber()}
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');

        // Attacher les événements après le rendu
        this.attachSeatEventListeners();
    }

    attachSeatEventListeners() {
        const seatElements = this.seatingChart.querySelectorAll('.seat');
        seatElements.forEach(seatEl => {
            const seatId = seatEl.dataset.seatId;
            const seat = this.selectedShowtime?.getSeat(seatId);
            
            if (seat && !seat.isOccupied()) {
                seatEl.style.cursor = 'pointer';
                seatEl.addEventListener('click', () => this.toggleSeat(seatId));
            }
        });
    }

    toggleSeat(seatId) {
        if (!this.selectedShowtime) return;

        const seat = this.selectedShowtime.getSeat(seatId);
        if (!seat) return;

        try {
            if (seat.isAvailable()) {
                this.selectedShowtime.selectSeat(seatId);
            } else if (seat.isSelected()) {
                this.selectedShowtime.deselectSeat(seatId);
            }
            this.renderSeatingChart(this.selectedShowtime);
            this.updateCinemaTotal();
        } catch (error) {
            alert(error.message);
        }
    }

    updateCinemaTotal() {
        if (!this.selectedShowtime) return;

        const selectedSeats = this.selectedShowtime.getSelectedSeats();
        const total = selectedSeats.reduce((sum, seat) => sum + seat.getPrice(), 0);

        if (selectedSeats.length === 0) {
            this.selectedSeatsDisplay.textContent = 'Aucun siège sélectionné';
            this.selectedSeatsDisplay.classList.remove('has-seats');
            this.cinemaBookBtn.disabled = true;
        } else {
            this.selectedSeatsDisplay.textContent = selectedSeats.map(s => s.getId()).join(', ');
            this.selectedSeatsDisplay.classList.add('has-seats');
            this.cinemaBookBtn.disabled = false;
        }

        this.cinemaTotal.textContent = `${total.toFixed(2)} €`;
    }

    bookCinema() {
        const name = this.cinemaCustomerName.value.trim();
        const email = this.cinemaCustomerEmail.value.trim();

        if (!name || !email) {
            alert('Veuillez renseigner vos informations');
            return;
        }

        if (!this.selectedShowtime) {
            alert('Veuillez sélectionner une séance');
            return;
        }

        const selectedSeats = this.selectedShowtime.getSelectedSeats();
        if (selectedSeats.length === 0) {
            alert('Veuillez sélectionner au moins un siège');
            return;
        }

        try {
            const booking = this.system.bookCinemaSeats(
                this.selectedShowtime.getId(),
                selectedSeats.map(s => s.getId()),
                { name, email }
            );

            this.showConfirmation(booking);
            this.resetCinemaForm();
            this.renderBookings();
        } catch (error) {
            alert(error.message);
        }
    }

    resetCinemaForm() {
        this.movieSelect.value = '';
        this.showtimeSelect.value = '';
        this.showtimeSelect.disabled = true;
        this.cinemaCustomerName.value = '';
        this.cinemaCustomerEmail.value = '';
        this.selectedShowtime = null;
        this.seatingChart.innerHTML = '<p class="empty-message">Veuillez sélectionner un film et une séance</p>';
        this.selectedSeatsDisplay.textContent = 'Aucun siège sélectionné';
        this.selectedSeatsDisplay.classList.remove('has-seats');
        this.cinemaTotal.textContent = '0.00 €';
        this.cinemaBookBtn.disabled = true;
    }

    // Hotel methods
    searchRooms() {
        const checkIn = this.checkInDate.value;
        const checkOut = this.checkOutDate.value;
        const roomType = this.roomTypeFilter.value;

        if (!checkIn || !checkOut) {
            alert('Veuillez sélectionner les dates');
            return;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate <= checkInDate) {
            alert('La date de départ doit être après la date d\'arrivée');
            return;
        }

        const rooms = this.system.getHotel().getAvailableRooms(checkIn, checkOut, roomType);
        this.renderRooms(rooms, checkIn, checkOut);
    }

    renderRooms(rooms, checkIn, checkOut) {
        if (rooms.length === 0) {
            this.roomsList.innerHTML = '<p class="empty-message">Aucune chambre disponible pour ces dates</p>';
            return;
        }

        const icons = {
            single: '🛏️',
            double: '🛏️🛏️',
            suite: '🏰'
        };

        const typeLabels = {
            single: 'Chambre Simple',
            double: 'Chambre Double',
            suite: 'Suite'
        };

        this.roomsList.innerHTML = rooms.map(room => `
            <div class="room-card ${this.selectedRoom?.getNumber() === room.getNumber() ? 'selected' : ''}"
                 data-room-number="${room.getNumber()}">
                <div class="room-icon">${icons[room.getType()]}</div>
                <div class="room-number">Chambre ${room.getNumber()}</div>
                <span class="room-type">${typeLabels[room.getType()]}</span>
                <ul class="room-features">
                    ${room.getFeatures().map(f => `<li>${f}</li>`).join('')}
                </ul>
                <div class="room-price">
                    ${room.getPrice().toFixed(2)} € <span>/ nuit</span>
                </div>
            </div>
        `).join('');

        // Attacher les événements
        this.attachRoomEventListeners();
    }

    attachRoomEventListeners() {
        const roomCards = this.roomsList.querySelectorAll('.room-card');
        roomCards.forEach(card => {
            card.addEventListener('click', () => {
                const roomNumber = parseInt(card.dataset.roomNumber);
                this.selectRoom(roomNumber);
            });
        });
    }

    selectRoom(roomNumber) {
        const room = this.system.getHotel().getRoom(roomNumber);
        if (!room) return;

        this.selectedRoom = room;
        
        const checkIn = this.checkInDate.value;
        const checkOut = this.checkOutDate.value;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const total = nights * room.getPrice();

        this.selectedRoomInfo.style.display = 'block';
        this.selectedRoomDetails.innerHTML = `
            <strong>Chambre ${room.getNumber()}</strong><br>
            ${room.getFeatures().join(', ')}
        `;
        this.hotelNights.textContent = `${nights} nuit${nights > 1 ? 's' : ''}`;
        this.hotelNightPrice.textContent = `${room.getPrice().toFixed(2)} €/nuit`;
        this.hotelTotal.textContent = `${total.toFixed(2)} €`;
        this.hotelBookBtn.disabled = false;

        // Update UI
        document.querySelectorAll('.room-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-room-number="${roomNumber}"]`)?.classList.add('selected');
    }

    bookHotel() {
        const name = this.hotelCustomerName.value.trim();
        const email = this.hotelCustomerEmail.value.trim();
        const phone = this.hotelCustomerPhone.value.trim();
        const checkIn = this.checkInDate.value;
        const checkOut = this.checkOutDate.value;

        if (!name || !email || !phone) {
            alert('Veuillez renseigner toutes vos informations');
            return;
        }

        if (!this.selectedRoom) {
            alert('Veuillez sélectionner une chambre');
            return;
        }

        try {
            const booking = this.system.bookRoom(
                this.selectedRoom.getNumber(),
                checkIn,
                checkOut,
                { name, email, phone }
            );

            this.showConfirmation(booking);
            this.resetHotelForm();
            this.renderBookings();
        } catch (error) {
            alert(error.message);
        }
    }

    resetHotelForm() {
        this.checkInDate.value = '';
        this.checkOutDate.value = '';
        this.roomTypeFilter.value = 'all';
        this.hotelCustomerName.value = '';
        this.hotelCustomerEmail.value = '';
        this.hotelCustomerPhone.value = '';
        this.selectedRoom = null;
        this.selectedRoomInfo.style.display = 'none';
        this.hotelBookBtn.disabled = true;
        this.roomsList.innerHTML = '<p class="empty-message">Veuillez sélectionner vos dates et rechercher</p>';
    }

    // Bookings
    renderBookings() {
        const filter = this.bookingFilter.value;
        const bookings = this.system.getBookings(filter);

        if (bookings.length === 0) {
            this.bookingsList.innerHTML = '<p class="empty-message">Aucune réservation</p>';
            return;
        }

        this.bookingsList.innerHTML = bookings.map(booking => {
            const details = booking.getDetails();
            const isCinema = booking.getType() === 'cinema';

            return `
                <div class="booking-card ${booking.getType()}">
                    <div class="booking-header">
                        <span class="booking-id">#${booking.getId()}</span>
                        <span class="booking-type ${booking.getType()}">
                            ${isCinema ? '🎬 Cinéma' : '🏨 Hôtel'}
                        </span>
                    </div>
                    <div class="booking-details">
                        ${isCinema ? `
                            <div class="booking-detail">
                                <span>Film:</span>
                                <strong>${details.movie}</strong>
                            </div>
                            <div class="booking-detail">
                                <span>Date:</span>
                                <strong>${new Date(details.date).toLocaleDateString('fr-FR')}</strong>
                            </div>
                            <div class="booking-detail">
                                <span>Séance:</span>
                                <strong>${details.showtime} - Salle ${details.theater}</strong>
                            </div>
                            <div class="booking-detail">
                                <span>Sièges:</span>
                                <strong>${details.seats.join(', ')}</strong>
                            </div>
                        ` : `
                            <div class="booking-detail">
                                <span>Chambre:</span>
                                <strong>N°${details.roomNumber}</strong>
                            </div>
                            <div class="booking-detail">
                                <span>Arrivée:</span>
                                <strong>${new Date(details.checkIn).toLocaleDateString('fr-FR')}</strong>
                            </div>
                            <div class="booking-detail">
                                <span>Départ:</span>
                                <strong>${new Date(details.checkOut).toLocaleDateString('fr-FR')}</strong>
                            </div>
                            <div class="booking-detail">
                                <span>Durée:</span>
                                <strong>${details.nights} nuit${details.nights > 1 ? 's' : ''}</strong>
                            </div>
                        `}
                        <div class="booking-detail">
                            <span>Client:</span>
                            <strong>${booking.getCustomerName()}</strong>
                        </div>
                    </div>
                    <div class="booking-footer">
                        <span class="booking-total">${booking.getTotalPrice().toFixed(2)} €</span>
                        <button class="cancel-btn" data-booking-id="${booking.getId()}" data-booking-type="${booking.getType()}">
                            Annuler
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Attacher les événements d'annulation
        this.attachCancelEventListeners();
    }

    attachCancelEventListeners() {
        const cancelBtns = this.bookingsList.querySelectorAll('.cancel-btn');
        cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const bookingId = btn.dataset.bookingId;
                const bookingType = btn.dataset.bookingType;
                this.cancelBooking(bookingId, bookingType);
            });
        });
    }

    cancelBooking(bookingId, type) {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
            return;
        }

        try {
            if (type === 'cinema') {
                this.system.cancelCinemaBooking(bookingId);
            } else {
                this.system.cancelHotelBooking(bookingId);
            }
            this.renderBookings();
            alert('Réservation annulée avec succès');
        } catch (error) {
            alert(error.message);
        }
    }

    // Modal
    showConfirmation(booking) {
        const details = booking.getDetails();
        const isCinema = booking.getType() === 'cinema';

        this.confirmModalBody.innerHTML = `
            <div class="confirmation-detail">
                <strong>Numéro de réservation:</strong> ${booking.getId()}
            </div>
            ${isCinema ? `
                <div class="confirmation-detail">
                    <strong>Film:</strong> ${details.movie}
                </div>
                <div class="confirmation-detail">
                    <strong>Date:</strong> ${new Date(details.date).toLocaleDateString('fr-FR')}
                </div>
                <div class="confirmation-detail">
                    <strong>Séance:</strong> ${details.showtime} - Salle ${details.theater}
                </div>
                <div class="confirmation-detail">
                    <strong>Sièges:</strong> ${details.seats.join(', ')}
                </div>
            ` : `
                <div class="confirmation-detail">
                    <strong>Chambre:</strong> N°${details.roomNumber}
                </div>
                <div class="confirmation-detail">
                    <strong>Arrivée:</strong> ${new Date(details.checkIn).toLocaleDateString('fr-FR')}
                </div>
                <div class="confirmation-detail">
                    <strong>Départ:</strong> ${new Date(details.checkOut).toLocaleDateString('fr-FR')}
                </div>
                <div class="confirmation-detail">
                    <strong>Durée:</strong> ${details.nights} nuit${details.nights > 1 ? 's' : ''}
                </div>
            `}
            <div class="confirmation-detail">
                <strong>Client:</strong> ${booking.getCustomerName()}
            </div>
            <div class="confirmation-detail">
                <strong>Email:</strong> ${booking.getCustomerEmail()}
            </div>
            <div class="confirmation-detail" style="font-size: 1.3rem; color: var(--success-color); border-top: 2px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
                <strong>Total:</strong> ${booking.getTotalPrice().toFixed(2)} €
            </div>
        `;

        this.confirmModal.classList.add('show');
    }

    hideModal() {
        this.confirmModal.classList.remove('show');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const system = new BookingSystem();
    const ui = new BookingUI(system);
    
    // Exposer pour le debugging
    window.bookingUI = ui;
    window.bookingSystem = system;
});