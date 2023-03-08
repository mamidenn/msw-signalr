import { v4 as randomUUID } from "@lukeed/uuid";
export function negotiate(version) {
    const response = {
        connectionId: randomUUID(),
        availableTransports: [
            {
                transport: "LongPolling",
                transferFormats: ["Text"],
            },
        ],
    };
    switch (version) {
        case 0:
            return { ...response, negotiateVersion: 0 };
        case 1:
            return {
                ...response,
                negotiateVersion: 1,
                connectionToken: randomUUID(),
            };
    }
}
//# sourceMappingURL=negotiate.js.map