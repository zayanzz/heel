$("#checkout-form").submit((e) => {
  e.preventDefault()
  $.ajax({
    url: '/place-order',
    method: 'post',
    data: $('#checkout-form').serialize(),
    success: (response) => {
      alert(response)
      if (response.CODSuccess) {
        location.href = '/order-success'
      } else {
        razorpayPayment(response)
      }
    }

  })
})

function razorpayPayment(order) {


var options = {
  
    "key": "rzp_test_RtioPu7PQqwMwe", // Enter the Key ID generated from the Dashboard
    "amount": 1333 *100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Braitenx", //your business name
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
      "handler": function (response) {
      // alert(response.razorpay_payment_id);
      // alert(response.razorpay_order_id);
      // alert(response.razorpay_signature);
      verifyPayment(response, order)
    },
    "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
        "name": "Gaurav Kumar", //your customer's name
        "email": "gaurav.kumar@example.com",
        "contact": "9000090000" //Provide the customer's phone number for better conversion rates 
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    }
};
  var rzp1 = new Razorpay(options);
  rzp1.open();
  // console.log("ansesss ",order.amount);
}

function verifyPayment(payment, order) {
  $.ajax({
    url: '/verify-payment',
    data: {
      payment,
      order
    },
    method: 'post',
    success:(response)=>{
      if(response.status){
       alert("payment failed")
      }else{
         location.href = '/order-success'
      }
    }
  })
}

