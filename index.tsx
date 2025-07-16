// --- TYPE DEFINITIONS ---
interface User {
    id: number;
    username: string;
    role: 'customer' | 'admin';
}

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    imageUrl: string;
    stock: number;
}

document.addEventListener('DOMContentLoaded', () => {
    // --- MOCK DATA (Replace with API calls to Java backend) ---
    const mockUsers: User[] = [
        { id: 1, username: 'customer', role: 'customer' },
        { id: 2, username: 'admin', role: 'admin' },
    ];

    let mockProducts: Product[] = [
        { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 99.99, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d76e?q=80&w=2070&auto=format&fit=crop', stock: 15 },
        { id: 2, name: 'Minimalist Wristwatch', category: 'Accessories', price: 149.50, imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1888&auto=format&fit=crop', stock: 10 },
        { id: 3, name: 'Leather Backpack', category: 'Bags', price: 79.00, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb68c6a62?q=80&w=1887&auto=format&fit=crop', stock: 20 },
        { id: 4, name: 'Running Sneakers', category: 'Shoes', price: 120.00, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop', stock: 30 },
        { id: 5, name: 'Smart Home Hub', category: 'Electronics', price: 89.99, imageUrl: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?q=80&w=1974&auto=format&fit=crop', stock: 8 },
        { id: 6, name: 'Stainless Steel Water Bottle', category: 'Accessories', price: 25.00, imageUrl: 'https://images.unsplash.com/photo-1602143407151-247e961438f2?q=80&w=1887&auto=format=fit', stock: 50 },
        { id: 7, name: 'Designer Sunglasses', category: 'Accessories', price: 250.00, imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1780&auto=format&fit=crop', stock: 12 },
        { id: 8, name: 'Modern Desk Chair', category: 'Furniture', price: 350.00, imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff53825b2?q=80&w=1887&auto=format&fit=crop', stock: 7 },
    ];

    // --- STATE MANAGEMENT ---
    let currentUser: User | null = null;
    let cart: { [productId: string]: number } = {}; // { productId: quantity }
    let products: Product[] = [...mockProducts];
    let filters = {
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
    };

    // --- DOM ELEMENT SELECTORS ---
    const loginModal = document.getElementById('login-modal') as HTMLElement;
    const appContainer = document.getElementById('app') as HTMLElement;
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
    const usernameDisplay = document.getElementById('username-display') as HTMLElement;
    const userRoleBadge = document.getElementById('user-role-badge') as HTMLElement;
    const addProductBtn = document.getElementById('add-product-btn') as HTMLButtonElement;
    const productListContainer = document.getElementById('product-list') as HTMLElement;
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const paginationControls = document.getElementById('pagination-controls') as HTMLElement;
    const cartToggleBtn = document.getElementById('cart-toggle-btn') as HTMLButtonElement;
    const cartSidebar = document.getElementById('cart-sidebar') as HTMLElement;
    const cartCloseBtn = document.getElementById('cart-close-btn') as HTMLButtonElement;
    const cartItemsContainer = document.getElementById('cart-items') as HTMLElement;
    const emptyCartMessage = document.getElementById('empty-cart-message') as HTMLElement;
    const cartCount = document.getElementById('cart-count') as HTMLElement;
    const cartTotalPrice = document.getElementById('cart-total-price') as HTMLElement;
    const checkoutBtn = document.getElementById('checkout-btn') as HTMLButtonElement;
    const productModal = document.getElementById('product-modal') as HTMLElement;
    const productModalCloseBtn = document.getElementById('product-modal-close-btn') as HTMLButtonElement;
    const productForm = document.getElementById('product-form') as HTMLFormElement;
    const productModalTitle = document.getElementById('product-modal-title') as HTMLElement;
    
    // SVG Icons
    const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;


    // --- RENDER FUNCTIONS ---
    const renderProducts = () => {
        productListContainer.innerHTML = '';
        const filteredProducts = products.filter(p => p.name.toLowerCase().includes(filters.searchQuery.toLowerCase()));

        const paginatedProducts = filteredProducts.slice(
            (filters.currentPage - 1) * filters.itemsPerPage,
            filters.currentPage * filters.itemsPerPage
        );
        
        if (paginatedProducts.length === 0) {
            productListContainer.innerHTML = `<p>No products found.</p>`;
        }

        paginatedProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.productId = product.id.toString();
            
            const adminActions = currentUser?.role === 'admin' ? `
                <div class="admin-actions">
                    <button class="btn edit-product-btn">${editIcon}</button>
                    <button class="btn btn-danger delete-product-btn">${deleteIcon}</button>
                </div>
            ` : '';

            card.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                </div>
                <div class="product-actions">
                    <button class="btn btn-accent add-to-cart-btn" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    ${adminActions}
                </div>
            `;
            productListContainer.appendChild(card);
        });
        
        renderPagination(filteredProducts.length);
    };

    const renderPagination = (totalItems: number) => {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(totalItems / filters.itemsPerPage);

        if (totalPages <= 1) return;

        const createButton = (text: string, page: number, disabled = false) => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = text;
            btn.dataset.page = page.toString();
            btn.disabled = disabled;
            return btn;
        };
        
        paginationControls.appendChild(createButton('Prev', filters.currentPage - 1, filters.currentPage === 1));
        
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${filters.currentPage} of ${totalPages}`;
        paginationControls.appendChild(pageInfo);

        paginationControls.appendChild(createButton('Next', filters.currentPage + 1, filters.currentPage === totalPages));
    };
    
    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        const cartItemIds = Object.keys(cart);

        if (cartItemIds.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            checkoutBtn.disabled = true;
        } else {
            emptyCartMessage.classList.add('hidden');
            checkoutBtn.disabled = false;
        }

        let totalPrice = 0;
        cartItemIds.forEach(productId => {
            const product = products.find(p => p.id == Number(productId));
            if (!product) return;

            const quantity = cart[productId];
            totalPrice += product.price * quantity;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.dataset.productId = productId;
            itemEl.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">$${product.price.toFixed(2)} x ${quantity}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="btn btn-secondary cart-quantity-decrease">-</button>
                    <span>${quantity}</span>
                    <button class="btn btn-secondary cart-quantity-increase">+</button>
                    <button class="btn btn-danger cart-item-remove">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
        
        cartCount.textContent = cartItemIds.reduce((sum, id) => sum + cart[id], 0).toString();
        cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
    };

    const updateUIForUser = () => {
        console.log('updateUIForUser called', currentUser);
        if (currentUser) {
            loginModal.classList.add('hidden');
            appContainer.classList.remove('hidden');
            usernameDisplay.textContent = currentUser.username;
            userRoleBadge.textContent = currentUser.role;
            addProductBtn.style.display = currentUser.role === 'admin' ? 'inline-flex' : 'none';
        } else {
            loginModal.classList.remove('hidden');
            appContainer.classList.add('hidden');
        }
        renderProducts();
        renderCart();
    };

    // --- EVENT HANDLERS ---
    const handleLogin = (e: Event) => {
        e.preventDefault();
        const username = usernameInput.value.trim().toLowerCase();
        const user = mockUsers.find(u => u.username === username);
        console.log('Login attempted:', username, user);
        if (user) {
            currentUser = user;
            updateUIForUser();
        } else {
            alert('Invalid user. Please enter "customer" or "admin".');
        }
    };
    
    const handleLogout = () => {
        currentUser = null;
        cart = {};
        updateUIForUser();
    };
    
    const handleSearch = (e: Event) => {
        filters.searchQuery = (e.target as HTMLInputElement).value;
        filters.currentPage = 1;
        renderProducts();
    };

    const handlePagination = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' && target.dataset.page) {
            filters.currentPage = Number(target.dataset.page);
            renderProducts();
        }
    };
    
    const handleProductListClick = (e: Event) => {
        const target = (e.target as HTMLElement).closest('button');
        if (!target) return;
        
        const card = (e.target as HTMLElement).closest('.product-card') as HTMLElement;
        const productId = card.dataset.productId;
        if (!productId) return;
        
        if (target.matches('.add-to-cart-btn')) {
            cart[productId] = (cart[productId] || 0) + 1;
            renderCart();
        } else if (target.matches('.edit-product-btn')) {
            showProductModal(productId);
        } else if (target.matches('.delete-product-btn')) {
            if (confirm('Are you sure you want to delete this product?')) {
                products = products.filter(p => p.id != Number(productId));
                renderProducts();
            }
        }
    };

    const handleCartItemsClick = (e: Event) => {
        const target = (e.target as HTMLElement).closest('button');
        if (!target) return;
        
        const item = (e.target as HTMLElement).closest('.cart-item') as HTMLElement;
        const productId = item.dataset.productId;
        if (!productId) return;
        
        if (target.matches('.cart-quantity-increase')) {
            cart[productId]++;
        } else if (target.matches('.cart-quantity-decrease')) {
            cart[productId]--;
            if (cart[productId] <= 0) {
                delete cart[productId];
            }
        } else if (target.matches('.cart-item-remove')) {
            delete cart[productId];
        }
        renderCart();
    };

    const showProductModal = (productId: string | null = null) => {
        productForm.reset();
        const idInput = document.getElementById('product-id') as HTMLInputElement;
        if (productId) {
            const product = products.find(p => p.id == Number(productId));
            if (!product) return;
            productModalTitle.textContent = 'Edit Product';
            idInput.value = product.id.toString();
            (document.getElementById('product-name') as HTMLInputElement).value = product.name;
            (document.getElementById('product-category') as HTMLInputElement).value = product.category;
            (document.getElementById('product-price') as HTMLInputElement).value = product.price.toString();
            (document.getElementById('product-image-url') as HTMLInputElement).value = product.imageUrl;
            (document.getElementById('product-stock') as HTMLInputElement).value = product.stock.toString();
        } else {
            productModalTitle.textContent = 'Add Product';
            idInput.value = '';
        }
        productModal.classList.remove('hidden');
    };

    const handleProductFormSubmit = (e: Event) => {
        e.preventDefault();
        const formData = new FormData(productForm);
        const productData: Product = {
            id: formData.get('product-id') ? Number(formData.get('product-id')) : Date.now(),
            name: String(formData.get('product-name') || ''),
            category: String(formData.get('product-category') || ''),
            price: Number(formData.get('product-price') || 0),
            imageUrl: String(formData.get('product-image-url') || ''),
            stock: Number(formData.get('product-stock') || 0),
        };
        
        const existingIndex = products.findIndex(p => p.id === productData.id);
        if (existingIndex > -1) {
            products[existingIndex] = productData;
        } else {
            products.unshift(productData);
        }
        
        productModal.classList.add('hidden');
        renderProducts();
    };


    // --- EVENT LISTENERS ---
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    searchInput.addEventListener('input', handleSearch);
    paginationControls.addEventListener('click', handlePagination);
    productListContainer.addEventListener('click', handleProductListClick);
    
    // Cart sidebar
    cartToggleBtn.addEventListener('click', () => cartSidebar.classList.add('open'));
    cartCloseBtn.addEventListener('click', () => cartSidebar.classList.remove('open'));
    cartItemsContainer.addEventListener('click', handleCartItemsClick);
    checkoutBtn.addEventListener('click', () => {
        if(Object.keys(cart).length > 0) {
            alert('Order placed successfully! (This is a demo)');
            cart = {};
            renderCart();
            cartSidebar.classList.remove('open');
        }
    });

    // Product Modal
    addProductBtn.addEventListener('click', () => showProductModal());
    productModalCloseBtn.addEventListener('click', () => productModal.classList.add('hidden'));
    productForm.addEventListener('submit', handleProductFormSubmit);
    
    // --- INITIALIZATION ---
    updateUIForUser();
});
