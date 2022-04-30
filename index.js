const { timeStamp } = require("console");
const express= require("express");
const mongoose= require("mongoose");

const app = express();
app.use(express.json());

const SectionSchema = new mongoose.Schema({
        body:{
            type:String,
            required:true
        }
},
{timeStamps:true}
);

const Section = mongoose.model("section",SectionSchema);

const booksSchema = new mongoose.Schema({
    body:{
        type:String,
        required:true
    },
    sectionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"section",
        required:true
    },
    authorId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"author",
        required:true
    }]
});

const Book =mongoose.model("book",booksSchema);

const CheckedOutSchema = new mongoose.Schema({
    bookId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"book",
        required:true
    },
    checkedOutTime:{
        type:String,
        required:true
    },
    checkedInTime:{
        type:String,
        required:true
    }

});

const Checkout =mongoose.model("checkout",CheckedOutSchema);

const AuthorSchema = new mongoose.Schema({
   
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
   
    bookId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"book",
        required:true
    }]
});


const Author =mongoose.model("author",AuthorSchema);

// ---------SECTION-CRUD---------------------------------------------------------//

app.get("/sections/:sectionId/books",async (req,res)=>{
            try {
                const sections = await Book.find({sectionId:req.params.sectionId}).lean().exec();
                    
                return res.status(200).send({sections:sections});
            } catch (error) {
                res.status(500).send(error);
            }
})

app.post("/sections",async (req,res)=>{
    try {
       
        const sections = await Section.create(req.body);
        
        return res.status(201).send({sections:sections});
    } catch (error) {
        res.status(500).send(error);
    }
})

// ---------------------------------BOOKS-CRUD--------------------------------//
app.get("/books/:id",async (req,res)=>{
    try {
       
        var books = await Book.findById(req.params.id);
        
        return res.status(200).send({books:books});
    } catch (error) {
        res.status(500).send(error);
    }
})
app.get("/books",async (req,res)=>{
    try {
        var books = await Book.find({});
    
        return res.status(200).send({books:books});
    } catch (error) {
        res.status(500).send(error);
    }
})
app.post("/books",async (req,res)=>{

    try {
        
        var books = await Book.create(req.body);
        
        await Author.updateMany({"_id":books.bookId},{$push:{bookId:books._id}})
        return res.status(201).send({books:books});
    } catch (error) {
        res.status(500).send(error);
    }
})
app.patch("/books/:id",async (req,res)=>{
    try {
        var books = await Book.findByIdAndUpdate(req.params.id,req.body,{new:true});

        return res.status(201).send({books:books});
    } catch (error) {
        res.status(500).send(error);
    }
})

// ----------------------------AUTHOR-CRUD-------------------------------//

app.get("/author/:id",async (req,res)=>{
    try {
        const author = await Author.findById(req.params.id);

        return res.status(200).send({author:author});
    } catch (error) {
        res.status(500).send(error);
    }
})
app.post("/author",async (req,res)=>{
    try {
        
        const authors = await Author.create(req.body);
        return res.status(201).send({authors:authors});
    } catch (error) {
        res.status(500).send(error);
    }
})
app.get("/author/:authId/books",async (req,res)=>{
    try {
        const author = await Book.find({authId:[req.params.authId]}).lean().exec();
        
        return res.status(200).send({author:author});
    } catch (error) {
        res.status(500).send(error);
    }
});
// ---------------Crud for checkOut-------------------------//

app.post("/checkout",async (req,res)=>{
    try {
        const checkout=await Checkout.create(req.body);
        return res.status(201).send({checkout:checkout});
    } catch (error) {
        res.status(500).send(error);
    }
})
app.get("/checkout/:sectionId/books",async (req,res)=>{
    try {
        var checkOutbooks = await Checkout.find({checkedOutTime:"null",checkedInTime:"null"}).exec();
        var check = checkOutbooks.map(function(e){
            return e.bookId;
        })
        var books= await Book.find({_id:check,sectionId:req.params.sectionId})
        
        return res.status(200).send({books:books});
    } catch (error) {
        res.status(500).send(error);
    }
});



app.listen(5000, async ()=>{
    try {
        await connect();
    } catch (error) {
        console.log(error)
    }
    console.log("listening on port 5000")
});

const connect=()=>{
  return  mongoose.connect("mongodb://localhost:27017/library");
}
