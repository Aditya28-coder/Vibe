import { openai, createAgent } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";

import { inngest } from "./client";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("vibe-nextjs-adii-tests")
            return sandbox.sandboxId;
        })

        const summerizer = createAgent({
            name: "summerizer",
            system: "You are an expert summerizer.  You summerizer in 2 words.",
            model: openai({ model: "gpt-4o" }),
        });

        const { output } = await summerizer.run(
            `summerize the following text:${event.data.value}`,
        );

        const sandboxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandbox(sandboxId);
            const host = sandbox.getHost(3000);
            return `https://${host}`;
        })

        return { output, sandboxUrl };
    },
);