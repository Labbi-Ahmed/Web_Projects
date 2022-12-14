
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
    space: "21kap98dqw1u",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "-tTM2V-1BQ_OMhEfl1eWwuahqQN4l8w--hHEAr1lCIs"
});

// variables 

const cartBtn = document.querySelector('.cart-btn');
const cartItems = document.querySelector('.cart-items');
const cartOverlay = document.querySelector('.cart-overlay');
const cartDOM = document.querySelector('.cart');
const closeCartBtn = document.querySelector('.close-cart');
const cartContent = document.querySelector('.cart-content');
const clearCartBtn = document.querySelector('.clear-cart');
const cartTotal = document.querySelector('.cart-total');
const productsDOM = document.querySelector('.products-center');
const shopNow = document.querySelector('.shop-now'); 
const bagBtn = document.querySelector('.bag-btn'); 
const cartRemoveItem = document.querySelector('.remove-item'); 
const cartChevronUp = document.querySelector('.fa-chevron-up'); 
const cartChevronDown = document.querySelector('.fa-chevron-down'); 


// cart
let cart = [];
// buttons
let buttonsDOM = [];


// getting the products
class Products {
    async getProducts(){
        try{
            let contentful = await client.getEntries({
                content_type: "comfyHouseProducts"
            });
            let result = await fetch('products.json');
            let data = await result.json();

            let products = contentful.items;
            products = products.map(item =>{
                const { title,price } = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price , id, image};
            });
            return products;
        }catch(error){
            console.log(error);
        }
    }
}


// display products
class UI {
// active the shopNow button

    // display products 
    displayProducts(products){
        let result = "";
        products.forEach(product => {
            result += `
            <!-- single product -->
            <article class="product">
            <div class="img-container">
                <img
                    src=${product.image} alt="Product"
                    class="product-img"
                />
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                    Add to cart
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
            </article>
            <!-- end single products -->
            `;
            
        });
            productsDOM.innerHTML = result;
    }

    getBagButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            }
            
            button.addEventListener('click',(event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get produc from products
                let cartItem = {...Storage.getProduct(id),
                amount:1};
                // add produc to the cart
                cart = [...cart,cartItem];
                console.log(cart);
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // display cart item
                    this.addCartItem(cartItem);
                // show the cart
                    this.showCart();
                });
        })
    }

    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="Product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id = ${item.id}>Remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id = ${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id = ${item.id}></i>
        </div>
        `;
        cartContent.appendChild(div);
        
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click',this.showCart);
        closeCartBtn.addEventListener('click',this.hideCart);
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    }
    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic(){
        // clear cart button
        clearCartBtn.addEventListener('click', () =>{
            this.clearCart();
        });

        // cart functionality
        cartContent.addEventListener('click', event => {
            
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find( item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerHTML  = tempItem.amount;

            }else if(event.target.classList.contains('fa-chevron-down')){
                let subtractAmount = event.target;
                let id = subtractAmount.dataset.id;
                let tempItem = cart.find( item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    subtractAmount.previousElementSibling.innerHTML  = tempItem.amount;
                }
                else {
                    cartContent.removeChild(subtractAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
            // else if(event.target.classList.contains(''))
        });
    }

    clearCart(){
        let cartItems = cart.map(item=> item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id){
        
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
    }
    
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }

    shopNowProducts(){
        
    }
}



// local storage
class Storage {
    static savePeoducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(){
        localStorage.setItem('cart',JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart')? JSON.parse
        (localStorage.getItem('cart')): [];
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    const ui = new UI();
    const products = new Products();
    // setup app
    ui.setupAPP();
    //  get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.savePeoducts(products);
    }).then(()=>{
        ui.getBagButtons();
        ui.shopNowProducts();
        ui.cartLogic();
    });
});

