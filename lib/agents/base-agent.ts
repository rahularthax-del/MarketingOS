import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { MessageParam } from "@anthropic-ai/sdk/resources/messages";

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}

export interface AgentResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  actions?: Array<{
    action: string;
    result: string;
    status: "success" | "error";
  }>;
}

export abstract class BaseAgent {
  public name: string;
  protected role: string;
  protected brandId: string;
  protected userId: string;

  constructor(name: string, role: string, brandId: string, userId: string) {
    this.name = name;
    this.role = role;
    this.brandId = brandId;
    this.userId = userId;
  }

  abstract getSystemPrompt(): string;
  abstract getTools(): ToolDefinition[];
  abstract executeTool(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string>;

  async run(userMessage: string): Promise<AgentResult> {
    const messages: MessageParam[] = [
      { role: "user", content: userMessage },
    ];

    const actions: Array<{
      action: string;
      result: string;
      status: "success" | "error";
    }> = [];

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-5-20251001",
          max_tokens: 4096,
          system: this.getSystemPrompt(),
          tools: this.getTools(),
          messages,
        });

        // Log the agent action
        if (response.content.length > 0) {
          const textContent = response.content.find((c) => c.type === "text");
          if (textContent && "text" in textContent) {
            await prisma.agentLog.create({
              data: {
                brandId: this.brandId,
                userId: this.userId,
                team: this.role.split("_")[0].toLowerCase(),
                agent: this.name,
                action: userMessage.substring(0, 100),
                reasoning: textContent.text.substring(0, 500),
                result: "",
                status: "success",
              },
            });
          }
        }

        // Check if agent wants to use tools
        const toolUses = response.content.filter((c) => c.type === "tool_use");

        if (toolUses.length === 0) {
          // Agent is done, extract final message
          const finalMessage = response.content
            .filter((c) => c.type === "text")
            .map((c) => ("text" in c ? c.text : ""))
            .join("\n");

          return {
            success: true,
            message: finalMessage,
            actions,
          };
        }

        // Execute tool calls
        const assistantContent = response.content;
        const toolResults: MessageParam = {
          role: "user",
          content: [],
        };

        for (const toolUse of toolUses) {
          if (toolUse.type !== "tool_use") continue;

          try {
            const result = await this.executeTool(
              toolUse.name,
              toolUse.input as Record<string, any>
            );

            actions.push({
              action: toolUse.name,
              result,
              status: "success",
            });

            (toolResults.content as any).push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: result,
            });
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);

            actions.push({
              action: toolUse.name,
              result: errorMsg,
              status: "error",
            });

            (toolResults.content as any).push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: `Error: ${errorMsg}`,
              is_error: true,
            });
          }
        }

        // Add assistant response and tool results to messages
        messages.push({ role: "assistant", content: assistantContent });
        messages.push(toolResults);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      // Log error
      await prisma.agentLog.create({
        data: {
          brandId: this.brandId,
          userId: this.userId,
          team: this.role.split("_")[0].toLowerCase(),
          agent: this.name,
          action: userMessage.substring(0, 100),
          result: errorMsg.substring(0, 500),
          status: "error",
        },
      });

      return {
        success: false,
        message: "Agent encountered an error",
        error: errorMsg,
        actions,
      };
    }
  }
}
