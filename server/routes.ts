import type { Express } from "express";
import { createServer, type Server } from "http";
import { searchRequestSchema, type SearchResponse } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Search endpoint that proxies to OpenRouter API (using DeepSeek model)
  app.post("/api/search", async (req, res) => {
    try {
      // Validate request body
      const { query } = searchRequestSchema.parse(req.body);
      
      // Get API key from environment variables
      const apiKey = process.env.DEEPSEEK_API_KEY || process.env.API_KEY || "";
      
      if (!apiKey) {
        return res.status(500).json({ 
          message: "API key not configured. Please set DEEPSEEK_API_KEY in environment variables." 
        });
      }

      // Construct prompt for OpenRouter API to get structured response
      const prompt = `Please provide a comprehensive answer to the following question and suggest related questions with their answers. Format your response as JSON with the following structure:

{
  "direct_answer": "Your detailed answer here",
  "people_also_ask": [
    {
      "question": "Related question 1",
      "answer": "Brief answer to question 1"
    },
    {
      "question": "Related question 2", 
      "answer": "Brief answer to question 2"
    },
    {
      "question": "Related question 3",
      "answer": "Brief answer to question 3"
    },
    {
      "question": "Related question 4",
      "answer": "Brief answer to question 4"
    },
    {
      "question": "Related question 5",
      "answer": "Brief answer to question 5"
    }
  ]
}

Question: ${query}

Please ensure the direct_answer is comprehensive and informative, and each item in people_also_ask contains a relevant follow-up question with a concise but informative answer.`;

      // Make request to OpenRouter API (which routes to DeepSeek)
      const deepseekResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://ai-search-assistant.replit.app",
          "X-Title": "AI Search Assistant",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!deepseekResponse.ok) {
        const errorText = await deepseekResponse.text();
        console.error("OpenRouter API error:", errorText);
        throw new Error(`OpenRouter API error: ${deepseekResponse.status} ${deepseekResponse.statusText}`);
      }

      const deepseekData = await deepseekResponse.json();
      
      // Extract content from OpenRouter response
      const content = deepseekData.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No content received from OpenRouter API");
      }

      // Parse JSON response from AI
      let parsedResponse: SearchResponse;
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback if JSON parsing fails
          parsedResponse = {
            direct_answer: content,
            people_also_ask: [
              {
                question: "What are the key benefits of this topic?",
                answer: "This topic offers several advantages that can be beneficial in various contexts."
              },
              {
                question: "How does this compare to alternatives?",
                answer: "Each approach has its own strengths and considerations to evaluate."
              },
              {
                question: "What are the potential drawbacks?",
                answer: "Like any topic, there are some limitations and challenges to be aware of."
              },
              {
                question: "What should beginners know about this?",
                answer: "Starting with the fundamentals and basic concepts is usually the best approach."
              },
              {
                question: "What are the future trends in this area?",
                answer: "This field continues to evolve with new developments and innovations."
              }
            ]
          };
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        // Fallback response
        parsedResponse = {
          direct_answer: content,
          people_also_ask: [
            {
              question: "What are the key benefits of this topic?",
              answer: "This topic offers several advantages that can be beneficial in various contexts."
            },
            {
              question: "How does this compare to alternatives?",
              answer: "Each approach has its own strengths and considerations to evaluate."
            },
            {
              question: "What are the potential drawbacks?",
              answer: "Like any topic, there are some limitations and challenges to be aware of."
            },
            {
              question: "What should beginners know about this?",
              answer: "Starting with the fundamentals and basic concepts is usually the best approach."
            },
            {
              question: "What are the future trends in this area?",
              answer: "This field continues to evolve with new developments and innovations."
            }
          ]
        };
      }

      // Ensure response has the correct structure
      if (!parsedResponse.direct_answer) {
        parsedResponse.direct_answer = content;
      }
      if (!Array.isArray(parsedResponse.people_also_ask)) {
        parsedResponse.people_also_ask = [
          {
            question: "What are the key benefits of this topic?",
            answer: "This topic offers several advantages that can be beneficial in various contexts."
          },
          {
            question: "How does this compare to alternatives?",
            answer: "Each approach has its own strengths and considerations to evaluate."
          },
          {
            question: "What are the potential drawbacks?",
            answer: "Like any topic, there are some limitations and challenges to be aware of."
          },
          {
            question: "What should beginners know about this?",
            answer: "Starting with the fundamentals and basic concepts is usually the best approach."
          },
          {
            question: "What are the future trends in this area?",
            answer: "This field continues to evolve with new developments and innovations."
          }
        ];
      }

      res.json(parsedResponse);

    } catch (error) {
      console.error("Search API error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while processing your search request."
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
