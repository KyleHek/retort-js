import { Agent } from "./agent";

export class Conversation {

    conversation = this;
    user = new Agent({ role: "user", action: "input" });
    assistant = new Agent({ role: "assistant", action: "generation" });
    system = new Agent({ role: "system", action: null });


}