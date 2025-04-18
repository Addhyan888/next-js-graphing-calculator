import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, dimension } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    let systemPrompt = ""
    if (dimension === "2d") {
      systemPrompt = `You are a mathematical function generator. 
      Given a description, generate a valid JavaScript mathematical expression for a 2D function (y = f(x)).
      Only return the expression itself, nothing else. Use standard JavaScript Math functions and operators.
      For example, if asked for "a sine wave", return "Math.sin(x)".`
    } else {
      systemPrompt = `You are a mathematical function generator. 
      Given a description, generate a valid JavaScript mathematical expression for a 3D function (z = f(x,y)).
      Only return the expression itself, nothing else. Use standard JavaScript Math functions and operators.
      For example, if asked for "a simple hill", return "x*x + y*y".`
    }

    let result = ""
    let apiResponse

    try {
      // Use Groq API
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Groq API error:", errorText)
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
      }

      apiResponse = await response.json()

      // Validate API response structure
      if (!apiResponse || !apiResponse.choices || !apiResponse.choices[0] || !apiResponse.choices[0].message) {
        console.error("Invalid API response structure:", apiResponse)
        throw new Error("Invalid API response structure")
      }

      result = apiResponse.choices[0].message.content.trim()

      // Clean up the result to ensure it's just the expression
      result = result.replace(/```[a-z]*\n?/g, "").replace(/```/g, "")
      result = result.replace(/^`|`$/g, "")

      return NextResponse.json({ expression: result })
    } catch (apiError) {
      console.error("API call error:", apiError)

      // Provide a fallback expression based on the dimension
      const fallbackExpression = dimension === "2d" ? "Math.sin(x)" : "Math.sin(x) * Math.cos(y)"

      return NextResponse.json({
        expression: fallbackExpression,
        error: `Could not generate function with AI: ${apiError instanceof Error ? apiError.message : "Unknown error"}. Using fallback expression instead.`,
      })
    }
  } catch (error) {
    console.error("Error in generate-function route:", error)
    return NextResponse.json(
      {
        expression: "x",
        error: `Failed to process request: ${error instanceof Error ? error.message : "Unknown error"}. Using simple function instead.`,
      },
      { status: 200 }, // Return 200 with fallback to prevent client-side errors
    )
  }
}
