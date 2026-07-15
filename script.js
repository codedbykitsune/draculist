// Ürün listesini alacağımız API adresi
const API_URL = "https://dummyjson.com/products";

// HTML elementleri
const productList = document.querySelector("#productList");
const productCount = document.querySelector("#productCount");
const loading = document.querySelector("#loading");
const errorMessage = document.querySelector("#errorMessage");
const modalBody = document.querySelector("#modalBody");
const productModalElement = document.querySelector("#productModal");
const productModalLabel = document.querySelector("#productModalLabel");

// Bootstrap modal nesnesi
const productModal = bootstrap.Modal.getOrCreateInstance(productModalElement);

// API üzerinden ürün listesini getir
async function getProducts() {
    try {
        hideError();

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Ürünler alınamadı.");
        }

        const data = await response.json();
        displayProducts(data.products);
    } catch (error) {
        showError(
            "Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );

        console.error(error);
    } finally {
        loading.classList.add("d-none");
    }
}

//API'den gelen ürünleri Bootstrap kartları olarak göster.
function displayProducts(products) {
    productList.innerHTML = "";

    if (!products || products.length === 0) {
        productCount.textContent = "0 ürün";
        showError("Gösterilecek ürün bulunamadı.");
        return;
    }

    productCount.textContent = `${products.length} ürün`;

    products.forEach(function (product) {
        const productColumn = document.createElement("div");

        // Mobilde 1, tablette 2, masaüstünde 3,
        // geniş ekranlarda 4 kart göster
        productColumn.className = "col-12 col-sm-6 col-lg-4 col-xl-3";

        productColumn.innerHTML = `
            <div class="card product-card">

                <img
                    src="${product.thumbnail}"
                    class="card-img-top product-image"
                    alt="${product.title}"
                >

                <div class="card-body d-flex flex-column">

                    <span
                        class="badge category-badge align-self-start mb-2"
                    >
                        ${formatCategory(product.category)}
                    </span>

                    <h2 class="card-title fs-5">
                        ${product.title}
                    </h2>

                    <div class="mt-auto">

                        <div class="card-price-area mb-2">
                            ${
                                product.discountPercentage > 0
                                    ? `
                                        <span class="original-price">
                                            $${formatPrice(product.price)}
                                        </span>

                                        <span class="discounted-price">
                                            $${calculateDiscountedPrice(
                                                product.price,
                                                product.discountPercentage
                                            )}
                                        </span>

                                        <span class="badge discount-badge">
                                            %${product.discountPercentage.toFixed(2)}
                                        </span>
                                    `
                                    : `
                                        <span class="regular-price">
                                            $${formatPrice(product.price)}
                                        </span>
                                    `
                            }
                        </div>

                        <p class="mb-1">
                            <strong>Puan:</strong>
                            ⭐ ${product.rating}
                        </p>

                        <p class="mb-3">
                            <strong>Stok:</strong>

                            <span class="${getStockClass(product.stock)}">
                                ${product.stock}
                            </span>
                        </p>

                        <button
                            type="button"
                            class="btn detail-button w-100"
                            data-product-id="${product.id}"
                        >
                            Detay
                        </button>

                    </div>
                </div>
            </div>
        `;

        productList.append(productColumn);
    });
}

// Ürün kartlarındaki Detay butonlarını dinle
productList.addEventListener("click", function (event) {
    const detailButton = event.target.closest(".detail-button");

    if (!detailButton) {
        return;
    }

    const productId = detailButton.dataset.productId;

    getProductDetail(productId);
});

// Seçilen ürünün detaylarını API üzerinden getir
async function getProductDetail(productId) {
    // Yeni ürün yüklenirken önceki ürünün başlığını gösterme
    productModalLabel.textContent = "Ürün Detayı";

    showModalLoading();
    productModal.show();

    try {
        const response = await fetch(`${API_URL}/${productId}`);

        if (!response.ok) {
            throw new Error("Ürün detayı alınamadı.");
        }

        const product = await response.json();

        displayProductDetail(product);
    } catch (error) {
        modalBody.innerHTML = `
            <div class="alert alert-danger mb-0">
                Ürün detayları yüklenirken bir hata oluştu.
            </div>
        `;

        console.error(error);
    }
}

// Seçilen ürünün detaylarını modal içinde göster.

function displayProductDetail(product) {
    productModalLabel.textContent = product.title;

    const brandText = product.brand || "Markasız";

    const productImage =
        product.images && product.images.length > 0
            ? product.images[0]
            : product.thumbnail;

    const tagsHtml = 
        product.tags && product.tags.length > 0
            ? product.tags
                .map(function (tag) {
                    return `
                        <span class="badge tag-badge me-1 mb-1">
                            ${tag}
                        </span>
                    `;
                })
                .join("")
            : "";

    modalBody.innerHTML = `
        <div class="row g-4">

            <div class="col-md-5">
                <img
                    src="${productImage}"
                    class="product-detail-image"
                    alt="${product.title}"
                >
            </div>

            <div class="col-md-7">

                <span class="badge category-badge mb-2">
                    ${formatCategory(product.category)}
                </span>

                <h3>${product.title}</h3>

                <p class="modal-description">
                    ${product.description}
                </p>

                <div class="product-price-area mb-3">

                    ${
                        product.discountPercentage > 0
                            ? `
                                <span class="product-original-price">
                                    $${formatPrice(product.price)}
                                </span>

                                <span class="product-detail-price">
                                    $${calculateDiscountedPrice(
                                        product.price,
                                        product.discountPercentage
                                    )}
                                </span>

                                <span class="badge discount-badge">
                                    %${product.discountPercentage.toFixed(2)}
                                    indirim
                                </span>
                            `
                            : `
                                <span class="product-detail-price">
                                    $${formatPrice(product.price)}
                                </span>
                            `
                    }

                    <span class="product-detail-rating">
                        ⭐ ${product.rating}
                    </span>

                </div>

                <ul class="list-group product-detail-list">

                    <li class="list-group-item">
                        <strong>Marka</strong>
                        <span>${brandText}</span>
                    </li>

                    <li class="list-group-item">
                        <strong>Stok</strong>

                        <span class="${getStockClass(product.stock)}">
                            ${product.stock}
                        </span>
                    </li>

                    <li class="list-group-item">
                        <strong>SKU</strong>
                        <span>${product.sku}</span>
                    </li>

                    <li class="list-group-item">
                        <strong>Durum</strong>
                        <span>${product.availabilityStatus}</span>
                    </li>

                    <li class="list-group-item">
                        <strong>Kargo</strong>
                        <span>${product.shippingInformation}</span>
                    </li>

                    <li class="list-group-item">
                        <strong>Garanti</strong>
                        <span>${product.warrantyInformation}</span>
                    </li>

                    <li class="list-group-item">
                        <strong>İade</strong>
                        <span>${product.returnPolicy}</span>
                    </li>

                </ul>

                ${
                    tagsHtml
                        ? `
                            <div class="mt-3">
                                ${tagsHtml}
                            </div>
                        `
                        : ""
                }

            </div>
        </div>
    `;
}

// Modal içindeki yükleniyor görünümünü oluştur
function showModalLoading() {
    modalBody.innerHTML = `
        <div class="text-center py-5">

            <div class="spinner-border" role="status">
                <span class="visually-hidden">
                    Yükleniyor...
                </span>
            </div>

            <p class="mt-3 mb-0">
                Ürün detayları yükleniyor...
            </p>

        </div>
    `;
}

// Kategori adındaki tireleri kaldır ve kelimelerin ilk harflerini büyüt.
function formatCategory(category) {
    if (!category) {
        return "Kategori yok";
    }

    return category
        .split("-")
        .map(function (word) {
            return (
                word.charAt(0).toUpperCase() +
                word.slice(1)
            );
        })
        .join(" ");
}

// Fiyatı iki ondalık basamak göster.
function formatPrice(price) {
    return Number(price).toFixed(2);
}

// Ürünün indirimli fiyatını hesapla.
function calculateDiscountedPrice(
    price,
    discountPercentage
) {
    const discountedPrice =
        price - (price * discountPercentage / 100);

    return discountedPrice.toFixed(2);
}

// Stok 5 veya daha azsa kiremit, 6 ile 25 arasındaysa turuncu, 
// 25'ten fazlaysa yeşil sınıf döndür.
function getStockClass(stock) {
    if (stock <= 5) {
        return "critical-stock";
    }

    if (stock <= 25) {
        return "medium-stock";
    }

    return "high-stock";
}

// Sayfadaki hata mesajını göster.
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("d-none");
}

// Sayfadaki hata mesajını gizle
function hideError() {
    errorMessage.textContent = "";
    errorMessage.classList.add("d-none");
}

// Sayfa açıldığında ürünleri getir
getProducts();