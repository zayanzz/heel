var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
const userHelper = require('../helpers/user-helpers');
// const productHelpers = require('../helpers/product-helpers');


const verifyLogin = (req, res, next) => {
  if (req.session.admin.loggedIn) {
    next()
  } else {
    res.redirect('admin/auth/login')
  }
}



router.get('/', function (req, res, next) {
  // let products = [
  productHelper.getAllProducts().then((products) => {
    console.log(products);
    res.render('admin/view-products', { admin: true, products })
  })
  // ]




});
router.get('/add-product', (req, res) => {
  res.render('admin/add-product')
})
router.post('/add-product', (req, res,) => {
  console.log(req.body);
  console.log(req.files.Image);
  productHelper.addProduct(req.body, (id) => {
    let image=req.files.Image
    console.log(id);
    image.mv('./public/product-images/'+id+'.jpg',(err,doene)=>{
      if(!err){
        res.render("admin/add-product")
      }else{
        console.log(err);
      }
    })
    
  })
})

router.get('/delete-product/:id', (req, res) => {
  let productId = req.params.id
  console.log(productId);
  productHelper.deleteProduct(productId).then((response) => {
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product', { product })
})
// router.post('/edit-product/:id', (req, res) => {
//   console.log(req.params.id);
//   let id = req.params.id
//   productHelpers.updateProduct(req.params.id, req.body).then(() => {
//     res.redirect('/admin') 
//     if (req.files.Image) {
//       let image = req.files.Image
//       image.mv('./public/product-images/' + id + '.jpg')
//     }
//   })
// })
router.post('/edit-product/:id', (req, res) => {
  console.log(req.params.id);
  let id = req.params.id
  productHelper.updateProduct(req.params.id, req.body).then(() => {
    if (req.files && req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + id + '.jpg')
    }
    res.redirect('/admin') 
  })
})

// router.get('/admin/auth/login', (req, res) => {
//   if (req.session.admin) {
//     res.redirect('/')
//   } else {
//     res.render('admin/login', { "loginErr": req.session.adminLoginErr })
//     req.session.userLoginErr = false
//   }

// });




router.get('/orders',async (req, res) => {
  
  let orders = await userHelper.getadminOrders()
  
  // console.log("edddcrc",user);
  res.render('admin/view-orders', { orders })
  // res.render('admin/add-product')
})


module.exports = router;
