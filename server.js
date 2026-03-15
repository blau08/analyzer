import express from "express"

const app = express()

app.use(express.json())

app.post("/analyze", async (req,res) => {

const {website,industry,pain}=req.body

const prompt = `
Analyze this business and suggest AI automation opportunities.

Website: ${website}
Industry: ${industry}
Main problem: ${pain}

Create a short AI strategy report including:

1 automation opportunities
2 internal AI tools
3 marketing automation ideas
4 efficiency improvements
`

const response = await fetch("https://api.openai.com/v1/chat/completions",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`
},

body:JSON.stringify({

model:"gpt-4o-mini",

messages:[
{role:"user",content:prompt}
]

})

})

const data = await response.json()

res.json({
report:data.choices[0].message.content
})

})

app.get("/",(req,res)=>{
res.send("Founders Lab API running")
})

app.listen(3000,()=>{
console.log("Server running")
})
