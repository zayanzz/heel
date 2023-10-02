let currentIndex = 0;
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.querySelector(".dots-container");
let currentNumber = 1;
const numberDisplay = document.getElementById("number");
const priceDisplay = document.getElementById("price");
const lessThanButton = document.getElementById("lessThanButton");
const pricePerUnit = 123; // Set the price per unit

function updatePrice() {
    const quantity = parseInt(numberDisplay.textContent);
    const totalPrice = pricePerUnit * quantity;
    priceDisplay.textContent = `$${totalPrice}`;
}

function showSlide(index) {
    const slideWidth = slides[index].clientWidth;
    const translateX = -index * slideWidth;
    document.querySelector(".slider").style.transform = `translateX(${translateX}px)`;
    updateDots();
}

function createDots() {
    slides.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        dot.addEventListener("click", () => {
            currentIndex = i;
            showSlide(currentIndex);
        });
        dotsContainer.appendChild(dot);
    });
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, i) => {
        if (i === currentIndex) {
            dot.classList.add("slider-dot");
        } else {
            dot.classList.remove("slider-dot");
        }
    });
}

createDots();
showSlide(currentIndex);


 
function incrementNumber() {
    currentNumber++;
    numberDisplay.textContent = currentNumber;
    updatePrice();
    if (currentNumber === 1) {
        lessThanButton.disabled = true;
    } else if (currentNumber === 10) {
        greatThanButton.disabled = true;
    } else if (currentNumber === 9) {
        greatThanButton.disabled = false;
    } else {
        lessThanButton.disabled = false;
    }
}

function decrementNumber() {
    currentNumber--;
    numberDisplay.textContent = currentNumber;
    updatePrice();
    if (currentNumber === 1) {
        lessThanButton.disabled = true;
    } else if (currentNumber === 10) {
        greatThanButton.disabled = true;
    } else if (currentNumber === 9) {
        greatThanButton.disabled = false;
    } else {
        lessThanButton.disabled = false;
    }
}


  
updatePrice();

    