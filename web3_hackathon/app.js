// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7W_sGElhADcTmdXQBaH0Fd50u6mb43FA",
  authDomain: "tixify-fa41a.firebaseapp.com",
  projectId: "tixify-fa41a",
  storageBucket: "tixify-fa41a.firebasestorage.app",
  messagingSenderId: "737457511810",
  appId: "1:737457511810:web:116643f18851b67cb7c39b",
  measurementId: "G-FYD3K14VG4"
};

// Initialize Firebase
const firebase = window.firebase; // Declare firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Initialize Analytics if available
let analytics;
if (firebase.analytics) {
    analytics = firebase.analytics();
}

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletStatus = document.getElementById('walletStatus');
const loginButton = document.getElementById('loginButton');
const userProfile = document.getElementById('userProfile');
const userPhoto = document.getElementById('userPhoto');
const userName = document.getElementById('userName');
const userMenuToggle = document.getElementById('userMenuToggle');
const userMenu = document.getElementById('userMenu');
const logoutButton = document.getElementById('logoutButton');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close-modal');
const googleLoginBtn = document.getElementById('googleLogin');
const emailLoginForm = document.getElementById('emailLoginForm');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const nav = document.querySelector('nav');
const exploreEventsBtn = document.getElementById('exploreEvents');
const filterButton = document.getElementById('filterButton');
const searchInput = document.getElementById('searchEvents');
const categoryFilter = document.getElementById('categoryFilter');
const dateFilter = document.getElementById('dateFilter');
const eventList = document.getElementById('eventList');
const loadMoreEventsBtn = document.getElementById('loadMoreEvents');
const ticketTabs = document.querySelectorAll('.tab-btn');
const transferTicketBtn = document.getElementById('transferTicketBtn');
const transferModal = document.getElementById('transferModal');
const ticketSelect = document.getElementById('ticketSelect');
const transferForm = document.getElementById('transferForm');
const openChatbotBtn = document.getElementById('openChatbot');
const closeChatbotBtn = document.getElementById('closeChatbot');
const chatbot = document.getElementById('chatbot');
const chatbotInput = document.getElementById('chatbotInput');
const sendMessageBtn = document.getElementById('sendMessage');
const chatbotMessages = document.getElementById('chatbotMessages');
const darkModeToggle = document.getElementById('darkModeToggle');
const newsletterForm = document.getElementById('newsletterForm');

// Web3 Variables
let web3;
let userAddress = '';
let connectedChainId;
let userTickets = [];
let events = [];

// Sample event data
const sampleEvents = [
    {
        id: 1,
        title: "Concert: Rock Night",
        date: "October 25, 2025",
        time: "8:00 PM",
        price: "0.1",
        location: "Crypto Arena, New York",
        image: "/rocknight.png?height=200&width=300",
        category: "concert",
        description: "Experience an unforgettable night of rock music with top bands and artists.",
        remaining: 150
    },
    {
        id: 2,
        title: "Conference: Web3 Summit",
        date: "November 10, 2025",
        time: "9:00 AM",
        price: "0.2",
        location: "Blockchain Center, San Francisco",
        image: "/conference.png?height=200&width=300",
        category: "conference",
        description: "Join industry leaders to discuss the future of Web3 and blockchain technology.",
        remaining: 200
    },
    {
        id: 3,
        title: "Sports: Championship Finals",
        date: "December 15, 2025",
        time: "7:30 PM",
        price: "0.15",
        location: "Crypto Stadium, Miami",
        image: "/sports.png?height=200&width=300",
        category: "sports",
        description: "Watch the most anticipated championship finals of the year live.",
        remaining: 100
    },
    {
        id: 4,
        title: "Festival: Blockchain Music Fest",
        date: "January 20, 2026",
        time: "12:00 PM",
        price: "0.25",
        location: "Decentralized Park, Austin",
        image: "/musicfest.png?height=200&width=300",
        category: "festival",
        description: "A three-day music festival celebrating artists who embrace blockchain technology.",
        remaining: 500
    },
    {
        id: 5,
        title: "Conference: DeFi Innovations",
        date: "February 5, 2026",
        time: "10:00 AM",
        price: "0.18",
        location: "Finance Hub, Chicago",
        image: "/deficonference.png?height=200&width=300",
        category: "conference",
        description: "Explore the latest innovations in decentralized finance and cryptocurrency.",
        remaining: 150
    },
    {
        id: 6,
        title: "Concert: Electronic Vibes",
        date: "March 12, 2026",
        time: "9:00 PM",
        price: "0.12",
        location: "Digital Arena, Los Angeles",
        image: "/electronicvibes.png?height=200&width=300",
        category: "concert",
        description: "Experience the best electronic music with world-renowned DJs and producers.",
        remaining: 200
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    logPageView();
});

// Initialize the application
function initApp() {
    // Load events
    events = [...sampleEvents];
    renderEvents();
    
    // Check if user is already logged in
    auth.onAuthStateChanged(handleAuthStateChange);
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }
    
    // Check if wallet was previously connected
    checkPreviousWalletConnection();
    
    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Wallet connection
    connectWalletBtn.addEventListener('click', connectWallet);
    
    // Authentication
    loginButton.addEventListener('click', () => showModal(loginModal));
    closeModal.addEventListener('click', () => hideModal(loginModal));
    googleLoginBtn.addEventListener('click', handleGoogleLogin);
    emailLoginForm.addEventListener('submit', handleEmailLogin);
    logoutButton?.addEventListener('click', handleLogout);
    userMenuToggle?.addEventListener('click', toggleUserMenu);
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            hideModal(loginModal);
        }
        if (event.target === transferModal) {
            hideModal(transferModal);
        }
        if (event.target !== userMenuToggle && event.target !== userMenu) {
            userMenu?.classList.remove('active');
        }
    });
    
    // Mobile menu
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Navigation
    exploreEventsBtn.addEventListener('click', () => {
        document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
        logEvent('explore_events_clicked');
    });
    
    // Event filtering
    filterButton.addEventListener('click', filterEvents);
    searchInput.addEventListener('input', filterEvents);
    categoryFilter.addEventListener('change', filterEvents);
    dateFilter.addEventListener('change', filterEvents);
    
    // Load more events
    loadMoreEventsBtn?.addEventListener('click', loadMoreEvents);
    
    // Ticket tabs
    ticketTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            ticketTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterTickets(tab.getAttribute('data-tab'));
        });
    });
    
    // Transfer ticket
    transferTicketBtn?.addEventListener('click', () => {
        populateTicketSelect();
        showModal(transferModal);
    });
    
    transferForm?.addEventListener('submit', handleTicketTransfer);
    
    // Chatbot
    openChatbotBtn.addEventListener('click', () => {
        chatbot.style.display = 'flex';
        openChatbotBtn.style.display = 'none';
        logEvent('chatbot_opened');
    });
    
    closeChatbotBtn.addEventListener('click', () => {
        chatbot.style.display = 'none';
        openChatbotBtn.style.display = 'flex';
    });
    
    sendMessageBtn.addEventListener('click', sendChatMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // Dark mode toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Newsletter
    newsletterForm?.addEventListener('submit', handleNewsletterSignup);
}

// Handle authentication state change
function handleAuthStateChange(user) {
    if (user) {
        // User is signed in
        loginButton.style.display = 'none';
        userProfile.style.display = 'flex';
        userName.textContent = user.displayName || user.email.split('@')[0];
        userPhoto.src = user.photoURL || '/placeholder.svg?height=32&width=32';
        
        // Enable transfer button if user has tickets
        updateTransferButtonState();
        
        // Log analytics event
        logEvent('login', {
            method: user.providerData[0].providerId
        });
    } else {
        // User is signed out
        loginButton.style.display = 'block';
        userProfile.style.display = 'none';
    }
}

// Toggle user menu
function toggleUserMenu() {
    userMenu.classList.toggle('active');
}

// Toggle mobile menu
function toggleMobileMenu() {
    nav.classList.toggle('active');
    const spans = mobileMenuBtn.querySelectorAll('span');
    
    if (nav.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        document.body.style.overflow = ''; // Allow scrolling
    }
}

// Check for previous wallet connection
function checkPreviousWalletConnection() {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress && window.ethereum) {
        userAddress = savedAddress;
        updateWalletUI(savedAddress);
        
        // Initialize Web3
        web3 = new Web3(window.ethereum);
        
        // Check if still connected
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length === 0) {
                    // Wallet disconnected
                    disconnectWallet();
                }
            })
            .catch(error => {
                console.error('Error checking accounts:', error);
                disconnectWallet();
            });
    }
}

// Connect wallet
async function connectWallet() {
    if (window.ethereum) {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            
            // Save to localStorage
            localStorage.setItem('walletAddress', userAddress);
            
            // Update UI
            updateWalletUI(userAddress);
            
            // Initialize Web3
            web3 = new Web3(window.ethereum);
            
            // Get network ID
            connectedChainId = await web3.eth.getChainId();
            
            // Set up event listeners for wallet
            setupWalletEventListeners();
            
            // Log analytics event
            logEvent('wallet_connected', {
                chain_id: connectedChainId
            });
        } catch (error) {
            console.error('User denied wallet connection:', error);
            walletStatus.innerText = 'Connection failed. Please try again.';
            walletStatus.style.color = 'var(--error)';
        }
    } else {
        walletStatus.innerText = 'Please install MetaMask to use this feature.';
        walletStatus.style.color = 'var(--warning)';
        
        // Show MetaMask installation modal or redirect
        const installMetaMask = confirm('MetaMask is required to use this feature. Would you like to install it now?');
        if (installMetaMask) {
            window.open('https://metamask.io/download.html', '_blank');
        }
    }
}

// Set up wallet event listeners
function setupWalletEventListeners() {
    if (window.ethereum) {
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                // User disconnected wallet
                disconnectWallet();
            } else {
                // User switched account
                userAddress = accounts[0];
                localStorage.setItem('walletAddress', userAddress);
                updateWalletUI(userAddress);
                
                // Log analytics event
                logEvent('wallet_account_changed');
            }
        });
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', (chainId) => {
            connectedChainId = chainId;
            
            // Log analytics event
            logEvent('wallet_chain_changed', {
                chain_id: chainId
            });
            
            // Reload the page to avoid any issues
            window.location.reload();
        });
    }
}

// Disconnect wallet
function disconnectWallet() {
    userAddress = '';
    localStorage.removeItem('walletAddress');
    
    // Update UI
    connectWalletBtn.innerText = 'Connect Wallet';
    connectWalletBtn.disabled = false;
    walletStatus.innerText = '';
    
    // Disable buy buttons
    document.querySelectorAll('.event-card button').forEach(button => {
        button.disabled = true;
    });
    
    // Log analytics event
    logEvent('wallet_disconnected');
}

// Update wallet UI
function updateWalletUI(address) {
    const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    walletStatus.innerText = `Connected: ${shortAddress}`;
    walletStatus.style.color = 'var(--success)';
    connectWalletBtn.innerHTML = `
        <svg class="wallet-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="16" y1="12" x2="16" y2="12"></line>
        </svg>
        Wallet Connected
    `;
    connectWalletBtn.classList.add('connected');
    
    // Enable buy buttons
    document.querySelectorAll('.event-card button').forEach(button => {
        button.disabled = false;
    });
}

// Render events
function renderEvents(filteredEvents = null) {
    const eventsToRender = filteredEvents || events;
    eventList.innerHTML = '';
    
    if (eventsToRender.length === 0) {
        eventList.innerHTML = '<p class="no-events-message">No events found matching your criteria.</p>';
        return;
    }
    
    eventsToRender.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.setAttribute('data-event-id', event.id);
        eventCard.setAttribute('data-category', event.category);
        
        eventCard.innerHTML = `
            <div class="event-image">
                <span class="event-category">${capitalizeFirstLetter(event.category)}</span>
                <img src="${event.image}" alt="${event.title}">
            </div>
            <div class="event-content">
                <h3>${event.title}</h3>
                <p class="event-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${event.date} at ${event.time}
                </p>
                <p class="event-price">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    ${event.price} ETH
                </p>
                <p class="event-location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${event.location}
                </p>
                <button class="buy-btn" ${!userAddress ? 'disabled' : ''} data-event-id="${event.id}">
                    Buy Ticket
                </button>
            </div>
        `;
        
        eventList.appendChild(eventCard);
    });
    
    // Add event listeners to buy buttons
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', buyTicket);
    });
}

// Filter events
function filterEvents() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    let filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) || 
                             event.location.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || event.category === category;
        
        // Date filtering logic
        let matchesDate = true;
        const eventDate = new Date(event.date);
        const today = new Date();
        
        if (dateFilter === 'today') {
            matchesDate = eventDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'week') {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            matchesDate = eventDate >= today && eventDate <= nextWeek;
        } else if (dateFilter === 'month') {
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);
            matchesDate = eventDate >= today && eventDate <= nextMonth;
        }
        
        return matchesSearch && matchesCategory && matchesDate;
    });
    
    renderEvents(filteredEvents);
    
    // Log analytics event
    logEvent('filter_events', {
        search_term: searchTerm,
        category: category,
        date_filter: dateFilter,
        results_count: filteredEvents.length
    });
}

// Load more events
function loadMoreEvents() {
    // In a real app, this would fetch more events from the server
    // For this demo, we'll just show a message
    alert('In a production environment, this would load more events from the blockchain.');
    
    // Log analytics event
    logEvent('load_more_events_clicked');
}

// Buy ticket
async function buyTicket(event) {
    if (!userAddress) {
        alert('Please connect your wallet first.');
        connectWalletBtn.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    const eventId = event.target.getAttribute('data-event-id');
    const eventData = events.find(e => e.id == eventId);
    
    if (!eventData) {
        alert('Event not found.');
        return;
    }
    
    // Confirm purchase
    const confirmPurchase = confirm(`Do you want to purchase a ticket for ${eventData.title} at ${eventData.price} ETH?`);
    if (!confirmPurchase) return;
    
    try {
        // Show loading state
        event.target.innerHTML = 'Processing...';
        event.target.disabled = true;
        
        // Simulate blockchain transaction
        // In a real app, this would interact with a smart contract
        await simulateBlockchainTransaction(eventData.price);
        
        // Generate ticket ID
        const ticketId = `TIX-${eventId}-${Math.floor(Math.random() * 10000)}`;
        
        // Add ticket to user's tickets
        const newTicket = {
            id: ticketId,
            eventId: eventId,
            eventName: eventData.title,
            date: eventData.date,
            time: eventData.time,
            location: eventData.location,
            price: eventData.price,
            purchaseDate: new Date().toISOString(),
            status: 'active'
        };
        
        userTickets.push(newTicket);
        
        // Add ticket to "My Tickets" section
        addTicketToMyTickets(newTicket);
        
        // Update transfer button state
        updateTransferButtonState();
        
        // Show success message
        showNotification(`Ticket purchased successfully for ${eventData.title}!`, 'success');
        
        // Reset button state
        event.target.innerHTML = 'Buy Ticket';
        event.target.disabled = false;
        
        // Scroll to tickets section
        document.getElementById('tickets').scrollIntoView({ behavior: 'smooth' });
        
        // Log analytics event
        logEvent('ticket_purchased', {
            event_id: eventId,
            event_name: eventData.title,
            price: eventData.price
        });
    } catch (error) {
        console.error('Transaction failed:', error);
        showNotification('Transaction failed. Please try again.', 'error');
        
        // Reset button state
        event.target.innerHTML = 'Buy Ticket';
        event.target.disabled = false;
    }
}

// Simulate blockchain transaction
function simulateBlockchainTransaction(amount) {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            resolve({
                transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
                blockNumber: Math.floor(Math.random() * 1000000),
                timestamp: Date.now()
            });
        }, 2000);
    });
}

// Add ticket to My Tickets section
function addTicketToMyTickets(ticket) {
    const ticketContainer = document.getElementById('ticketContainer');
    const noTicketsMessage = document.getElementById('noTicketsMessage');
    
    // Hide "No tickets purchased yet" message
    if (noTicketsMessage) {
        noTicketsMessage.style.display = 'none';
    }
    
    // Create ticket element
    const ticketElement = document.createElement('div');
    ticketElement.className = 'ticket-item';
    ticketElement.setAttribute('data-ticket-id', ticket.id);
    
    ticketElement.innerHTML = `
        <h3>${ticket.eventName}</h3>
        <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <strong>Date:</strong> ${ticket.date} at ${ticket.time}
        </p>
        <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <strong>Location:</strong> ${ticket.location}
        </p>
        <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <strong>Price:</strong> ${ticket.price} ETH
        </p>
        <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <strong>Ticket ID:</strong> ${ticket.id}
        </p>
        <div class="qr-code">
            <img src="/placeholder.svg?height=120&width=120" alt="QR Code for ${ticket.id}">
        </div>
        <div class="ticket-actions">
            <button class="view-btn">View Details</button>
            <button class="transfer-btn" data-ticket-id="${ticket.id}">Transfer</button>
        </div>
    `;
    
    ticketContainer.appendChild(ticketElement);
    
    // Add event listener to transfer button
    const transferBtn = ticketElement.querySelector('.transfer-btn');
    transferBtn.addEventListener('click', () => {
        populateTicketSelect(ticket.id);
        showModal(transferModal);
    });
}

// Update transfer button state
function updateTransferButtonState() {
    if (transferTicketBtn) {
        transferTicketBtn.disabled = userTickets.length === 0;
    }
}

// Filter tickets
function filterTickets(tab) {
    const ticketItems = document.querySelectorAll('.ticket-item');
    const today = new Date();
    
    ticketItems.forEach(item => {
        const ticketId = item.getAttribute('data-ticket-id');
        const ticket = userTickets.find(t => t.id === ticketId);
        
        if (!ticket) return;
        
        const eventDate = new Date(ticket.date);
        const isPast = eventDate < today;
        
        if (tab === 'upcoming' && !isPast) {
            item.style.display = 'block';
        } else if (tab === 'past' && isPast) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Populate ticket select dropdown
function populateTicketSelect(selectedTicketId = null) {
    if (!ticketSelect) return;
    
    // Clear existing options except the first one
    while (ticketSelect.options.length > 1) {
        ticketSelect.remove(1);
    }
    
    // Add user tickets as options
    userTickets.forEach(ticket => {
        const option = document.createElement('option');
        option.value = ticket.id;
        option.textContent = `${ticket.eventName} - ${ticket.date}`;
        
        if (selectedTicketId && ticket.id === selectedTicketId) {
            option.selected = true;
        }
        
        ticketSelect.appendChild(option);
    });
}

// Handle ticket transfer
function handleTicketTransfer(e) {
    e.preventDefault();
    
    const ticketId = ticketSelect.value;
    const recipientAddress = document.getElementById('recipientAddress').value;
    const message = document.getElementById('transferMessage').value;
    
    if (!ticketId || !recipientAddress) {
        showNotification('Please select a ticket and enter a recipient address.', 'error');
        return;
    }
    
    // Validate Ethereum address
    if (!isValidEthereumAddress(recipientAddress)) {
        showNotification('Please enter a valid Ethereum address.', 'error');
        return;
    }
    
    // Simulate transfer
    simulateTicketTransfer(ticketId, recipientAddress, message)
        .then(() => {
            // Remove ticket from user's tickets
            const ticketIndex = userTickets.findIndex(t => t.id === ticketId);
            if (ticketIndex !== -1) {
                userTickets.splice(ticketIndex, 1);
            }
            
            // Remove ticket from UI
            const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
            if (ticketElement) {
                ticketElement.remove();
            }
            
            // Show success message
            showNotification('Ticket transferred successfully!', 'success');
            
            // Update transfer button state
            updateTransferButtonState();
            
            // Hide modal
            hideModal(transferModal);
            
            // Check if no tickets left
            if (userTickets.length === 0) {
                document.getElementById('noTicketsMessage').style.display = 'block';
            }
            
            // Log analytics event
            logEvent('ticket_transferred', {
                ticket_id: ticketId,
                recipient: recipientAddress.substring(0, 10) + '...'
            });
        })
        .catch(error => {
            console.error('Transfer failed:', error);
            showNotification('Transfer failed. Please try again.', 'error');
        });
}

// Simulate ticket transfer
function simulateTicketTransfer(ticketId, recipientAddress, message) {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            resolve({
                transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
                blockNumber: Math.floor(Math.random() * 1000000),
                timestamp: Date.now()
            });
        }, 2000);
    });
}

// Validate Ethereum address
function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Handle Google login
function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            hideModal(loginModal);
            
            // Log analytics event
            logEvent('login', {
                method: 'google'
            });
        })
        .catch((error) => {
            console.error('Google login error:', error);
            showNotification('Google login failed. Please try again.', 'error');
        });
}

// Handle email login
function handleEmailLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            hideModal(loginModal);
            
            // Log analytics event
            logEvent('login', {
                method: 'email'
            });
        })
        .catch((error) => {
            console.error('Email login error:', error);
            showNotification(`Login failed: ${error.message}`, 'error');
        });
}

// Handle logout
function handleLogout() {
    auth.signOut()
        .then(() => {
            // Log analytics event
            logEvent('logout');
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
}

// Send chat message
function sendChatMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input
    chatbotInput.value = '';
    
    // Process message and get response
    const response = getChatbotResponse(message);
    
    // Simulate typing delay
    setTimeout(() => {
        addMessageToChat(response, 'bot');
    }, 1000);
    
    // Log analytics event
    logEvent('chatbot_message_sent', {
        message_length: message.length
    });
}

// Add message to chat
function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.innerHTML = `<p>${message}</p>`;
    
    chatbotMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Get chatbot response
function getChatbotResponse(message) {
    message = message.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return "Hello! How can I help you with Tixify today?";
    } else if (message.includes('ticket') && (message.includes('buy') || message.includes('purchase'))) {
        return "To buy a ticket, browse our events section, select an event you're interested in, and click the 'Buy Ticket' button. Make sure your wallet is connected first!";
    } else if (message.includes('wallet') && message.includes('connect')) {
        return "You can connect your wallet by clicking the 'Connect Wallet' button at the top of the page. We currently support MetaMask and other Web3 wallets.";
    } else if (message.includes('transfer') && message.includes('ticket')) {
        return "To transfer a ticket, go to the 'My Tickets' section, find the ticket you want to transfer, and click the 'Transfer' button. You'll need the recipient's wallet address.";
    } else if (message.includes('event') && message.includes('create')) {
        return "Currently, event creation is only available for verified organizers. Please contact support@tixify.com for more information on becoming an event organizer.";
    } else if (message.includes('refund')) {
        return "Our refund policy depends on the event organizer. Generally, refunds are available up to 48 hours before the event. Please check the specific event details for more information.";
    } else if (message.includes('thank')) {
        return "You're welcome! Is there anything else I can help you with?";
    } else {
        return "I'm not sure I understand. Could you please rephrase your question? You can ask about buying tickets, connecting wallets, transferring tickets, event information, or refund policies.";
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light');
    
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Log analytics event
    logEvent('dark_mode_toggled', {
        dark_mode_enabled: isDarkMode
    });
}

// Handle newsletter signup
function handleNewsletterSignup(e) {
    e.preventDefault();
    
    const email = document.getElementById('newsletterEmail').value;
    
    if (!email) {
        showNotification('Please enter your email address.', 'error');
        return;
    }
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Thank you for subscribing to our newsletter!', 'success');
        document.getElementById('newsletterEmail').value = '';
        
        // Log analytics event
        logEvent('newsletter_signup', {
            email_domain: email.split('@')[1]
        });
    }, 1000);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="close-notification">&times;</button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Add close event
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Show modal
function showModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
}

// Hide modal
function hideModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
}

// Log analytics event
function logEvent(eventName, params = {}) {
    if (analytics) {
        analytics.logEvent(eventName, params);
    }
    console.log(`Event: ${eventName}`, params);
}

// Log page view
function logPageView() {
    if (analytics) {
        analytics.logEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize events on page load
window.addEventListener('load', () => {
    // Add sample events to the event list
    renderEvents();
});