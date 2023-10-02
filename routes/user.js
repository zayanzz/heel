var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
const userHelper = require('../helpers/user-helpers');


const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/auth/login')
  }
}

/* GET home page. */


router.get('/', async function (req, res, next) {
  let user = req.session.user;
  // console.log(user);
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);

  }
  productHelper.getAllProducts().then((products) => { // Make the callback function async
    // console.log(products);

    res.render('user/view-products', { products, user, cartCount });
  });
});




router.get('/auth/login', (req, res) => {

  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.userLoginErr })
    req.session.userLoginErr = false
  }

});

router.get('/auth/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/auth/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    // let responses = req.body
    // console.log( responses);
    req.session.user = response
    req.session.userLoggedIn = true

    res.redirect('/admin')
  })
})


router.post('/auth/login', async (req, res) => {
  const usernamedb = "zayann";
  const passworddb = 123;
  const { Username, Password } = await req.body;
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.userLoggedIn = true

      res.redirect('/')
    } else if (usernamedb === Username && passworddb === parseInt(Password)) {

      res.redirect('/admin')
      //       console.log("login success", req.body);
    }

    else {
      req.session.userLoginErr = "invalid username or pasword"
      res.redirect('/auth/login')

    }
  })
})

router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/auth/login')
})

router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id)
  let totalValue = 0
  if (products.length > 0) {
    totalValue = await userHelper.getTotalAmount(req.session.user._id)
  }

  // console.log('***' + req.session.user._id);
  let user = req.session.user._id
  res.render('user/cart', { products, user, totalValue })
})

router.get('/add-cart/:id', (req, res) => {
  console.log("api call");
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
}) 

router.post('/change-product-quantity', (req, res, next) => {
  // console.log(req.body);
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.body.user)

    res.json(response)
  })
})



router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/place-order', { total, user: req.session.user })
})

router.post('/place-order', async (req, res) => {
  let products = await userHelper.getCartProductList(req.body.userId)
  let totalPrice = await userHelper.getTotalAmount(req.body.userId)
  userHelper.placeOrder(req.body, products, totalPrice).then((orderId) => {
    console.log(orderId);
    if (req.body['payment-method'] === 'COD') {
      res.json({ CODSuccess: true })
    } else {
      userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
        // res.json(response)
      })
    }

  })
  console.log(req.body);
  res.render('user/place-order')

})


//order success

router.get('/order-success', (req, res) => {
  res.render('user/order-success', { user: req.session.user })
})

router.get('/orders', async (req, res) => {
  let orders = await userHelper.getUserOrders(req.session.user._id)
  res.render('user/orders', { user: req.session.user, orders })
})

router.get('/view-order-products/:id', async (req, res) => {
  let products = await userHelper.getOrderProducts(req.params.id)
  res.render('user/view-order-products', { user: req.session.user, products })
})


router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelper.verifyPayments(req.body).then(() => {
    user.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("pay ment success");
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })
  })
})

router.get('/views/:id', (req, res,) => {

  let product = userHelper.addTCart(req.params.id)
  console.log("ddeded",product);

    res.render('user/views-product-details',{product})

})  

router.get('/views', (req, res,) => {

  let product = userHelper.addTCart(req.params.id)
  console.log("ddeded",product);

    res.render('user/views-product-details',{product})

})  


module.exports = router;