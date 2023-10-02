
const { resolve } = require('express-hbs/lib/resolver');
var db = require('../config/connection')
var collection = require('../config/collections');
// const { response } = require('../app');
var objectId = require('mongodb').ObjectID
module.exports = {
    addProduct: (product, callback) => {
        // console.log(product);
    
        db.get().collection('product').insertOne(product).then((data) => {
            if (data && data) {
                // console.log(data);
                callback(data.insertedId);
            } else {
                // Handle the case where data.ops or data.ops[0] is undefined
                console.error("Failed to insert product.");
                callback(null); // You can pass null or an error object here
            }
        }).catch((error) => {
            console.error("Error inserting product:", error);
            callback(null); // Handle the error and pass null or an error object
        });
    }
    ,
   
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(productId) }).then((response) => {
                // console.log(response);
                resolve(response)


            })
        })
    },

    getProductDetails:(productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(productId,ProductDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(productId)},{
                $set:{
                    Name:ProductDetails.Name,
                    Category:ProductDetails.Category,
                    Description:ProductDetails.Description,

                    Price:ProductDetails.Price,
            
                }
            }).then((response)=>{
                resolve()
            })
        }) 
    },
    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .deleteOne({_id:objectId(productId) })
                .then((response) => {
                    console.log(response);
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

  


}
// .ops[0]._id
