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
      const prompt = `You are a helpful assistant that provides accurate information. Answer the user's question and provide related questions with answers.

User question: ${query}

Respond with ONLY a valid JSON object in this exact format:
{
  "direct_answer": "Write a clear, comprehensive answer to the user's question. Do not mention JSON, formatting, or structural terms. Provide only the factual response.",
  "people_also_ask": [
    {
      "question": "A relevant follow-up question",
      "answer": "A concise answer to that question"
    },
    {
      "question": "Another related question",
      "answer": "A brief but informative answer"
    },
    {
      "question": "Third related question",
      "answer": "Clear answer"
    },
    {
      "question": "Fourth related question", 
      "answer": "Direct answer"
    },
    {
      "question": "Fifth related question",
      "answer": "Helpful response"
    }
  ]
}

Important: The direct_answer should contain ONLY the factual response to the question, without any references to JSON, formatting, or meta-language. Write naturally as if speaking directly to the user.`;

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
        // Try to extract and clean JSON from the response
        let jsonText = content;
        
        // First try to find JSON object in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
        
        // Clean up common JSON formatting issues
        jsonText = jsonText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .trim();
        
        parsedResponse = JSON.parse(jsonText);
        
        // Validate that we have the expected structure
        if (!parsedResponse.direct_answer || !Array.isArray(parsedResponse.people_also_ask)) {
          throw new Error("Invalid response structure");
        }
        
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        
        // Try to extract direct answer from plain text if JSON parsing fails
        let directAnswer = content
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .replace(/\{.*?"direct_answer":\s*"/i, '')
          .replace(/".*?\[.*?\].*?\}/s, '')
          .replace(/^[\s\n"']+|[\s\n"']+$/g, '')
          .trim();
        
        if (!directAnswer || directAnswer.length < 10) {
          directAnswer = content;
        }
        
        // Fallback response with extracted or original content
        parsedResponse = {
          direct_answer: directAnswer,
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

      // Ensure response has the correct structure and clean up the direct answer
      if (!parsedResponse.direct_answer) {
        parsedResponse.direct_answer = content;
      }
      
      // Clean up the direct answer to remove unwanted terms and formatting
      parsedResponse.direct_answer = parsedResponse.direct_answer
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .replace(/^[\s\n]*{[\s\n]*"direct_answer":\s*"/i, '')
        .replace(/"[\s\n]*}[\s\n]*$/i, '')
        .replace(/(?:json|direct.?answer|people.?also.?ask)/gi, '')
        .replace(/^\s*["']/g, '')
        .replace(/["']\s*$/g, '')
        .trim();
      
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
