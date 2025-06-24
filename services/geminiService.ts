
import { GoogleGenAI, GenerateContentResponse, GenerateContentParameters } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import { OrchestrationResponse, Agent, SelectedOutputType, AgentCapability, AgentSuggestionResponse } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn(
    "API_KEY for Gemini is not configured in process.env.API_KEY. The application may not function correctly if the key is not available in the execution environment."
  );
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Updated System Instruction for Nexus Core (Gemini as Product Manager)
const NEXUS_CORE_SYSTEM_INSTRUCTION = `You are Nexus Core, the master orchestrator and "Product Manager" of the Zlitch Agent Development Kit.
Your primary role is to interpret user requests, consider their desired output type, and formulate a detailed execution plan involving specialized AI agents.
Users can define agents with specific capabilities: 'text', 'image', 'audio', 'code'. Each user-defined agent has its own 'systemPrompt' that dictates its personality and task execution style.

When you receive a user prompt and their 'selectedOutputType':
1.  **Analyze the Request:** Understand the user's overall goal and the specific type of output they desire ('text', 'image', 'audio', 'code', or 'auto-detect').
2.  **Formulate a Plan:**
    *   If 'auto-detect' or the request implies multiple steps, break it down into a sequence of sub-tasks.
    *   For each sub-task, determine the most suitable AGENT or CAPABILITY.
        *   **Prioritize User-Defined Agents:** If a user-defined agent (provided in the 'Available User-Defined Agents' list with its ID, name, capabilities, and its own systemPrompt) matches the required capability for a sub-task, YOU MUST use that agent's ID in the plan.
        *   **Generic Capabilities:** If no suitable user-defined agent exists, use a generic capability placeholder (e.g., 'generic-text-agent', 'generic-image-agent', 'generic-audio-agent', 'generic-code-agent').
    *   **Craft Task Descriptions:** For each step in the plan, the 'taskDescription' MUST be a PRECISE and COMPLETE prompt specifically for THAT agent or capability. If it's a user-defined agent, this 'taskDescription' is what will be fed to that agent, which will then operate under its OWN 'systemPrompt'. Do NOT assume Nexus Core's system prompt applies to the individual agents.
3.  **JSON Output Structure:** You MUST respond with a single, valid JSON object. Do NOT add any text outside this JSON block, including markdown fences.
    The JSON object structure:
    {
      "orchestrationPlan": {
        "summary": "A brief natural language summary of your overall plan and how you'll coordinate.",
        "steps": [
          {
            "agentId": "user_defined_agent_id_or_generic_capability_placeholder", // e.g., "agent-123", "generic-image-agent"
            "taskDescription": "The specific, complete prompt for this agent/task. This will be given to the agent, which uses its own systemPrompt.",
            "outputType": "text" | "image" | "audio" | "code", // The type of output this step will produce
            "status": "pending" // Initial status
          }
          // ... more steps if needed
        ]
      },
      "initialNexusResponse": "A concise, friendly message to the user acknowledging their request. This can include your summary."
    }
4.  **Direct Response (Simple Queries):** If the user's request is very simple (e.g., "hello", "what's the weather?") and does NOT require complex orchestration or a specific output type other than text, you MAY provide a direct answer. In this case, the JSON should be:
    {
      "directResponse": "Your direct, concise answer here."
    }
5.  **Specific Output Types:**
    *   **Image:** Use an agent/capability for 'image'. 'taskDescription' is the image generation prompt.
    *   **Audio:** Use an agent/capability for 'audio'. 'taskDescription' is the text to be narrated/synthesized.
    *   **Code:** Use an agent/capability for 'code'. 'taskDescription' is the detailed requirements for code generation or the code to be analyzed along with analysis instructions. The agent's own systemPrompt (if user-defined) will specify its coding language/style.
6.  **Clarity and Completeness:** Ensure 'taskDescription' for each step is self-contained and sufficient for the designated agent to perform its task, considering it will operate under its own system prompt.
Your goal is to be an effective Product Manager, creating clear, actionable plans for your team of AI agents.
`;

const AGENT_SETUP_ASSISTANT_SYSTEM_INSTRUCTION = `You are an Agent Setup Assistant for the Zlitch ADK.
Your role is to help users configure new AI agents by suggesting a name, description, system prompt, and capabilities based on their natural language description.
The available capabilities are: 'text', 'image', 'audio', 'code'.

When a user provides a description of an agent they want to create:
1.  **Analyze the Description:** Understand the core function, specialty, and purpose of the desired agent.
2.  **Suggest a Name:** Propose a concise and descriptive name for the agent.
3.  **Suggest a Description:** Write a brief description outlining the agent's purpose.
4.  **Suggest a System Prompt:** Craft a well-defined system prompt that would guide this agent's behavior. This system prompt should be from the perspective of the agent itself (e.g., "You are a Python expert specializing in data analysis...").
5.  **Suggest Capabilities:** Identify the most relevant capabilities from the list: 'text', 'image', 'audio', 'code'. It can be one or more.
6.  **JSON Output Structure:** You MUST respond with a single, valid JSON object. Do NOT add any text outside this JSON block, including markdown fences.
    The JSON object structure:
    {
      "suggestedName": "A concise agent name",
      "suggestedDescription": "A brief description of the agent.",
      "suggestedSystemPrompt": "A detailed system prompt for the agent's behavior.",
      "suggestedCapabilities": ["capability1", "capability2"] // e.g., ["text", "code"]
    }
Ensure your suggestions are practical and help the user set up a functional agent.
`;

class GeminiService {
  async generateOrchestrationPlan(
    prompt: string,
    availableAgents: {id: string, name: string, capabilities: AgentCapability[], systemPrompt: string}[],
    selectedOutputType: SelectedOutputType
  ): Promise<OrchestrationResponse> {
    if (!API_KEY) {
      return Promise.reject(new Error("API_KEY for Gemini is not configured."));
    }

    const contextForNexus = `
User Query: "${prompt}"
User's Desired Output Type: "${selectedOutputType}"

Available User-Defined Agents (use their 'id' in the plan if suitable, and note their 'systemPrompt' will guide their execution of your 'taskDescription'):
${availableAgents.length > 0 ? JSON.stringify(availableAgents.map(a => ({ id: a.id, name: a.name, capabilities: a.capabilities, agentSystemPrompt: a.systemPrompt /* Inform Nexus about agent's own context */ }))) : "No user-defined agents available."}

Please formulate a plan. Remember to respond ONLY with the JSON structure specified.
    `;

    const requestParams: GenerateContentParameters = {
        model: GEMINI_MODEL_NAME,
        contents: [{ parts: [{ text: contextForNexus }] }],
        config: {
          systemInstruction: NEXUS_CORE_SYSTEM_INSTRUCTION,
          temperature: 0.3, // Lower for more deterministic JSON
          topK: 40,
          topP: 0.9,
          responseMimeType: "application/json",
        }
      };

    let rawResponseText: string | undefined = undefined;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent(requestParams);
      rawResponseText = response.text;

      if (!rawResponseText || rawResponseText.trim() === "") {
         console.error("Gemini API (Orchestrator) returned empty, null, or undefined text.", response);
         return Promise.reject(new Error("Orchestrator returned an empty or invalid plan."));
      }

      let processedJsonString = rawResponseText.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = processedJsonString.match(fenceRegex);
      if (match && match[2]) {
        processedJsonString = match[2].trim();
      }

      const plan = JSON.parse(processedJsonString) as OrchestrationResponse;
      if (!plan.orchestrationPlan && !plan.directResponse) {
        console.warn("Orchestrator response missing critical fields:", plan);
        return Promise.reject(new Error("Orchestrator returned an invalid plan structure."));
      }
      return plan;
    } catch (error) {
      console.error("Error generating or parsing orchestration plan:", error, "Raw AI response text:", rawResponseText || "N/A (text not captured or error before text retrieval)");
      if (error instanceof SyntaxError) {
        return Promise.reject(new Error(`Failed to parse the orchestration plan from AI. The response was not valid JSON. Raw text: ${rawResponseText || 'N/A'}`));
      }
      if (error instanceof Error) {
        return Promise.reject(new Error(`Gemini API Error (Orchestration): ${error.message}`));
      }
      return Promise.reject(new Error("An unknown error occurred while generating the orchestration plan."));
    }
  }

  async generateImage(prompt: string): Promise<string> {
    if (!API_KEY) {
      return Promise.reject(new Error("API_KEY for Gemini is not configured."));
    }
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });

      if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
      } else {
        console.error("Imagen API did not return image bytes.", response);
        return Promise.reject(new Error("Failed to generate image or no image data received."));
      }
    } catch (error) {
      console.error("Error calling Imagen API:", error);
      if (error instanceof Error) {
        return Promise.reject(new Error(`Imagen API Error: ${error.message}`));
      }
      return Promise.reject(new Error("An unknown error occurred while generating the image."));
    }
  }

  async generateTextForAgent(taskPrompt: string, agentSystemPrompt?: string): Promise<string> {
     if (!API_KEY) {
      return Promise.reject(new Error("API_KEY for Gemini is not configured."));
    }

    const requestParams: GenerateContentParameters = {
      model: GEMINI_MODEL_NAME, // Could use a different model per agent if needed in future
      contents: [{ parts: [{ text: taskPrompt }] }],
      config: {
        ...(agentSystemPrompt && { systemInstruction: agentSystemPrompt }), // Apply agent-specific system prompt
        temperature: 0.7, // Allow more creativity for general text
        topK: 50,
        topP: 0.95,
      }
    };

    try {
      const response: GenerateContentResponse = await ai.models.generateContent(requestParams);
      if (response.text && response.text.trim() !== "") {
        return response.text;
      } else {
        console.warn("Gemini API (Agent Text Gen) returned empty or invalid text.", response);
        return Promise.reject(new Error("Agent received an empty response."));
      }
    } catch (error) {
      console.error("Error generating text for agent:", error);
      if (error instanceof Error) {
        return Promise.reject(new Error(`Gemini API Error (Agent Text Gen): ${error.message}`));
      }
      return Promise.reject(new Error("An unknown error occurred while agent was generating text."));
    }
  }

  async generateAgentDetailsFromDescription(userDescription: string): Promise<AgentSuggestionResponse> {
    if (!API_KEY) {
      return Promise.reject(new Error("API_KEY for Gemini is not configured."));
    }

    const requestParams: GenerateContentParameters = {
        model: GEMINI_MODEL_NAME,
        contents: [{ parts: [{ text: userDescription }] }],
        config: {
          systemInstruction: AGENT_SETUP_ASSISTANT_SYSTEM_INSTRUCTION,
          temperature: 0.5, // Moderately creative for suggestions
          topK: 40,
          topP: 0.9,
          responseMimeType: "application/json",
        }
      };
    
    let rawResponseText: string | undefined = undefined;
    try {
      const response: GenerateContentResponse = await ai.models.generateContent(requestParams);
      rawResponseText = response.text;

      if (!rawResponseText || rawResponseText.trim() === "") {
         console.error("Gemini API (Agent Setup Assistant) returned empty, null, or undefined text.", response);
         return Promise.reject(new Error("Agent Setup Assistant returned an empty or invalid response."));
      }
      
      let processedJsonString = rawResponseText.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = processedJsonString.match(fenceRegex);
      if (match && match[2]) {
        processedJsonString = match[2].trim();
      }
      
      const suggestions = JSON.parse(processedJsonString) as AgentSuggestionResponse;
       if (!suggestions.suggestedName || !suggestions.suggestedSystemPrompt || !suggestions.suggestedCapabilities) {
        console.warn("Agent Setup Assistant response missing critical fields:", suggestions);
        return Promise.reject(new Error("Agent Setup Assistant returned an invalid structure for suggestions."));
      }
      return suggestions;
    } catch (error) {
      console.error("Error generating or parsing agent details:", error, "Raw AI response text:", rawResponseText || "N/A");
       if (error instanceof SyntaxError) {
        return Promise.reject(new Error(`Failed to parse agent detail suggestions from AI. Raw text: ${rawResponseText || 'N/A'}`));
      }
      if (error instanceof Error) {
        return Promise.reject(new Error(`Gemini API Error (Agent Setup Assistant): ${error.message}`));
      }
      return Promise.reject(new Error("An unknown error occurred while generating agent detail suggestions."));
    }
  }
}

export const geminiService = new GeminiService();