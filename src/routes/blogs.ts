import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { createBlogInput, updateBlogInput } from "@ankityadav0001/blog-common";
export const blogRouter =new Hono<{
    Bindings:{
      DATABASE_URL:string,
      JWT_SECRET:string,
    },
    Variables:{
      userId :string;
    }
  }>();


  blogRouter.use("/*",async(c,next)=>{
    const authheader =c.req.header("authorization")||"";

try {
    
  const user = await verify (authheader,c.env.JWT_SECRET);
  if (user){
c.set("userId" , user.id);
await next();
}else{
return c.json({
  message:"you are not logged in"
})
}
}
 catch (e) {
  c.status(403)
  return c.json({
    message:("you are not logged in yet")
  })
}
 })
blogRouter.post("/",async(c)=>{
  const body = await c.req.json();
  const {success}=createBlogInput.safeParse(body);
  if(!success){
   c.status(411);
  return c.json({
    message:("Inputs are not correct")
  }) }
  const authorId= c.get("userId")
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

const post =await prisma.post.create({
  data:{
    title:body.title,
   content :body.content ,
   authorId:authorId, 
  }
})


return c.json({
  id:post.id
})
})

blogRouter.put("/",async (c)=>{

  const body = await c.req.json();
  const {success}=updateBlogInput.safeParse(body);
  if(!success){
   c.status(411);
  return c.json({
    message:("Inputs are not correct")
  }) }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

const post =await prisma.post.update({
  where:{
    id:body.id,
  },
    data:{
    title:body.title,
   content :body.content ,
  }
})
return c.json({
  id:post.id
})
});


 

 //add pagination here 
 blogRouter.get("/bulk",async(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

const  post= await prisma.post.findMany();


return c.json({
post
})
})
                


 blogRouter.get("/:id",async (c)=>{
  const id=c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

try{
const post =await prisma.post.findFirst({
  where:{
    id:id,
  },
})
return c.json({
  post
});
}catch(e){
  c.status(411);
  return c.json({
    message:("erroe in fetching the posts")
  });
}
 })
 