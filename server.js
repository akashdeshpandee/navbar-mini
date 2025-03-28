const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// In-memory "database"
let bookings = [];
let contacts = [];
let flights = [
    {
        id: 1,
        flightNumber: 'SA101',
        departure: 'New York',
        destination: 'Paris',
        date: '2025-04-15',
        price: 399,
        seats: 150
    },
    {
        id: 2,
        flightNumber: 'SA202',
        departure: 'London',
        destination: 'Tokyo',
        date: '2025-04-16',
        price: 799,
        seats: 200
    }
];

// Contact Form Endpoint
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    contacts.push({ name, email, message, date: new Date() });
    res.json({ success: true, message: 'Thank you for contacting us!' });
});

// Search Flights
app.get('/flights', (req, res) => {
    const { departure, destination, date } = req.query;
    
    let results = flights;
    
    if (departure) {
        results = results.filter(f => 
            f.departure.toLowerCase().includes(departure.toLowerCase())
        );
    }
    
    if (destination) {
        results = results.filter(f => 
            f.destination.toLowerCase().includes(destination.toLowerCase())
        );
    }
    
    if (date) {
        results = results.filter(f => f.date === date);
    }
    
    res.json(results);
});

// Book Flight
app.post('/book', (req, res) => {
    const { flightId, name, email, passengers } = req.body;
    
    if (!flightId || !name || !email || !passengers) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const flight = flights.find(f => f.id === flightId);
    if (!flight) {
        return res.status(404).json({ error: 'Flight not found' });
    }
    
    if (passengers > flight.seats) {
        return res.status(400).json({ error: 'Not enough seats available' });
    }
    
    // Generate random booking reference
    const ref = 'BK-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    
    bookings.push({
        reference: ref,
        flightId,
        name,
        email,
        passengers,
        date: new Date(),
        total: flight.price * passengers
    });
    
    // Update available seats
    flight.seats -= passengers;
    
    res.json({ 
        success: true, 
        bookingReference: ref,
        total: flight.price * passengers
    });
});

// Get all data (for testing)
app.get('/data', (req, res) => {
    res.json({
        flights,
        bookings,
        contacts
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});