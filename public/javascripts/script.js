// const { response } = require("express")


function addToCart(productId) {
    $.ajax({
        url: '/add-cart/' + productId,
        method: 'get',
        success: (response) => {
            if (response.status) {

                let count = $('#cart-count').html()
                count = parseInt(count) + 1
                $("#cart-count").html(count)

            }

        }
    })
}

function changeQuantity(cartId, productId,userId, count) {
    let quantity = parseInt(document.getElementById(productId).innerHTML)
    count = parseInt(count)
console.log(userId);
    $.ajax({
        url: '/change-product-quantity',
        data: {
            user:userId,
            cart: cartId,
            product: productId,
            count: count,
            quantity:quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert("Product removed from cart")
                location.reload()
            } else {
console.log(response);
                document.getElementById(productId).innerHTML = quantity + count
                document.getElementById('total').innerHTML=response.total
            }
        } 
    })
}


