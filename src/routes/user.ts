import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { SigninInput, SignupInput } from "@ankityadav0001/blog-common";

export const userRouter=new Hono<{
    Bindings:{
      DATABASE_URL:string,
      JWT_SECRET:string,
    },
  }>();

userRouter.post('/signup',async (c) => {
    const body = await c.req.json();
    const {success}=SignupInput.safeParse(body);
    if(!success){
     c.status(411);
    return c.json({
      message:("Inputs are not correct")
    }) }

     const prisma = new PrismaClient({
       datasourceUrl: c.env.DATABASE_URL,
   }).$extends(withAccelerate())
   
   
    try {
     const user= await prisma.user.create({
       data:{
         email:body.email,
         password:body.password,
         name:body.name
       }
      })
      const jwt = await sign({
       id:user.id,
      },c.env.JWT_SECRET)
      return c.text(jwt)
    }
     catch (error) {
     c.status(409);
     return c.text('Invalid')
      }
      })
   
   userRouter.post('/signin',async (c) => {
     const body = await c.req.json();
     const {success}=SigninInput.safeParse(body);
     if(!success){
      c.status(411);
     return c.json({
       message:("Inputs are not correct")
     }) }
     const prisma = new PrismaClient({
       datasourceUrl: c.env.DATABASE_URL,
   }).$extends(withAccelerate())
   
   
    try {
     const user= await prisma.user.findFirst({
      where:{
         email:body.email,
         password:body.password,
        
       }
      })
   if(!user){
     c.status(403)   //unauthorised 
     return c.json({
       message: "Incorrect Email or Password"
     })
   }
       
      const jwt = await sign({
       id:user.id,
      },c.env.JWT_SECRET)
      return c.text(jwt)
    }
     catch (error) {
     c.status(409);
     return c.text('Invalid')
      }
   })
   