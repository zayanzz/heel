
var db = require('../config/connection');
var collection = require('../config/collections');
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { resolve } = require('express-hbs/lib/resolver');
const Razorpay = require('razorpay');


var instance = new Razorpay({
    key_id: 'rzp_test_RtioPu7PQqwMwe',
    key_secret: '1mdNuu5nLHCYCcTdY5rODDkg'
})


module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                let dataArray = [data];
                // console.log(dataArray);
                resolve(dataArray[0]);
            }).catch((err) => {
                reject(err);
            });
        });
    },


    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Username: userData.Username });
                if (user) {
                    bcrypt.compare(userData.Password, user.Password, (err, result) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            if (result) {
                                console.log("login success");
                                response.user = user
                                response.status = true
                                resolve(response)
                                loginStatus = true;
                            } else {
                                console.log("login failed");
                                resolve({ status: false })
                            }
                            resolve(loginStatus);
                        }
                    });
                } else {
                    console.log("login failed");
                    resolve(loginStatus);
                }
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    },
    addToCart: (productId, userId) => {
        let productObj = {
            item: ObjectId(productId),
            quantity: 1

        }
        console.log("ppppp", productId);
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (userCart) {
                let productExist = userCart.products.findIndex(product => product.item == productId)
                console.log(productExist);
                if (productExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(userId), 'products.item': ObjectId(productId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })

                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(userId) },
                            {

                                $push: {
                                    products: productObj
                                }

                            }
                        ).then((response) => {
                            resolve()
                        })
                }


            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [
                        productObj
                    ]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },

    viewProductDetails: (productId, userId) => {
        let productObj = {
            item: ObjectId(productId),
            quantity: 1
        }
        console.log("sdddcd", productObj);
    },

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }

                },
                {
                    $unwind: '$products'

                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            // console.log(cartItems);
            resolve(cartItems)


        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },

    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)


        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(details.cart) },
                        {
                            $pull: { products: { item: ObjectId(details.product) } }
                        }).then((response) => {
                            resolve({ removeProduct: true })
                        })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }).then((response) => {
                            resolve({ status: true })
                        })
            }




        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }

                },
                {
                    $unwind: '$products'

                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }, {
                    $group: {
                        _id: null, // Group all documents together (no specific criteria)
                        total: {
                            $sum: {
                                $multiply: [
                                    { $toDouble: '$quantity' }, // Convert 'quantity' to a double
                                    { $toDouble: '$product.Price' } // Convert 'product.Price' to a double
                                ]
                            }
                        }
                    }
                }


            ]).toArray()

            const calculatedTotal = total.length === 0 ? 0 : total[0].total;
            resolve(calculatedTotal);


        })
    },

    placeOrder: (order, products, total) => {

        return new Promise((resolve, reject) => {

            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    mobile: order.mobile,
                    address: order.address,
                    pincode: order.pincode
                },
                userId: ObjectId(order.userId),
                paymentMethode: order['payment-method'],
                products: products,
                totalAmount: total,
                status: status,
                date: new Date()

            }
            console.log("this is loger", order, total);
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.userId) })
                console.log(response.insertedId);
                resolve(response.insertedId)

            })
        })
    },



    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            resolve(cart.products)
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: ObjectId(userId) }).toArray()
            resolve(orders)
        })
    },

    getadminOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).find({}).toArray();
            let a = await db.get().collection(collection.ORDER_COLLECTION).findOne({});
            console.log();
            resolve(order)
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }

                },
                {
                    $unwind: '$products'

                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            // console.log(cartItems);
            resolve(orderItems)

        })
    },

    generateRazorpay: (orderId, total) => {
        return new Promise(async (resolve, reject) => {
            console.log(orderId);
            var options = {
                amount: total * 100,
                currency: "INR",
                // receipt:orderId
                receipt: String(orderId)
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(order);
                    resolve(order)
                }
                console.log("ans ", order.amount);
            });
        })
    },
    verifyPayments: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', '1mdNuu5nLHCYCcTdY5rODDkg')

            hmac.update(details['payment[razorpay_order_id'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_payment_id]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: ObjectId(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        }
                    }
                ).then(() => {
                    resolve()
                })
        })
    },

    //     imgloco: (productId) => {
    //         let productObj = {
    //             item: ObjectId(productId),
    //             quantity: 1

    //         }
    //         return new Promise(async (resolve, reject) => {

    //             let ima=  await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id:productObj })
    //             resolve(ima)

    // console.log("heiii",productId);

    //         })
    //     },

    addTCart: (productId, userId) => {
        let productObj = {
            item: ObjectId(productId),
            
        }
       
        console.log("nnnnn", productId);
        console.log("nnnn", productObj);

return new Promise((resolve, reject) => {
    resolve(productId)
}) 

 


    },

}

