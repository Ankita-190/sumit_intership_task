// =====================================
// DEFAULT PRODUCTS
// =====================================

let defaultProducts = [

    {
        name: "Wooden Chair",
        category: "Chair",
        price: 2500,
        image: "images/chair.jpg"
    },

    {
        name: "Dining Table",
        category: "Table",
        price: 8000,
        image: "images/dining_table.jpg"
    },

    {
        name: "Comfort Sofa",
        category: "Sofa",
        price: 15000,
        image: "images/sofa.jpg"
    },

    {
        name: "King Size Bed",
        category: "Bed",
        price: 20000,
        image: "images/bed.jpg"
    }

];


// =====================================
// SAVE DEFAULT PRODUCTS
// =====================================

if (!localStorage.getItem("products")) {

    localStorage.setItem(
        "products",
        JSON.stringify(defaultProducts)
    );

}


// =====================================
// CATEGORY DISCOUNT
// =====================================

function getCategoryDiscount(category) {

    if (category === "Chair") {

        return 5;

    }

    if (category === "Table") {

        return 8;

    }

    if (category === "Sofa") {

        return 10;

    }

    if (category === "Bed") {

        return 12;

    }

    return 0;

}


// =====================================
// DISPLAY PRODUCTS
// =====================================

function displayProducts() {

    let productContainer =
        document.getElementById("productContainer");

    if (!productContainer) {
        return;
    }


    productContainer.innerHTML = "";


    let products =
        JSON.parse(
            localStorage.getItem("products")
        ) || [];


    if (products.length === 0) {

        productContainer.innerHTML = `

            <div class="no-products">

                <h2>
                    No Products Available
                </h2>

            </div>

        `;

        return;
    }


    products.forEach(function(product, index) {


        // =====================================
        // CALCULATE DISCOUNT
        // =====================================

        let normalDiscount = 10;

        let categoryDiscount =
            getCategoryDiscount(product.category);

        let totalDiscount =
            normalDiscount + categoryDiscount;


        // Original Price
        let originalPrice =
            Number(product.price);


        // Discount Amount
        let discountAmount =
            originalPrice * totalDiscount / 100;


        // Final Price
        let finalPrice =
            originalPrice - discountAmount;


        // =====================================
        // PRODUCT CARD
        // =====================================

        productContainer.innerHTML += `

            <div
                class="product"
                data-category="${product.category}">

                <div class="product-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}">

                </div>


                <h2>
                    ${product.name}
                </h2>


                <p>
                    Category: ${product.category}
                </p>


                <p class="category-discount">

                    Category Discount:
                    ${categoryDiscount}%

                </p>


                <p class="discount">

                    ${totalDiscount}% OFF

                </p>


                <p class="original-price">

                    Original Price:

                    <del>
                        ₹${originalPrice.toLocaleString("en-IN")}
                    </del>

                </p>


                <h3 class="final-price">

                    ₹${finalPrice.toLocaleString("en-IN")}

                </h3>


                <button
                    onclick="addToCart(
                        '${product.name}',
                        '${product.category}',
                        ${finalPrice},
                        '${product.image}'
                    )">

                    Add to Cart

                </button>


                <button
                    onclick="viewProduct(
                        '${product.name}',
                        '${product.category}',
                        ${finalPrice},
                        '${product.image}'
                    )">

                    View Details

                </button>

            </div>

        `;

    });

}


// =====================================
// CATEGORY FILTER
// =====================================

function filterProducts(category) {

    let products =
        document.querySelectorAll(".product");


    products.forEach(function(product) {

        let productCategory =
            product.getAttribute("data-category");


        if (
            category === "All" ||
            productCategory === category
        ) {

            product.style.display = "block";

        } else {

            product.style.display = "none";

        }

    });

}


// =====================================
// PRODUCT SEARCH
// =====================================

function searchProducts() {

    let searchText =
        document
        .getElementById("searchInput")
        .value
        .toLowerCase();


    let products =
        document.querySelectorAll(".product");


    products.forEach(function(product) {

        let productName =
            product
            .querySelector("h2")
            .innerText
            .toLowerCase();


        if (
            productName.includes(searchText)
        ) {

            product.style.display = "block";

        } else {

            product.style.display = "none";

        }

    });

}


// =====================================
// ADD TO CART
// =====================================

function addToCart(
    name,
    category,
    price,
    image
) {

    let cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    let existingProduct =
        cart.find(function(product) {

            return product.name === name;

        });


    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        cart.push({

            name: name,

            category: category,

            price: price,

            image: image,

            quantity: 1

        });

    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    window.location.href =
        "cart.html";

}


// =====================================
// PRODUCT DETAILS
// =====================================

function viewProduct(
    name,
    category,
    price,
    image
) {

    localStorage.setItem(
        "productName",
        name
    );


    localStorage.setItem(
        "productCategory",
        category
    );


    localStorage.setItem(
        "productPrice",
        price
    );


    localStorage.setItem(
        "productImage",
        image
    );


    window.location.href =
        "product-details.html";

}


// =====================================
// LOAD PRODUCTS
// =====================================

displayProducts();