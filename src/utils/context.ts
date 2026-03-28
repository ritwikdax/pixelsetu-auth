import { AsyncLocalStorage } from "async_hooks";
import { ContextStore } from "../interface.js";
import { AppError } from "../error/error.js";


class Context {
    private asyncLocalStorage: AsyncLocalStorage<ContextStore>;
    constructor() {
        this.asyncLocalStorage = new AsyncLocalStorage<ContextStore>();
    }
    run(ctx: ContextStore, callback: () => void) {
        this.asyncLocalStorage.run(ctx, callback);
    }
    get<K extends keyof ContextStore>(key: K): ContextStore[K] {
        const store = this.asyncLocalStorage.getStore();
        if (!store) {
            throw new AppError('No request context found', 'CONTEXT_NOT_FOUND');
        }
        if(!store[key]){
            throw new AppError(`No value found for key: ${key}`, 'CONTEXT_KEY_NOT_FOUND');
        }
        return store[key];
    }

    set<K extends keyof ContextStore>(key: K, value: ContextStore[K]) {
        const store = this.asyncLocalStorage.getStore();
        if (store) {
            store[key] = value;
        }
    }

    getLogContext(){
        const store = this.asyncLocalStorage.getStore();
        if (!store) {
            return {};
        }
        const { requestId, method, endpoint, email, activeOrgId, activeRole } = store;
        return { requestId, method, endpoint, email, activeOrgId, activeRole };
    }
}

export const context = new Context();